export type PlanKey = "starter" | "growth" | "studio";

export const PLAN_CREDITS: Record<PlanKey, number> = {
  starter: 72,
  growth: 288,
  studio: 864,
};

export const PLAN_PRICE: Record<PlanKey, number> = {
  starter: 4,
  growth: 15,
  studio: 25,
};

export const TOPUPS = [
  { id: "topup_small", credits: 60, price: 12 },
  { id: "topup_medium", credits: 200, price: 36 },
  { id: "topup_large", credits: 600, price: 99 },
] as const;

export const GENERATION_COST = 1;
export const UNLOCK_COST = 2;
export const REFINE_COST = 1;
export const CODE_EXPORT_COST = 2;
export const HANDOFF_COST = 1;
