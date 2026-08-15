import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Download, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { getAccount, generateDesign, listGenerations, unlockGeneration } from "@/lib/app.functions";
import { GENERATION_COST, UNLOCK_COST } from "@/lib/plans";

export const Route = createFileRoute("/dashboard/")({
  component: GeneratePage,
});

const MODES = [
  { id: "mobile", label: "Mobile app screens", hint: "3 screens in phone frames" },
  { id: "web", label: "Web app UI", hint: "Desktop dashboard layout" },
  { id: "system", label: "Design system", hint: "Tokens, buttons, components" },
] as const;

const STYLES = [
  "Modern minimal",
  "Bold neo-brutalist",
  "Soft glassmorphism",
  "Dark premium",
  "Playful pastel",
  "Editorial serif",
];

function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("mobile");
  const [style, setStyle] = useState(STYLES[0]!);
  const queryClient = useQueryClient();

  const account = useQuery({ queryKey: ["account"], queryFn: () => getAccount() });
  const generations = useQuery({ queryKey: ["generations"], queryFn: () => listGenerations() });

  const generateFn = useServerFn(generateDesign);
  const unlockFn = useServerFn(unlockGeneration);

  const generate = useMutation({
    mutationFn: () => generateFn({ data: { prompt, mode, style } }),
    onSuccess: (result) => {
      if (!result.ok) {
        if (result.error === "not_enough_credits") {
          toast.error("You're out of credits — top up to keep designing.");
        } else {
          toast.error("Generation failed. Your credit was returned.");
        }
        return;
      }
      toast.success("Design ready");
      queryClient.invalidateQueries({ queryKey: ["generations"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
    onError: () => toast.error("Generation failed"),
  });

  const unlock = useMutation({
    mutationFn: (id: string) => unlockFn({ data: { id } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Not enough credits to unlock the export.");
        return;
      }
      toast.success("Export unlocked");
      queryClient.invalidateQueries({ queryKey: ["generations"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });

  const credits = account.data?.credits ?? 0;
  const canGenerate = prompt.trim().length > 5 && credits >= GENERATION_COST && !generate.isPending;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-border bg-card p-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Generate designs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe your product. We render production-grade UI you can export.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-accent px-4 py-2.5 text-sm font-extrabold text-accent-foreground">
            {credits} credits
          </div>
          <Link to="/dashboard/billing" className="btn-press rounded-full px-5 py-2.5 text-sm font-extrabold">
            Top up
          </Link>
        </div>
      </header>

      {credits < GENERATION_COST ? (
        <div className="rounded-[26px] border border-primary/30 bg-accent p-6">
          <h2 className="text-lg font-extrabold">Pick a plan to start generating</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every plan includes monthly credits, unlimited previews and full-resolution exports.
          </p>
          <Link to="/dashboard/billing" className="btn-press mt-5 inline-flex rounded-full px-6 py-3 text-sm font-extrabold">
            View plans
          </Link>
        </div>
      ) : null}

      <section className="rounded-[26px] border border-border bg-card p-6">
        <label className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
          Your idea
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="A habit tracker for runners with streaks, weekly stats and a friendly coach"
          className="mt-3 w-full resize-none rounded-2xl border border-border bg-background px-5 py-4 text-base font-medium outline-none focus:border-primary"
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {MODES.map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                mode === item.id
                  ? "border-primary bg-accent"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <div className="text-sm font-extrabold">{item.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{item.hint}</div>
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {STYLES.map((item) => (
            <button
              key={item}
              onClick={() => setStyle(item)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                style === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <button
          onClick={() => generate.mutate()}
          disabled={!canGenerate}
          className="btn-press mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-extrabold disabled:opacity-50 sm:w-auto"
        >
          <Sparkles className="h-5 w-5" />
          {generate.isPending ? "Designing…" : `Generate (${GENERATION_COST} credit)`}
        </button>
      </section>

      <section>
        <h2 className="font-display text-2xl font-extrabold">Recent</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {generate.isPending ? (
            <div className="aspect-[4/3] animate-pulse rounded-[26px] border border-border bg-card" />
          ) : null}
          {(generations.data ?? []).map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[26px] border border-border bg-card">
              <div className="relative aspect-[4/3] bg-muted">
                {item.url ? (
                  <img
                    src={item.url}
                    alt={item.prompt}
                    loading="lazy"
                    className={`h-full w-full object-cover ${item.unlocked ? "" : "blur-[3px]"}`}
                  />
                ) : null}
                {!item.unlocked ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">
                    <button
                      onClick={() => unlock.mutate(item.id)}
                      className="btn-press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold"
                    >
                      <Lock className="h-4 w-4" /> Unlock export ({UNLOCK_COST})
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="space-y-3 p-5">
                <p className="line-clamp-2 text-sm font-semibold">{item.prompt}</p>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span>{item.mode}</span>
                  {item.unlocked && item.url ? (
                    <a href={item.url} download className="inline-flex items-center gap-1.5 text-primary">
                      <Download className="h-4 w-4" /> Export
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
        {!generations.isLoading && (generations.data ?? []).length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Nothing yet — your generated designs will appear here.
          </p>
        ) : null}
      </section>
    </div>
  );
}