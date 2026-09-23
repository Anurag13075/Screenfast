---
title: "Building Resilient Webhooks: What I Learned the Hard Way"
date: "2024-06-12"
description: "Architectural patterns for reliable webhook delivery, covering idempotency, signature verification, and exponential backoff."
tags: ["engineering", "frontend"]
readingTime: "8 min read"
---

# Building Resilient Webhooks: What I Learned the Hard Way

Webhooks are the connective tissue of modern APIs. Stripe tells you a payment succeeded, GitHub tells you a PR was merged. But consuming and emitting webhooks reliably is fraught with edge cases. Over the years, failing to handle webhooks correctly has caused double-billing issues, missed data synchronizations, and system crashes. Here is how to build them resiliently.

## Consuming Webhooks Correctly

When an external provider sends you a webhook, they expect a 2xx response immediately. If your server takes too long to process the payload, the provider will time out and retry, leading to duplicated work.

### 1. The Store-and-Forward Pattern

Never process webhook payloads synchronously in the HTTP handler. Instead, store the payload in a queue (SQS, RabbitMQ, or even a database table) and immediately return a `202 Accepted`.

```javascript
app.post('/webhook/stripe', async (req, res) => {
  const payload = req.body;
  
  // 1. Verify signature (do this first!)
  if (!verifySignature(req)) return res.status(401).send();

  // 2. Persist to a queue
  await queue.publish('webhook_events', payload);

  // 3. Acknowledge receipt immediately
  res.status(202).send('Accepted');
});
```

## Conclusion
Building resilient webhook systems requires embracing asynchronous processing, strict idempotency, and defensive architecture. Treat every incoming request as potentially duplicated, and every outgoing request as potentially failing, and your integration logic will remain robust at scale.