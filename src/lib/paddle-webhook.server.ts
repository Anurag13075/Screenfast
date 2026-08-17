import { createHmac, timingSafeEqual } from "crypto";

import { priceCatalog } from "@/lib/paddle-catalog.server";

/** Verifies the `Paddle-Signature: ts=...;h1=...` header against the raw body. */
export function verifyPaddleSignature(header: string | null, rawBody: string, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(";").map((pair) => {
      const [key, ...rest] = pair.split("=");
      return [key?.trim() ?? "", rest.join("=").trim()];
    }),
  ) as Record<string, string>;

  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  // Reject replays older than 5 minutes.
  const age = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(age) || age > 300) return false;

  const expected = createHmac("sha256", secret).update(`${ts}:${rawBody}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(h1, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

type PaddleEvent = {
  event_id?: string;
  event_type?: string;
  data?: {
    id?: string;
    status?: string;
    subscription_id?: string | null;
    custom_data?: { user_id?: string } | null;
    customer?: { email?: string } | null;
    items?: { price?: { id?: string }; price_id?: string; quantity?: number }[];
    current_billing_period?: { ends_at?: string } | null;
    next_billed_at?: string | null;
  };
};

async function resolveUserId(event: PaddleEvent, email: string | null): Promise<string | null> {
  const fromCustom = event.data?.custom_data?.user_id;
  if (fromCustom) return fromCustom;
  if (!email) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // Fallback: match the paying customer's email to an existing account.
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

export async function handlePaddleEvent(event: PaddleEvent): Promise<{ ok: boolean; message: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const eventId = event.event_id ?? crypto.randomUUID();
  const eventType = event.event_type ?? "unknown";

  // Idempotency: the unique (provider, event_id) index makes replays a no-op.
  const seen = await supabaseAdmin
    .from("payment_events")
    .insert({ provider: "paddle", event_id: eventId, event_type: eventType, payload: event as never });
  if (seen.error) {
    if (seen.error.code === "23505") return { ok: true, message: "duplicate" };
    console.error("payment_events insert failed", seen.error);
  }

  const email = event.data?.customer?.email ?? null;
  const userId = await resolveUserId(event, email);
  if (!userId) return { ok: true, message: "no_matching_user" };

  const catalog = priceCatalog();
  const priceIds = (event.data?.items ?? [])
    .map((item) => item.price?.id ?? item.price_id)
    .filter((value): value is string => Boolean(value));

  if (eventType === "transaction.completed") {
    for (const priceId of priceIds) {
      const entry = catalog[priceId];
      if (!entry) continue;
      await supabaseAdmin.rpc("grant_credits", {
        _user_id: userId,
        _amount: entry.credits,
        _reason: entry.kind === "plan" ? `plan_${entry.plan}` : entry.id,
        _reference: eventId,
      });
      if (entry.kind === "plan") {
        await supabaseAdmin
          .from("credit_balances")
          .update({ plan: entry.plan, updated_at: new Date().toISOString() })
          .eq("user_id", userId);
      }
    }
    return { ok: true, message: "credits_granted" };
  }

  if (eventType.startsWith("subscription.")) {
    const entry = priceIds.map((id) => catalog[id]).find((value) => value?.kind === "plan");
    const status = eventType === "subscription.canceled" ? "canceled" : (event.data?.status ?? "active");
    await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: userId,
        plan: entry && entry.kind === "plan" ? entry.plan : "unknown",
        status,
        provider: "paddle",
        provider_ref: event.data?.id ?? null,
        current_period_end:
          event.data?.current_billing_period?.ends_at ?? event.data?.next_billed_at ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (status === "canceled" || status === "paused") {
      await supabaseAdmin.from("credit_balances").update({ plan: "free" }).eq("user_id", userId);
    }
    return { ok: true, message: "subscription_synced" };
  }

  return { ok: true, message: "ignored" };
}
