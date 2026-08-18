import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export type PlanId = "starter" | "growth" | "studio";

export const PLANS: {
  id: PlanId;
  emoji: string;
  name: string;
  price: number;
  blurb: string;
  credits: number;
  flows: string;
  popular?: boolean;
}[] = [
  {
    id: "starter",
    emoji: "🌱",
    name: "Starter",
    price: 4,
    blurb: "Try it out — enough to design a real screen set and export it.",
    credits: 36,
    flows: "Up to 3 complete screen flows / month",
  },
  {
    id: "growth",
    emoji: "🚀",
    name: "Growth",
    price: 15,
    blurb: "For teams shipping app and web UI on a regular cadence.",
    credits:144 ,
    flows: "Up to 12 complete screen flows / month",
    popular: true,
  },
  {
    id: "studio",
    emoji: "👑",
    name: "Studio",
    price: 25,
    blurb: "For studios producing product design at volume.",
    credits: 240,
    flows: "Up to 20 complete screen flows / month",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-center text-sm font-extrabold uppercase tracking-[0.2em] text-primary">
        Pricing
      </p>
      <h2 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-extrabold leading-[1.02] sm:text-6xl">
        Your most efficient investment in <span className="text-primary">shipping</span>
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-center text-base text-muted-foreground">
        One plan covers screen generation, variants, design systems and full-resolution exports. No
        hidden fees — cancel anytime.
      </p>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-[28px] border p-8 ${
              plan.popular
                ? "border-primary/40 bg-gradient-to-b from-accent to-card shadow-[var(--shadow-soft)] lg:-mt-6 lg:mb-[-1.5rem]"
                : "border-border bg-card card-raised"
            }`}
          >
            {plan.popular ? (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-xs font-extrabold text-primary-foreground shadow-[var(--shadow-soft)]">
                ⭐ Most popular
              </span>
            ) : null}

            <div className="flex items-center gap-3">
              <span className="text-2xl">{plan.emoji}</span>
              <h3 className="text-2xl font-extrabold">{plan.name}</h3>
            </div>

            <div className="mt-5 flex items-end gap-1">
              <span className="font-display text-6xl font-extrabold tracking-tighter">
                ${plan.price}
              </span>
              <span className="pb-2 text-lg font-semibold text-muted-foreground">/mo</span>
            </div>

            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{plan.blurb}</p>

            <span className="mt-5 w-fit rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">
              🎉 +20% beta bonus credits
            </span>

            <div className="my-7 h-px bg-border" />

            <ul className="flex-1 space-y-4 text-[15px] font-medium">
              <li className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={3} />
                {plan.credits} credits every month
              </li>
              <li className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={3} />
                {plan.flows}
              </li>
            </ul>

            <Link
              to="/dashboard/billing"
              className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3.5 text-base font-extrabold ${
                plan.popular
                  ? "btn-press"
                  : "border border-border bg-card text-foreground shadow-[0_4px_0_0_var(--color-border)] transition-transform hover:translate-y-0.5"
              }`}
            >
              Choose {plan.name}
            </Link>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
        Prices in USD, billed monthly through Paddle — taxes and invoicing handled for you. Need
        more mid-cycle? Top up credits whenever, no plan change required.
      </p>
    </section>
  );
}
