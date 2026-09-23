---
title: "Automating Payment Recovery: Lessons from Stripe and Razorpay"
date: "2024-05-10"
description: "Implementing dunning management and smart retries to recover failed SaaS subscriptions before they churn."
tags: ["engineering", "saas"]
readingTime: "8 min read"
---

# Automating Payment Recovery: Lessons from Stripe and Razorpay

In SaaS, involuntary churn is a silent killer. A customer loves your product, uses it daily, but their credit card expires, or their bank blocks a recurring transaction. Without a robust payment recovery system (often called "dunning"), you lose that customer forever.

After integrating deeply with Stripe and Razorpay for global billing, we learned that recovering failed payments is not just about sending an email; it's a complex state machine of webhooks, grace periods, and smart retries.

## The Anatomy of a Failed Payment

When a recurring charge fails, the payment gateway triggers a webhook (e.g., `invoice.payment_failed` in Stripe). This is where your backend takes over. 

The naive approach is to immediately downgrade the user's account. **Do not do this.** 

Instead, the failure should transition the subscription into a `past_due` state, triggering your dunning lifecycle.

```typescript
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await db.subscriptions.findById(invoice.subscription);
  
  if (subscription.status === 'active') {
    await db.subscriptions.update(subscription.id, { 
      status: 'past_due',
      dunning_step: 1,
      grace_period_ends_at: addDays(new Date(), 14)
    });
    
    await emailService.sendCardUpdateReminder(subscription.userId);
  }
}
```

## Smart Retries vs. Dumb Retries

Both Stripe and Razorpay offer automatic retries, but relying solely on them leaves money on the table. Gateways often retry on a fixed schedule (e.g., Day 3, Day 5, Day 7). 

A "Smart Retry" engine uses machine learning to retry the charge at the optimal time. For example, if the card was declined due to insufficient funds, the best time to retry might be the 1st or 15th of the month when payroll typically clears. If it was a network error, retrying 12 hours later might work.

While Stripe provides Smart Retries out of the box (if enabled), you must ensure your application logic respects this schedule. Do not prematurely cancel the subscription while the gateway is still attempting to recover the funds.

## Grace Periods and Product Friction

During the `past_due` phase, how should the product behave? 

We employ a escalating friction model:
1. **Days 1-3 (Soft Warning):** A small, non-intrusive banner appears in the app. "Your last payment failed. Please update your card."
2. **Days 4-10 (Hard Warning):** A modal blocks the UI on login, forcing the user to acknowledge the failed payment before proceeding.
3. **Days 11-14 (Restricted Mode):** Core functionality is disabled, but the user can still access their data and the billing page.
4. **Day 15 (Cancellation):** The subscription is marked `canceled` and the webhook fires to finalize the teardown.

## Conclusion

Automating payment recovery is one of the highest-ROI engineering tasks you can take on. By effectively utilizing webhooks, respecting gateway retry schedules, and carefully designing your app's grace period experience, you can easily recover 30-40% of failed payments, directly impacting your bottom line.