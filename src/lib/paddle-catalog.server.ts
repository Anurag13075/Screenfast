import { PLAN_CREDITS, TOPUPS, type PlanKey } from "@/lib/plans";

export type CatalogEntry =
  | { kind: "plan"; plan: PlanKey; credits: number }
  | { kind: "topup"; id: string; credits: number };

/**
 * Maps Paddle price IDs to what the buyer receives.
 * Price IDs come from env vars so the same code works in sandbox and production.
 */
export function priceCatalog(): Record<string, CatalogEntry> {
  const map: Record<string, CatalogEntry> = {};

  const plans: [PlanKey, string | undefined][] = [
    ["starter", process.env["PADDLE_PRICE_STARTER"] ?? process.env["VITE_PADDLE_PRICE_STARTER"]],
    ["growth", process.env["PADDLE_PRICE_GROWTH"] ?? process.env["VITE_PADDLE_PRICE_GROWTH"]],
    ["studio", process.env["PADDLE_PRICE_STUDIO"] ?? process.env["VITE_PADDLE_PRICE_STUDIO"]],
  ];
  for (const [plan, priceId] of plans) {
    if (priceId) map[priceId] = { kind: "plan", plan, credits: PLAN_CREDITS[plan] };
  }

  const topups: [string, string | undefined][] = [
    ["topup_small", process.env["PADDLE_PRICE_TOPUP_SMALL"] ?? process.env["VITE_PADDLE_PRICE_TOPUP_SMALL"]],
    ["topup_medium", process.env["PADDLE_PRICE_TOPUP_MEDIUM"] ?? process.env["VITE_PADDLE_PRICE_TOPUP_MEDIUM"]],
    ["topup_large", process.env["PADDLE_PRICE_TOPUP_LARGE"] ?? process.env["VITE_PADDLE_PRICE_TOPUP_LARGE"]],
  ];
  for (const [id, priceId] of topups) {
    const topup = TOPUPS.find((t) => t.id === id);
    if (priceId && topup) map[priceId] = { kind: "topup", id, credits: topup.credits };
  }

  return map;
}
