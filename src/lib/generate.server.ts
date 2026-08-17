import type { GenerationRow } from "@/lib/generation-types";

export async function renderImage(prompt: string, reference?: string): Promise<string | null> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return null;
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image",
        messages: [
          {
            role: "user",
            content: reference
              ? [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: reference } },
                ]
              : prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });
    if (!response.ok) {
      console.error("image gateway error", response.status, await response.text());
      return null;
    }
    const json = (await response.json()) as { data?: { b64_json?: string }[] };
    return json.data?.[0]?.b64_json ?? null;
  } catch (error) {
    console.error("image gateway exception", error);
    return null;
  }
}

export async function chatText(system: string, user: string): Promise<string | null> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return null;
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!response.ok) {
      console.error("chat gateway error", response.status, await response.text());
      return null;
    }
    const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content ?? null;
  } catch (error) {
    console.error("chat gateway exception", error);
    return null;
  }
}

export async function uploadDesign(userId: string, b64: string): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const path = `${userId}/${crypto.randomUUID()}.png`;
  const upload = await supabaseAdmin.storage.from("designs").upload(path, bytes, {
    contentType: "image/png",
  });
  if (upload.error) {
    console.error("upload error", upload.error);
    return null;
  }
  return path;
}

type RawRow = {
  id: string;
  prompt: string;
  mode: string;
  style: string;
  unlocked: boolean;
  created_at: string;
  image_url: string | null;
  favorite?: boolean | null;
  parent_id?: string | null;
  variation_group?: string | null;
};

export async function signRows(rows: RawRow[]): Promise<GenerationRow[]> {
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
        favorite: Boolean(row.favorite),
        parentId: row.parent_id ?? null,
        variationGroup: row.variation_group ?? null,
        url,
      };
    }),
  );
}

export const GENERATION_SELECT =
  "id, prompt, mode, style, unlocked, created_at, image_url, favorite, parent_id, variation_group";
