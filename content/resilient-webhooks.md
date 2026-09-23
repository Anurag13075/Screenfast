---
title: "Building Resilient Webhooks: What I Learned the Hard Way"
date: "2026-06-12"
description: "Webhooks seem simple until you process millions of them. A deep dive into idempotency, async processing, and surviving retry storms."
tags: ["engineering", "frontend", "backend"]
readingTime: "8 min read"
---

# Building Resilient Webhooks: What I Learned the Hard Way

On paper, webhooks are the simplest form of system integration. System A wants to notify System B that an event occurred, so it sends an HTTP POST request to a pre-defined URL. You write an Express or Flask route, parse the JSON body, update your database, and return a `200 OK`. Easy, right?

Unfortunately, this naive approach is a ticking time bomb. In distributed systems, networks fail, servers restart, and third-party vendors exhibit unpredictable behavior. When you are processing millions of webhooks a day, edge cases become everyday occurrences. 

In this post, I want to share the architectural principles necessary to build a resilient webhook receiver—lessons paid for in sweat, tears, and production outages.

## The Illusion of Synchronous Processing

The most common mistake engineers make is processing the webhook synchronously. The flow usually looks like this:
1. Receive POST request.
2. Query the database to find the user.
3. Call an external API (e.g., generate a PDF invoice).
4. Update the database.
5. Return `200 OK`.

This is a recipe for disaster. What happens if the external API in step 3 takes 15 seconds to respond? The webhook provider is waiting. Most webhook senders (like Stripe, GitHub, or Shopify) have strict timeout limits—usually between 3 and 10 seconds. If you don't respond in time, they assume the delivery failed and will attempt to retry.

### Personal Anecdote: The Black Friday Retry Storm

In 2023, during a massive Black Friday event, our primary payment processor started experiencing high latency. Our webhook receiver, which processed successful payments synchronously, began taking 12 seconds to respond. The processor's timeout was 5 seconds.

Because we exceeded the timeout, the processor assumed failure and retried the webhook. And retried again. Soon, we had thousands of overlapping requests trying to process the exact same payment events. This "retry storm" saturated our database connection pool, taking down our entire primary database. We had effectively self-inflicted a Denial of Service attack.

## Core Tenet 1: The "Accept and Defer" Pattern

To survive massive spikes and slow dependencies, you must decouple ingestion from processing. When a webhook arrives, you should do the absolute minimum amount of work necessary to validate it, persist it, and acknowledge it. 

1. **Accept:** Receive the payload, validate the signature.
2. **Defer:** Push the raw payload into a durable message queue (like AWS SQS, RabbitMQ, or Kafka).
3. **Acknowledge:** Immediately return a `202 Accepted`.

Your background workers then pull from the queue and perform the heavy lifting at their own pace. If a database is slow, the queue backs up, but your webhook endpoint remains lightning fast, preventing retry storms from the sender.

## Core Tenet 2: Strict Cryptographic Validation

You cannot trust the internet. If you have an endpoint at `api.example.com/webhooks/billing`, malicious actors will find it and send garbage data or attempt to spoof paid invoices. 

Webhook providers secure their payloads using Hash-based Message Authentication Codes (HMAC). The provider hashes the payload payload using a shared secret and includes the hash in a header (e.g., `X-Signature`).

**Crucial Edge Case:** You must compute the HMAC on the *exact raw bytes* of the incoming request. If your web framework parses the JSON before you compute the signature, minor differences in spacing or key ordering will cause the signature validation to fail.

Here is how you securely validate a Stripe webhook in Node.js, bypassing the JSON parser for that specific route:

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

// Use raw body parser ONLY for the webhook route
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    // We must use req.body which is a Buffer here, not a parsed object
    const event = constructEvent(req.body, signature, endpointSecret);
    
    // Push 'event' to SQS here...
    
    res.status(202).send('Accepted');
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

function constructEvent(payload, signature, secret) {
    // In reality, use the official SDK (e.g., stripe.webhooks.constructEvent)
    // This is the underlying principle:
    const expectedSig = crypto.createHmac('sha256', secret)
                              .update(payload)
                              .digest('hex');
    if (expectedSig !== signature) throw new Error('Invalid sig');
    return JSON.parse(payload.toString());
}
```

## Core Tenet 3: Idempotency is Mandatory

Because network requests can fail mid-flight, all robust webhook providers operate on a "at-least-once" delivery guarantee. This means you **will** receive duplicate webhooks. 

If you receive a "Payment Captured" webhook twice, you cannot apply the funds to the user's account twice. Your processing logic must be idempotent.

Idempotency requires storing a unique identifier provided by the webhook sender (usually an `event_id` or `delivery_id`) and checking it before processing.

### The Idempotency Key Implementation

A naive approach is checking the database: `SELECT * FROM processed_events WHERE id = ?`. However, in highly concurrent systems, two identical webhooks might hit your background workers at the exact same millisecond. Both query the database, both see the event hasn't been processed, and both proceed to grant the user credits.

To solve this race condition, you need an atomic distributed lock. Redis is excellent for this.

```javascript
const Redis = require('ioredis');
const redis = new Redis();

async function processWebhookWorker(event) {
  const eventId = event.id;
  
  // Attempt to set the key. NX = Only set if it doesn't exist.
  // EX = Expire in 24 hours (prevent infinite memory growth).
  const acquiredLock = await redis.set(`webhook:lock:${eventId}`, 'locked', 'NX', 'EX', 86400);

  if (!acquiredLock) {
    console.log(`Event ${eventId} is already processing or finished. Skipping.`);
    return; // Idempotent exit
  }

  try {
    // Perform the actual slow business logic here
    await grantUserCredits(event.userId, event.amount);
    
    // Mark as fully processed
    await redis.set(`webhook:done:${eventId}`, 'true', 'EX', 86400);
  } catch (error) {
    // If it fails, delete the lock so it can be retried
    await redis.del(`webhook:lock:${eventId}`);
    throw error; 
  }
}
```

## Edge Case: Out-of-Order Delivery

Webhooks are not guaranteed to arrive in the order they occurred. You might receive a `subscription.updated` event *before* you receive the `subscription.created` event. 

If your system assumes strict chronological ordering, out-of-order deliveries will cause massive data integrity issues or unhandled exceptions (e.g., trying to update a record that doesn't exist yet).

Handling this requires architectural foresight. One approach is the "Event Sourcing" pattern, where you simply append events to an immutable log and reconstruct state asynchronously. Another, simpler approach is maintaining a `last_updated_timestamp` on your database records. If an incoming webhook has an older timestamp than what is currently in your database, you safely discard it, acknowledging that you already possess a newer state.

## Conclusion

Building resilient webhooks is a masterclass in defensive programming. You must assume that senders will spam you, network connections will drop, and events will arrive twice or out of order. By adhering to the principles of asynchronous processing, strict cryptographic validation, and rock-solid idempotency, you can transform a fragile HTTP endpoint into a robust, enterprise-grade ingestion pipeline that scales effortlessly.