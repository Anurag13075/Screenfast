---
title: "Automating Payment Recovery: Lessons from Stripe and Razorpay"
date: "2026-05-10"
description: "Handling failed payments is one of the darkest corners of SaaS engineering. Here is our technical blueprint for building a resilient, automated payment recovery pipeline that saved us thousands in churned revenue."
tags: ["engineering", "saas"]
readingTime: "11 min read"
---

# Automating Payment Recovery: Lessons from Stripe and Razorpay

When you launch a SaaS product, you spend 99% of your time thinking about the "Happy Path": The user signs up, enters a valid credit card, you call the Stripe API, the payment succeeds, and the user gets access to the app. 

But as your user base scales, the Happy Path becomes a statistical minority. Credit cards expire. Banks reject transactions due to automated fraud rules. 3D Secure (3DS) authentication flows fail. Indian RBI guidelines require extra mandates. Subscriptions that have run flawlessly for two years suddenly return `insufficient_funds`.

In our first year, involuntary churn—users losing access simply because their payment failed and we didn't handle it gracefully—accounted for almost 30% of our total churn. 

Building an automated payment recovery (dunning) pipeline is not just a billing feature; it is a mission-critical distributed systems problem. In this post, I’ll outline the architecture we built to handle payment failures across Stripe and Razorpay, utilizing state machines, idempotent webhooks, and asynchronous retry queues.

## 1. The Anatomy of a Payment Failure

Payments do not fail uniformly. A failure can occur synchronously (while the user is staring at a loading spinner) or asynchronously (three days after a subscription renewal attempt). 

Understanding the *reason* for the failure dictates the engineering response:
- **Hard Declines:** Stolen card, closed account. You must immediately stop retrying and ask the user for a new payment method.
- **Soft Declines:** Insufficient funds, temporary bank downtime. These are highly recoverable through automated retries.
- **Authentication Required:** Strong Customer Authentication (SCA) in Europe or RBI mandate approvals in India. The payment requires the user to come back online and complete a 3D Secure challenge.

## 2. Webhooks are Your Source of Truth

Do not rely on the API response from your initial `createCharge` or `createSubscription` call as the final state of the payment. The only reliable way to know if a payment succeeded or failed is by listening to webhooks.

Both Stripe (`invoice.payment_failed`, `charge.failed`) and Razorpay (`payment.failed`, `subscription.charged`) send asynchronous webhooks.

However, webhooks present two major distributed systems challenges:
1. **Out of order delivery:** You might receive a `payment_failed` webhook *before* you receive the `invoice_created` webhook.
2. **Duplicate delivery:** Stripe guarantees "at least once" delivery. You *will* receive the same webhook twice.

### Idempotency and Database Locking

To handle duplicates and race conditions, every webhook handler must be strictly idempotent. 

We achieved this by storing every processed Webhook Event ID in a dedicated Postgres table. Before processing a payload, we attempt to insert the Event ID. If a unique constraint violation occurs, we safely ignore the webhook.

```typescript
async function handleStripeWebhook(event: Stripe.Event) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Idempotency Check
    const { rowCount } = await client.query(
      `INSERT INTO processed_webhooks (event_id, provider) 
       VALUES ($1, 'stripe') ON CONFLICT DO NOTHING`,
      [event.id]
    );
    
    if (rowCount === 0) {
      console.log(`Webhook ${event.id} already processed. Skipping.`);
      await client.query('ROLLBACK');
      return;
    }

    // 2. Lock the Invoice record to prevent race conditions
    // 'FOR UPDATE' ensures no other process can modify this invoice concurrently
    const invoiceId = event.data.object.id;
    const { rows } = await client.query(
      `SELECT * FROM invoices WHERE stripe_invoice_id = $1 FOR UPDATE`,
      [invoiceId]
    );
    
    const invoice = rows[0];
    
    // 3. Process the state transition
    await processPaymentFailedState(invoice, event.data.object);
    
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

The `SELECT ... FOR UPDATE` row-level lock is critical. If a user manually pays the invoice via the dashboard at the exact same millisecond the automated webhook arrives, the lock forces one transaction to wait, ensuring our state machine doesn't diverge.

## 3. The State Machine of an Invoice

An invoice shouldn't just be a boolean `paid: true | false`. It represents a workflow. We implemented an XState-inspired state machine in our backend to model the lifecycle of a bill.

Our states: `DRAFT` -> `OPEN` -> `PROCESSING` -> `REQUIRES_ACTION` -> `PAID` | `UNCOLLECTIBLE`.

When an `invoice.payment_failed` webhook hits, we transition the state based on the error code. 

If it's a soft decline (e.g., insufficient funds), we leave the invoice `OPEN` and schedule a retry.

## 4. Smart Retries and Exponential Backoff

Stripe's built-in "Smart Retries" are great, but relying solely on them means your backend is blind to the schedule. We decided to control the retry schedule on our side to synchronize it with our email system and app UI.

You shouldn't retry every hour. Banks employ fraud detection algorithms that will permanently blacklist a card if they see rapid, repeated failed attempts.

We built a worker queue (using Redis and BullMQ) that implements exponential backoff with jitter:
- Attempt 1: 1 day later
- Attempt 2: 3 days later
- Attempt 3: 7 days later

```typescript
// Enqueueing a retry with BullMQ
async function schedulePaymentRetry(invoiceId: string, attemptCount: number) {
  // Max 3 retries
  if (attemptCount >= 3) {
    await markInvoiceUncollectible(invoiceId);
    return;
  }

  // Calculate delay: e.g., 1 day, 3 days, 7 days
  const delays = [24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000];
  const delay = delays[attemptCount];

  // Add random jitter (± 2 hours) to prevent thundering herd if batching
  const jitter = (Math.random() - 0.5) * 2 * 60 * 60 * 1000;

  await paymentRetryQueue.add(
    'retry-capture',
    { invoiceId, attemptCount: attemptCount + 1 },
    { delay: delay + jitter }
  );
}
```

## 5. Navigating SCA and RBI Regulations (The "Requires Action" Flow)

The hardest technical challenge we faced was handling regional regulations, specifically European SCA (3D Secure) and Indian RBI recurring payment mandates (via Razorpay).

In these scenarios, the payment doesn't strictly "fail"—it enters a `REQUIRES_ACTION` state. The bank is saying, "I have the funds, but the user must open their banking app and authorize this."

Your automated backend cannot solve this. You must bring the user back into the loop.

When our webhook handler identifies an SCA failure, it triggers a multi-channel dunning workflow:
1. **Email:** "Action required to keep your subscription active." (Contains a unique, securely signed link to a Stripe Hosted Invoice page or Razorpay payment link).
2. **In-App Banner:** We push a WebSocket message to the client. If the user is currently using the app, a banner immediately drops down: "Your last payment requires authentication."
3. **Grace Period:** We don't instantly cut off access. We grant a 5-day grace period, stored in the database as `access_revoked_at`.

```typescript
// Updating the user's access profile
await client.query(
  `UPDATE subscriptions 
   SET status = 'past_due', 
       grace_period_ends_at = NOW() + INTERVAL '5 days'
   WHERE id = $1`,
  [subscriptionId]
);
```

During this grace period, API requests to our core services are checked against the `grace_period_ends_at` timestamp. If they pass the date without completing the 3DS challenge, the system automatically transitions their account to read-only mode.

## Conclusion

Building a custom payment recovery engine is tedious, unglamorous work. It involves wrestling with obscure bank error codes, edge-case webhook timing, and strict regional regulations. 

However, by treating payment failures as a first-class engineering problem rather than an afterthought, you plug a massive leak in your revenue bucket. A robust dunning pipeline, backed by idempotent webhooks and smart retries, operates silently in the background, recovering thousands of dollars while you focus on building your product.