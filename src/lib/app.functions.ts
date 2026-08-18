import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isUnlimited, UNLIMITED_CREDITS } from "@/lib/entitlements";
import type { GenerationRow } from "@/lib/generation-types";
import {
  CODE_EXPORT_COST,
  GENERATION_COST,
  HANDOFF_COST,
  REFINE_COST,
  RESPONSIVE_SET_COST,
  UNLOCK_COST,
} from "@/lib/plans";
import { buildDesignPrompt, buildRefinePrompt, buildResponsivePrompt } from "@/lib/prompt";

export type { GenerationRow };

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const unlimited = isUnlimited(context.claims);
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
      unlimited,
      credits: unlimited ? UNLIMITED_CREDITS : (balance.data?.credits ?? 0),
      plan: unlimited ? "unlimited" : (balance.data?.plan ?? "free"),
      subscription: subscription.data ?? null,
      displayName: profile.data?.display_name ?? null,
      avatarUrl: profile.data?.avatar_url ?? null,
      email: typeof context.claims.email === "string" ? context.claims.email : null,
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

export const listGenerations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { GENERATION_SELECT, signRows } = await import("@/lib/generate.server");
    const { data } = await context.supabase
      .from("generations")
      .select(GENERATION_SELECT)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(120);
    return signRows(data ?? []);
  });

const generateSchema = z.object({
  prompt: z.string().trim().min(6).max(600),
  mode: z.enum(["mobile", "web", "system"]),
  style: z.string().trim().min(2).max(40),
  variations: z.number().int().min(1).max(4).optional(),
  reference: z.string().startsWith("data:image/").max(8_000_000).optional(),
});

export const generateDesign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => generateSchema.parse(input))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ ok: true; generations: GenerationRow[] } | { ok: false; error: string }> => {
      const { userId } = context;
      const unlimited = isUnlimited(context.claims);
      const count = data.variations ?? 1;
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { GENERATION_SELECT, renderImage, signRows, uploadDesign } = await import(
        "@/lib/generate.server"
      );

      if (!unlimited) {
        const spend = await supabaseAdmin.rpc("spend_credits", {
          _user_id: userId,
          _amount: GENERATION_COST * count,
          _reason: count > 1 ? "variations" : "generation",
        });
        if (spend.error) return { ok: false, error: "not_enough_credits" };
      }

      const group = count > 1 ? crypto.randomUUID() : null;
      const prompt = buildDesignPrompt(data.prompt, data.mode, data.style);
      const images = await Promise.all(
        Array.from({ length: count }, (_, index) =>
          renderImage(
            count > 1 ? `${prompt} Variation ${index + 1}: explore a distinct layout direction.` : prompt,
            data.reference,
          ),
        ),
      );

      const good = images.filter((value): value is string => Boolean(value));
      if (good.length === 0) {
        if (!unlimited) {
          await supabaseAdmin.rpc("grant_credits", {
            _user_id: userId,
            _amount: GENERATION_COST * count,
            _reason: "refund_failed_generation",
          });
        }
        return { ok: false, error: "generation_failed" };
      }

      if (!unlimited && good.length < count) {
        await supabaseAdmin.rpc("grant_credits", {
          _user_id: userId,
          _amount: GENERATION_COST * (count - good.length),
          _reason: "refund_partial_generation",
        });
      }

      const rows = [];
      for (const b64 of good) {
        const path = await uploadDesign(userId, b64);
        if (!path) continue;
        const insert = await supabaseAdmin
          .from("generations")
          .insert({
            user_id: userId,
            prompt: data.prompt,
            mode: data.mode,
            style: data.style,
            image_url: path,
            variation_group: group,
            ...(unlimited ? { unlocked: true } : {}),
          })
          .select(GENERATION_SELECT)
          .single();
        if (insert.data) rows.push(insert.data);
      }

      if (rows.length === 0) return { ok: false, error: "storage_failed" };
      return { ok: true, generations: await signRows(rows) };
    },
  );

export const refineDesign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), instruction: z.string().trim().min(3).max(400) }).parse(input),
  )
  .handler(
    async ({
      data,
      context,
    }): Promise<{ ok: true; generation: GenerationRow } | { ok: false; error: string }> => {
      const unlimited = isUnlimited(context.claims);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { GENERATION_SELECT, renderImage, signRows, uploadDesign } = await import(
        "@/lib/generate.server"
      );

      const parent = await context.supabase
        .from("generations")
        .select("id, prompt, mode, style, image_url")
        .eq("id", data.id)
        .maybeSingle();
      if (!parent.data?.image_url) return { ok: false, error: "not_found" };

      if (!unlimited) {
        const spend = await supabaseAdmin.rpc("spend_credits", {
          _user_id: context.userId,
          _amount: REFINE_COST,
          _reason: "refine",
          _reference: data.id,
        });
        if (spend.error) return { ok: false, error: "not_enough_credits" };
      }

      const download = await supabaseAdmin.storage.from("designs").download(parent.data.image_url);
      let referenceUrl: string | undefined;
      if (download.data) {
        const buffer = new Uint8Array(await download.data.arrayBuffer());
        let binary = "";
        for (const byte of buffer) binary += String.fromCharCode(byte);
        referenceUrl = `data:image/png;base64,${btoa(binary)}`;
      }

      const b64 = await renderImage(
        buildRefinePrompt(parent.data.prompt, parent.data.mode, parent.data.style, data.instruction),
        referenceUrl,
      );
      if (!b64) {
        if (!unlimited) {
          await supabaseAdmin.rpc("grant_credits", {
            _user_id: context.userId,
            _amount: REFINE_COST,
            _reason: "refund_failed_refine",
          });
        }
        return { ok: false, error: "generation_failed" };
      }

      const path = await uploadDesign(context.userId, b64);
      if (!path) return { ok: false, error: "storage_failed" };

      const insert = await supabaseAdmin
        .from("generations")
        .insert({
          user_id: context.userId,
          prompt: `${parent.data.prompt} — ${data.instruction}`,
          mode: parent.data.mode,
          style: parent.data.style,
          image_url: path,
          parent_id: parent.data.id,
          ...(unlimited ? { unlocked: true } : {}),
        })
        .select(GENERATION_SELECT)
        .single();
      if (!insert.data) return { ok: false, error: "save_failed" };
      const [generation] = await signRows([insert.data]);
      return { ok: true, generation: generation! };
    },
  );

export const unlockGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const unlimited = isUnlimited(context.claims);
    const owned = await context.supabase
      .from("generations")
      .select("id, unlocked")
      .eq("id", data.id)
      .maybeSingle();
    if (!owned.data) return { ok: false as const, error: "not_found" };
    if (owned.data.unlocked) return { ok: true as const };

    if (!unlimited) {
      const spend = await supabaseAdmin.rpc("spend_credits", {
        _user_id: context.userId,
        _amount: UNLOCK_COST,
        _reason: "export_unlock",
        _reference: data.id,
      });
      if (spend.error) return { ok: false as const, error: "not_enough_credits" };
    }

    await supabaseAdmin.from("generations").update({ unlocked: true }).eq("id", data.id);
    return { ok: true as const };
  });

export const exportCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), target: z.enum(["react", "html"]) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<{ ok: true; code: string } | { ok: false; error: string }> => {
    const unlimited = isUnlimited(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { chatText } = await import("@/lib/generate.server");

    const row = await context.supabase
      .from("generations")
      .select("prompt, mode, style, unlocked")
      .eq("id", data.id)
      .maybeSingle();
    if (!row.data) return { ok: false, error: "not_found" };
    if (!unlimited && !row.data.unlocked) return { ok: false, error: "locked" };

    if (!unlimited) {
      const spend = await supabaseAdmin.rpc("spend_credits", {
        _user_id: context.userId,
        _amount: CODE_EXPORT_COST,
        _reason: "code_export",
        _reference: data.id,
      });
      if (spend.error) return { ok: false, error: "not_enough_credits" };
    }

    const code = await chatText(
      "You are a senior front-end engineer. Output ONLY code, no prose, no markdown fences.",
      `Produce a production-ready ${data.target === "react" ? "React + Tailwind component" : "single HTML file with Tailwind CDN"} that implements this ${row.data.mode} UI design. Design brief: ${row.data.prompt}. Visual style: ${row.data.style}. Use semantic HTML, responsive layout, accessible contrast and realistic copy.`,
    );
    if (!code) {
      if (!unlimited) {
        await supabaseAdmin.rpc("grant_credits", {
          _user_id: context.userId,
          _amount: CODE_EXPORT_COST,
          _reason: "refund_failed_code_export",
        });
      }
      return { ok: false, error: "generation_failed" };
    }
    return { ok: true, code: code.replace(/^```[a-z]*\n?|```$/gm, "").trim() };
  });

export const buildHandoff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true; spec: string } | { ok: false; error: string }> => {
    const unlimited = isUnlimited(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { chatText } = await import("@/lib/generate.server");

    const row = await context.supabase
      .from("generations")
      .select("prompt, mode, style")
      .eq("id", data.id)
      .maybeSingle();
    if (!row.data) return { ok: false, error: "not_found" };

    if (!unlimited) {
      const spend = await supabaseAdmin.rpc("spend_credits", {
        _user_id: context.userId,
        _amount: HANDOFF_COST,
        _reason: "handoff_spec",
        _reference: data.id,
      });
      if (spend.error) return { ok: false, error: "not_enough_credits" };
    }

    const spec = await chatText(
      "You are a product design lead writing developer handoff docs in clean markdown.",
      `Write a developer handoff spec for this ${row.data.mode} design: "${row.data.prompt}" in a ${row.data.style} style. Include: screen purpose, layout structure, component inventory, spacing scale, type scale, colour tokens with hex values, interaction states, accessibility notes and edge cases.`,
    );
    if (!spec) return { ok: false, error: "generation_failed" };
    return { ok: true, spec };
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), favorite: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("generations")
      .update({ favorite: data.favorite })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    return { ok: true as const };
  });

export const deleteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("generations")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    return { ok: true as const };
  });

export const getCanvas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("canvas_state")
      .select("data")
      .eq("user_id", context.userId)
      .maybeSingle();
    return JSON.stringify(data?.data ?? {});
  });

export const saveCanvas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ data: z.string().max(500_000) }).parse(input))
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("canvas_state")
      .upsert(
        { user_id: context.userId, data: JSON.parse(data.data) as never, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    return { ok: true as const };
  });

const styleGridSchema = z.object({
  prompt: z.string().trim().min(6).max(600),
  mode: z.enum(["mobile", "web", "system"]),
  styles: z.array(z.string().trim().min(2).max(40)).min(2).max(4),
  reference: z.string().startsWith("data:image/").max(8_000_000).optional(),
});

export const generateStyleGrid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => styleGridSchema.parse(input))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ ok: true; generations: GenerationRow[] } | { ok: false; error: string }> => {
      const { userId } = context;
      const unlimited = isUnlimited(context.claims);
      const count = data.styles.length;
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { GENERATION_SELECT, renderImage, signRows, uploadDesign } = await import(
        "@/lib/generate.server"
      );

      if (!unlimited) {
        const spend = await supabaseAdmin.rpc("spend_credits", {
          _user_id: userId,
          _amount: GENERATION_COST * count,
          _reason: "style_grid",
        });
        if (spend.error) return { ok: false, error: "not_enough_credits" };
      }

      const group = crypto.randomUUID();

      const images = await Promise.all(
        data.styles.map((style) =>
          renderImage(buildDesignPrompt(data.prompt, data.mode, style), data.reference),
        ),
      );

      const good = images
        .map((b64, index) => ({ b64, style: data.styles[index]! }))
        .filter((row): row is { b64: string; style: string } => Boolean(row.b64));

      if (good.length === 0) {
        if (!unlimited) {
          await supabaseAdmin.rpc("grant_credits", {
            _user_id: userId,
            _amount: GENERATION_COST * count,
            _reason: "refund_failed_style_grid",
          });
        }
        return { ok: false, error: "generation_failed" };
      }

      if (!unlimited && good.length < count) {
        await supabaseAdmin.rpc("grant_credits", {
          _user_id: userId,
          _amount: GENERATION_COST * (count - good.length),
          _reason: "refund_partial_style_grid",
        });
      }

      const rows = [];
      for (const { b64, style } of good) {
        const path = await uploadDesign(userId, b64);
        if (!path) continue;
        const insert = await supabaseAdmin
          .from("generations")
          .insert({
            user_id: userId,
            prompt: data.prompt,
            mode: data.mode,
            style,
            image_url: path,
            variation_group: group,
            ...(unlimited ? { unlocked: true } : {}),
          })
          .select(GENERATION_SELECT)
          .single();
        if (insert.data) rows.push(insert.data);
      }

      if (rows.length === 0) return { ok: false, error: "storage_failed" };
      return { ok: true, generations: await signRows(rows) };
    },
  );

const responsiveSetSchema = z.object({
  id: z.string().uuid(),
  breakpoints: z.array(z.enum(["mobile", "tablet", "desktop"])).min(1).max(3),
});

export const generateResponsiveSet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => responsiveSetSchema.parse(input))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ ok: true; generations: GenerationRow[] } | { ok: false; error: string }> => {
      const unlimited = isUnlimited(context.claims);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { GENERATION_SELECT, renderImage, signRows, uploadDesign } = await import(
        "@/lib/generate.server"
      );

      const parent = await context.supabase
        .from("generations")
        .select("id, prompt, mode, style, image_url")
        .eq("id", data.id)
        .maybeSingle();
      if (!parent.data?.image_url) return { ok: false, error: "not_found" };

      const count = data.breakpoints.length;
      if (!unlimited) {
        const spend = await supabaseAdmin.rpc("spend_credits", {
          _user_id: context.userId,
          _amount: RESPONSIVE_SET_COST * count,
          _reason: "responsive_set",
          _reference: data.id,
        });
        if (spend.error) return { ok: false, error: "not_enough_credits" };
      }

      const download = await supabaseAdmin.storage.from("designs").download(parent.data.image_url);
      let referenceUrl: string | undefined;
      if (download.data) {
        const buffer = new Uint8Array(await download.data.arrayBuffer());
        let binary = "";
        for (const byte of buffer) binary += String.fromCharCode(byte);
        referenceUrl = `data:image/png;base64,${btoa(binary)}`;
      }

      const group = crypto.randomUUID();
      const images = await Promise.all(
        data.breakpoints.map((breakpoint) =>
          renderImage(
            buildResponsivePrompt(parent.data!.prompt, parent.data!.style, breakpoint),
            referenceUrl,
          ),
        ),
      );

      const good = images
        .map((b64, index) => ({ b64, breakpoint: data.breakpoints[index]! }))
        .filter((row): row is { b64: string; breakpoint: (typeof data.breakpoints)[number] } =>
          Boolean(row.b64),
        );

      if (good.length === 0) {
        if (!unlimited) {
          await supabaseAdmin.rpc("grant_credits", {
            _user_id: context.userId,
            _amount: RESPONSIVE_SET_COST * count,
            _reason: "refund_failed_responsive_set",
          });
        }
        return { ok: false, error: "generation_failed" };
      }

      if (!unlimited && good.length < count) {
        await supabaseAdmin.rpc("grant_credits", {
          _user_id: context.userId,
          _amount: RESPONSIVE_SET_COST * (count - good.length),
          _reason: "refund_partial_responsive_set",
        });
      }

      const rows = [];
      for (const { b64, breakpoint } of good) {
        const path = await uploadDesign(context.userId, b64);
        if (!path) continue;
        const insert = await supabaseAdmin
          .from("generations")
          .insert({
            user_id: context.userId,
            prompt: parent.data.prompt,
            mode: parent.data.mode,
            style: parent.data.style,
            image_url: path,
            parent_id: parent.data.id,
            variation_group: group,
            breakpoint,
            ...(unlimited ? { unlocked: true } : {}),
          })
          .select(GENERATION_SELECT)
          .single();
        if (insert.data) rows.push(insert.data);
      }

      if (rows.length === 0) return { ok: false, error: "storage_failed" };
      return { ok: true, generations: await signRows(rows) };
    },
  );
