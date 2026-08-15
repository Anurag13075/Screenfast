# UIforge — AI app design generator (Mascofast-grade UI)

A pixel-faithful rebuild of the mascofast.com experience, retargeted from mascots to **AI-generated app design**: mobile app screens, web app screens, and full design systems (colors, type, components + sample screens).

## Visual direction (non-negotiable, ported 1:1 from the reference)
- Full-bleed saturated hero background with heavy grain/dither texture (AI-generated), giant tight-tracked display headline with an inline glowing icon, floating pill badge above it ("3.2x faster shipping →").
- Dark rounded prompt console floating over the hero: textarea, Describe / Brainstorm segmented toggle, big orange gradient Generate button with sparkle.
- Floating blurred glass navbar that detaches on scroll (logo left, 4 links center, orange pill CTA right).
- "See it in Action" phone-mockup row: 4 realistic iPhone frames showing generated screens, staggered.
- Video/demo poster block, research stat cards with marquee of reaction chips, 3-column comparison-style How It Works, feature comparison table (Us / Freelancer / Templates / DIY), 3-tier pricing with "Most popular" raised card, accordion FAQ, founder closing quote.
- Same palette: electric blue + orange accent, off-white body sections, chunky rounded buttons with pressed 3D shadow, playful geometric-grotesque type.
- Dashboard shell copied from the reference: left sidebar (Designs, Brainstorm, Billing, Settings, Support), credit meter card at the bottom, user chip.

## Product
Three generator modes sharing one credit system:
1. **Mobile screens** — describe an app, get a set of iOS/Android screens.
2. **Web app screens** — dashboards, landing, auth, settings.
3. **Design system** — palette, type scale, component sheet + sample screens.

Generation is real: Lovable AI image models, streamed with progressive previews (blurred partials sharpening into the final render). Watermarked/low-res preview is free; **paying unlocks full-resolution download and export**.

## Payments (Paddle, merchant of record)
- Built-in Paddle integration — Paddle handles tax, invoicing, compliance, refunds. Nothing for you to manage.
- Plans mirrored from the reference: Starter $9 (72 credits, 6 flows), Growth $29 (288 credits, 24 flows, Most popular), Studio $89 (864 credits, 72 flows), all with the +20% beta bonus badge.
- Credit top-ups: Small $12 / 60, Medium $36 / 240 (Save 40%), Large $99 / 720 (Save 45%).
- Checkout via Paddle, webhook grants credits/subscription, billing page identical to the reference screenshots.
- Note: Paddle requires a Pro workspace plan. If enabling fails I will build everything and wire checkout the moment it is available.

## Backend (Lovable Cloud)
- Auth (email + Google), `profiles`, `credits_ledger`, `subscriptions`, `generations`, `exports` tables with RLS and grants.
- Server routes: streaming image generation, prompt brainstorm (chat model), Paddle checkout session, Paddle webhook under `/api/public/`.
- Credits deducted server-side on export/full-res unlock; preview generation rate-limited per free account.

## Pages
`/` landing (full reference composition), `/pricing`, `/login`, `/dashboard` (generator + gallery), `/dashboard/brainstorm`, `/dashboard/billing`, `/dashboard/settings`, `/dashboard/support`, `/terms`, `/refund`.

## Imagery
All visuals AI-generated: grainy hero mountain-style background, phone-screen mockups for each generator mode, style thumbnails, reaction icons, demo poster, founder avatar, favicon/logo mark.

## Build order
1. Design tokens + landing page (hero, console, phone row, stats, how-it-works, table, pricing, FAQ, footer) with generated imagery.
2. Cloud: auth, schema, credit ledger.
3. Generator: streaming AI image route, dashboard UI, free watermarked preview.
4. Paddle: enable, products, checkout, webhook, billing page, export unlock gate.
