import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { GENERATION_COST, UNLOCK_COST } from "@/lib/plans";
import { buildDesignPrompt } from "@/lib/prompt";

export type GenerationRow = {
  id: string;
  prompt: string;
  mode: "mobile" | "web" | "system";
  style: string;
  unlocked: boolean;
  created_at: string;
  url: string | null;
};

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [balance, subscription, profile] = await Promise.all([
      supabase.from("credit_balances").select("credits, plan").eq("user_id", userId).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("plan, status, current_period_end")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("profiles").select("display_name, avatar_url").eq("id", userId).maybeSingle(),
    ]);

    return {
      credits: balance.data?.credits ?? 0,
      plan: balance.data?.plan ?? "free",
      subscription: subscription.data ?? null,
      displayName: profile.data?.display_name ?? null,
      avatarUrl: profile.data?.avatar_url ?? null,
    };
  });

export const listLedger = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("credit_ledger")
      .select("id, delta, reason, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(25);
    return data ?? [];
  });

async function signRows(
  rows: { id: string; prompt: string; mode: string; style: string; unlocked: boolean; created_at: string; image_url: string | null }[],
): Promise<GenerationRow[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return Promise.all(
    rows.map(async (row) => {
      let url: string | null = null;
      if (row.image_url) {
        const { data } = await supabaseAdmin.storage
          .from("designs")
          .createSignedUrl(row.image_url, 60 * 60 * 24 * 7);
        url = data?.signedUrl ?? null;
      }
      return {
        id: row.id,
        prompt: row.prompt,
        mode: row.mode as GenerationRow["mode"],
        style: row.style,
        unlocked: row.unlocked,
        created_at: row.created_at,
        url,
      };
    }),
  );
}

export const listGenerations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("generations")
      .select("id, prompt, mode, style, unlocked, created_at, image_url")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(40);
    return signRows(data ?? []);
  });

const generateSchema = z.object({
  prompt: z.string().trim().min(6).max(600),
  mode: z.enum(["mobile", "web", "system"]),
  style: z.string().trim().min(2).max(40),
});

export const generateDesign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => generateSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true; generation: GenerationRow } | { ok: false; error: string }> => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const spend = await supabaseAdmin.rpc("spend_credits", {
      _user_id: userId,
      _amount: GENERATION_COST,
      _reason: "generation",
    });
    if (spend.error) {
      return { ok: false, error: "not_enough_credits" };
    }

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false, error: "ai_not_configured" };

    let b64: string | undefined;
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image",
          messages: [{ role: "user", content: buildDesignPrompt(data.prompt, data.mode, data.style) }],
          modalities: ["image", "text"],
        }),
      });
      if (!response.ok) {
        console.error("image gateway error", response.status, await response.text());
      } else {
        const json = (await response.json()) as { data?: { b64_json?: string }[] };
        b64 = json.data?.[0]?.b64_json;
      }
    } catch (error) {
      console.error("image gateway exception", error);
    }

    if (!b64) {
      await supabaseAdmin.rpc("grant_credits", {
        _user_id: userId,
        _amount: GENERATION_COST,
        _reason: "refund_failed_generation",
      });
      return { ok: false, error: "generation_failed" };
    }

    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const path = `${userId}/${crypto.randomUUID()}.png`;
    const upload = await supabaseAdmin.storage
      .from("designs")
      .upload(path, bytes, { contentType: "image/png" });
    if (upload.error) {
      console.error("upload error", upload.error);
      return { ok: false, error: "storage_failed" };
    }

    const insert = await supabaseAdmin
      .from("generations")
      .insert({
        user_id: userId,
        prompt: data.prompt,
        mode: data.mode,
        style: data.style,
        image_url: path,
      })
      .select("id, prompt, mode, style, unlocked, created_at, image_url")
      .single();

    if (insert.error || !insert.data) {
      return { ok: false, error: "save_failed" };
    }

    const [generation] = await signRows([insert.data]);
    return { ok: true, generation: generation! };
  });

export const unlockGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const owned = await context.supabase
      .from("generations")
      .select("id, unlocked")
      .eq("id", data.id)
      .maybeSingle();
    if (!owned.data) return { ok: false as const, error: "not_found" };
    if (owned.data.unlocked) return { ok: true as const };

    const spend = await supabaseAdmin.rpc("spend_credits", {
      _user_id: context.userId,
      _amount: UNLOCK_COST,
      _reason: "export_unlock",
      _reference: data.id,
    });
    if (spend.error) return { ok: false as const, error: "not_enough_credits" };

    await supabaseAdmin.from("generations").update({ unlocked: true }).eq("id", data.id);
    return { ok: true as const };
  });