# Screenfast

**From idea to shippable app UI in minutes.**

Screenfast is an AI-powered design generation tool that turns a text prompt into mobile app screens, web dashboards, and full design systems — no design team required. Generate, refine, and export full-resolution UI mockups, or hand off complete design tokens (colors, type scales, components) straight to your developers.

🔗 **Live site:** [screenfast.site](https://screenfast.site)

---

## Features

- **Prompt-to-screens** — describe your product in one sentence, pick a visual style (minimal, brutalist, glassy, dark premium), and generate a coherent set of app/web screens
- **Design systems** — generate consistent color tokens, type scales, buttons, inputs, and cards across every screen
- **Full-resolution export** — unlock and download production-ready assets
- **Code export** — export generated designs as React or HTML
- **Handoff specs** — generate developer-ready handoff documentation
- **Credit-based billing** — subscription plans with monthly credit allowances, plus one-time top-ups
- **Refine flow** — iterate on generated designs without starting over

## Tech Stack

- **Frontend:** React + TypeScript, [TanStack Router](https://tanstack.com/router) (file-based routing)
- **Styling:** Tailwind CSS
- **Payments/Billing:** [Paddle](https://www.paddle.com) (Merchant of Record — handles payments, tax, and invoicing)
- **Hosting:** [Vercel](https://vercel.com)

## Credit System

| Action | Cost |
|---|---|
| Generate a design | 1 credit |
| Refine a design | 1 credit |
| Create handoff spec | 1 credit |
| Unlock full-resolution export | 2 credits |
| Export code (React or HTML) | 2 credits |

Subscription credits refresh at the start of each billing period. Top-up credits are one-time purchases and don't expire while your plan is active. Failed generations are refunded automatically.

## Pricing

| Plan | Price | Credits/mo | Screen Flows/mo |
|---|---|---|---|
| Starter | $9/mo | 72 | Up to 6 |
| Growth | $29/mo | 288 | Up to 24 |
| Studio | $89/mo | 864 | Up to 72 |

All plans billed monthly through Paddle. Taxes and invoicing handled automatically.

## Getting Started (Development)

### Prerequisites

- Node.js 18+
- pnpm / npm / yarn (match your project's package manager)

### Setup

```bash
# Clone the repo
git clone https://github.com/Anurag13075/screenfast.git
cd screenfast

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your Paddle API keys, vendor ID, and any other required secrets

# Run the dev server
npm run dev
```

The app will be available at `http://localhost:3000` (or whichever port your dev server uses).

### Environment Variables

```env
PADDLE_VENDOR_ID=
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
# Add any other required keys (auth, database, AI generation provider, etc.)
```

> Update this section with your actual required env vars once finalized.

### Build

```bash
npm run build
```

### Deploy

The project is configured for zero-config deployment on [Vercel](https://vercel.com):

```bash
vercel --prod
```

Or connect the GitHub repo directly in the Vercel dashboard for automatic deployments on push.

## Project Structure

```
src/
├── routes/           # TanStack Router file-based routes
│   ├── index.tsx     # Landing page
│   ├── pricing.tsx   # Pricing page
│   ├── terms.tsx     # Terms of Service
│   ├── privacy.tsx   # Privacy Policy
│   ├── refund.tsx    # Refund Policy
│   ├── support.tsx   # Support / FAQ
│   └── dashboard/    # Authenticated dashboard + billing
├── components/
│   ├── site/         # Navbar, Footer, shared site components
│   └── ui/           # Reusable UI primitives
└── ...
```

> Adjust this tree to match your actual folder layout.

## Billing & Payments

Screenfast uses **Paddle** as its Merchant of Record, which means Paddle handles:

- Payment processing (cards, PayPal, and other regional methods)
- Sales tax / VAT calculation, collection, and remittance
- Invoicing
- Subscription lifecycle (upgrades, downgrades, cancellations, dunning)

See [Terms of Service](https://screenfast.site/terms), [Refund Policy](https://screenfast.site/refund), and [Privacy Policy](https://screenfast.site/privacy) for details.

## Support

Questions about billing, credits, or generations? Reach out at **anuragf863@gmail.com** — we aim to respond within one business day. You can also use the in-app support form on the [Support page](https://screenfast.site/support).

## License

> Add your license here (MIT, proprietary, etc.) depending on whether this repo is open source.

## Author

Built by [Anurag](https://github.com/Anurag13075) — solo full-stack/AI developer.

- X: [@AnuragShar74342](https://x.com/AnuragShar74342)
- GitHub: [github.com/Anurag13075](https://github.com/Anurag13075)
