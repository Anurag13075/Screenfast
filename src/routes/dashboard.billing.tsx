import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { getAccount, listLedger } from "@/lib/app.functions";
import { openCheckout, paymentsConfigured, PLAN_PRICE_IDS, TOPUP_PRICE_IDS } from "@/lib/paddle";
import { PLAN_CREDITS, PLAN_PRICE, TOPUPS, type PlanKey } from "@/lib/plans";

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingPage,
});

const PLAN_META: { id: PlanKey; emoji: string; name: string; blurb: string }[] = [
  { id: "starter", emoji: "🌱", name: "Starter", blurb: "Enough to design a real screen set." },
  { id: "growth", emoji: "🚀", name: "Growth", blurb: "For teams shipping UI every week." },
  { id: "studio", emoji: "👑", name: "Studio", blurb: "Production design at volume." },
];

function BillingPage() {
  const { user } = useAuth();
  const account = useQuery({ queryKey: ["account"], queryFn: () => getAccount() });
  const ledger = useQuery({ queryKey: ["ledger"], queryFn: () => listLedger() });

  async function checkout(priceId: string) {
    if (!paymentsConfigured || !priceId) {
      toast.error("Payments aren't connected yet.");
      return;
    }
    try {
      await openCheckout(priceId, user?.email ?? "", user?.id ?? "");
    } catch {
      toast.error("Could not open checkout");
    }
  }

  const currentPlan = account.data?.plan ?? "free";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-border bg-card p-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Current plan: <span className="font-bold capitalize text-foreground">{currentPlan}</span>
          </p>
        </div>
        <div className="rounded-2xl bg-accent px-4 py-2.5 text-sm font-extrabold text-accent-foreground">
          {account.data?.credits ?? 0} credits
        </div>
      </header>

      {!paymentsConfigured ? (
        <div className="rounded-[26px] border border-primary/30 bg-accent p-6 text-sm font-semibold">
          Payments aren't connected yet. Add your Paddle keys and price IDs to start taking live
          payments.
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-3">
        {PLAN_META.map((plan) => {
          const active = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-[26px] border p-7 ${
                plan.id === "growth" ? "border-primary/40 bg-accent" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{plan.emoji}</span>
                <h2 className="text-xl font-extrabold">{plan.name}</h2>
              </div>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-5xl font-extrabold tracking-tighter">
                  ${PLAN_PRICE[plan.id]}
                </span>
                <span className="pb-1.5 font-semibold text-muted-foreground">/mo</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{plan.blurb}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm font-medium">
                <li className="flex gap-2.5">
                  <Check className="h-5 w-5 shrink-0 text-primary" strokeWidth={3} />
                  {PLAN_CREDITS[plan.id]} credits / month
                </li>
                <li className="flex gap-2.5">
                  <Check className="h-5 w-5 shrink-0 text-primary" strokeWidth={3} />
                  Full-resolution exports
                </li>
              </ul>
              <button
                onClick={() => checkout(PLAN_PRICE_IDS[plan.id])}
                disabled={active}
                className="btn-press mt-7 rounded-full px-6 py-3 text-sm font-extrabold disabled:opacity-50"
              >
                {active ? "Current plan" : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </section>

      <section className="rounded-[26px] border border-border bg-card p-7">
        <h2 className="font-display text-2xl font-extrabold">Buy more credits</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          One-time top-ups. They never expire while your plan is active.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {TOPUPS.map((topup) => (
            <div key={topup.id} className="rounded-2xl border border-border p-5">
              <div className="font-display text-3xl font-extrabold">{topup.credits}</div>
              <div className="text-sm font-bold text-muted-foreground">credits</div>
              <button
                onClick={() => checkout(TOPUP_PRICE_IDS[topup.id] ?? "")}
                className="btn-press mt-5 w-full rounded-full px-4 py-2.5 text-sm font-extrabold"
              >
                ${topup.price}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] border border-border bg-card p-7">
        <h2 className="font-display text-2xl font-extrabold">Credit history</h2>
        <div className="mt-5 divide-y divide-border">
          {(ledger.data ?? []).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-semibold capitalize">{entry.reason.replace(/_/g, " ")}</span>
              <span className="flex items-center gap-4 text-muted-foreground">
                {new Date(entry.created_at).toLocaleDateString()}
                <span
                  className={`font-extrabold ${entry.delta > 0 ? "text-primary" : "text-foreground"}`}
                >
                  {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                </span>
              </span>
            </div>
          ))}
          {(ledger.data ?? []).length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">No credit activity yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}