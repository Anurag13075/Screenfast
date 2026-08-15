import { initializePaddle, type Paddle } from "@paddle/paddle-js";

import type { PlanKey } from "@/lib/plans";

const env = import.meta.env;

export const PADDLE_CLIENT_TOKEN = (env["VITE_PADDLE_CLIENT_TOKEN"] as string | undefined) ?? "";
export const PADDLE_ENVIRONMENT =
  ((env["VITE_PADDLE_ENVIRONMENT"] as string | undefined) ?? "sandbox") === "production"
    ? "production"
    : "sandbox";

export const PLAN_PRICE_IDS: Record<PlanKey, string> = {
  starter: (env["VITE_PADDLE_PRICE_STARTER"] as string | undefined) ?? "",
  growth: (env["VITE_PADDLE_PRICE_GROWTH"] as string | undefined) ?? "",
  studio: (env["VITE_PADDLE_PRICE_STUDIO"] as string | undefined) ?? "",
};

export const TOPUP_PRICE_IDS: Record<string, string> = {
  topup_small: (env["VITE_PADDLE_PRICE_TOPUP_SMALL"] as string | undefined) ?? "",
  topup_medium: (env["VITE_PADDLE_PRICE_TOPUP_MEDIUM"] as string | undefined) ?? "",
  topup_large: (env["VITE_PADDLE_PRICE_TOPUP_LARGE"] as string | undefined) ?? "",
};

export const paymentsConfigured = Boolean(PADDLE_CLIENT_TOKEN);

let paddlePromise: Promise<Paddle | undefined> | null = null;

export function getPaddle() {
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      token: PADDLE_CLIENT_TOKEN,
      environment: PADDLE_ENVIRONMENT,
    });
  }
  return paddlePromise;
}

export async function openCheckout(priceId: string, email: string, userId: string) {
  const paddle = await getPaddle();
  if (!paddle) throw new Error("paddle_unavailable");
  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: { email },
    customData: { user_id: userId },
    settings: {
      displayMode: "overlay",
      theme: "light",
      successUrl: `${window.location.origin}/dashboard/billing?checkout=success`,
    },
  });
}