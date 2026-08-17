# Screenfast — Payments setup (Paddle)

Paddle is the Merchant of Record: it handles tax, invoices, refunds and compliance for you.
Everything is paywalled by default — new accounts get **0 credits** and must buy a plan or a top-up.
Only the override email (`assainegaming@gmail.com`, see `src/lib/entitlements.ts`) has unlimited free access,
enforced server-side from the verified JWT.

## 1. Create the catalogue in Paddle

Dashboard → Catalog → Products. Create one product ("Screenfast credits") and these **prices**:

| Price               | Type         | Amount | Credits |
| ------------------- | ------------ | ------ | ------- |
| Starter             | Subscription | $9/mo  | 72      |
| Growth              | Subscription | $29/mo | 288     |
| Studio              | Subscription | $89/mo | 864     |
| Top-up small        | One-time     | $12    | 60      |
| Top-up medium       | One-time     | $36    | 200     |
| Top-up large        | One-time     | $99    | 600     |

Copy each `pri_...` id. (Credit amounts live in `src/lib/plans.ts` — keep them in sync.)

## 2. Get your keys

- **Client-side token** — Developer tools → Authentication → Client-side tokens (`live_...` or `test_...`).
- **Webhook secret** — created in step 4 (`pdl_ntfset_...` secret key).
- Approve your domain: Checkout → Website approval (add `localhost` for local dev and your production domain).

## 3. Environment variables

Client (must be `VITE_` prefixed, they are public by design):

```
VITE_PADDLE_CLIENT_TOKEN=test_xxx
VITE_PADDLE_ENVIRONMENT=sandbox        # or: production
VITE_PADDLE_PRICE_STARTER=pri_xxx
VITE_PADDLE_PRICE_GROWTH=pri_xxx
VITE_PADDLE_PRICE_STUDIO=pri_xxx
VITE_PADDLE_PRICE_TOPUP_SMALL=pri_xxx
VITE_PADDLE_PRICE_TOPUP_MEDIUM=pri_xxx
VITE_PADDLE_PRICE_TOPUP_LARGE=pri_xxx
```

Server (secret — never in the client bundle):

```
PADDLE_WEBHOOK_SECRET=pdl_ntfset_xxx
# optional, only if the server-side price ids differ from the VITE_ ones
PADDLE_PRICE_STARTER=pri_xxx
PADDLE_PRICE_GROWTH=pri_xxx
PADDLE_PRICE_STUDIO=pri_xxx
PADDLE_PRICE_TOPUP_SMALL=pri_xxx
PADDLE_PRICE_TOPUP_MEDIUM=pri_xxx
PADDLE_PRICE_TOPUP_LARGE=pri_xxx
```

- **Local:** put all of the above in `.env` at the project root, then `npm run dev`.
- **On Lovable:** the `PADDLE_WEBHOOK_SECRET` (and any other server value) is stored as a project secret —
  ask in chat and it is added to the secure secret store; the `VITE_` values are added the same way and injected at build.

## 4. Register the webhook

Paddle → Developer tools → Notifications → New destination:

- URL (production): `https://project--8b76cde1-b693-4b78-8d10-a58f2bc6d346.lovable.app/api/public/paddle-webhook`
- URL (preview): `https://project--8b76cde1-b693-4b78-8d10-a58f2bc6d346-dev.lovable.app/api/public/paddle-webhook`
- Local testing: expose port 8080 with a tunnel, e.g. `npx localtunnel --port 8080`, and use
  `https://<tunnel-host>/api/public/paddle-webhook`.
- Events to subscribe: `transaction.completed`, `subscription.created`, `subscription.updated`,
  `subscription.canceled`, `subscription.paused`, `subscription.resumed`.
- Copy the generated secret key into `PADDLE_WEBHOOK_SECRET`.

`GET` on the same URL returns `{"ok":true}` — a quick way to confirm the endpoint is reachable.

## 5. How the money loop works

1. The billing page (`src/routes/dashboard.billing.tsx`) opens the Paddle overlay checkout via
   `src/lib/paddle.ts`, passing `customData: { user_id }` so the payment can be matched to the account.
2. Paddle charges the customer and POSTs the event to `/api/public/paddle-webhook`
   (`src/routes/api/public/paddle-webhook.ts`).
3. The handler (`src/lib/paddle-webhook.server.ts`):
   - verifies the `Paddle-Signature` HMAC over the raw body and rejects anything older than 5 minutes,
   - writes the event to `payment_events` (unique `event_id`) so replays are ignored,
   - resolves the user from `custom_data.user_id`, falling back to the customer email,
   - grants credits via the `grant_credits` database function and updates the plan,
   - upserts the row in `subscriptions` for subscription events (cancel/pause drops the plan back to `free`).
4. Credits are spent server-side only: generate 1, variation 1 each, AI edit 1, handoff spec 1,
   unlock export 2, code export 2 — all in `src/lib/app.functions.ts`.

## 6. Test checklist (sandbox)

1. Set `VITE_PADDLE_ENVIRONMENT=sandbox` and the sandbox token/prices.
2. Sign up with a fresh email → you land on the dashboard with 0 credits and everything paywalled.
3. Buy the Starter plan with Paddle's test card `4242 4242 4242 4242`, any future expiry, CVC `100`.
4. Paddle → Notifications → the delivery should be `200`. The credits appear on the billing page within seconds.
5. Cancel the subscription in Paddle and confirm the plan flips back to `free`.

## 7. Going live

- Complete Paddle's seller verification (required before live payments).
- Swap the token, prices and `VITE_PADDLE_ENVIRONMENT=production`, create a **live** notification destination
  and replace `PADDLE_WEBHOOK_SECRET` with the live one.
- Approve your production domain in Paddle checkout settings.
- Publish the app so the production webhook URL serves the latest build.
