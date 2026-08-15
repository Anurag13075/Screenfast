import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";

import { listGenerations } from "@/lib/app.functions";

export const Route = createFileRoute("/dashboard/library")({
  component: LibraryPage,
});

function LibraryPage() {
  const generations = useQuery({ queryKey: ["generations"], queryFn: () => listGenerations() });

  return (
    <div className="space-y-8">
      <header className="rounded-[26px] border border-border bg-card p-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything you've generated so far.</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {(generations.data ?? []).map((item) => (
          <article key={item.id} className="overflow-hidden rounded-[26px] border border-border bg-card">
            <div className="aspect-[4/3] bg-muted">
              {item.url ? (
                <img
                  src={item.url}
                  alt={item.prompt}
                  loading="lazy"
                  className={`h-full w-full object-cover ${item.unlocked ? "" : "blur-[3px]"}`}
                />
              ) : null}
            </div>
            <div className="space-y-3 p-5">
              <p className="line-clamp-2 text-sm font-semibold">{item.prompt}</p>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span>{item.style}</span>
                {item.unlocked && item.url ? (
                  <a href={item.url} download className="inline-flex items-center gap-1.5 text-primary">
                    <Download className="h-4 w-4" /> Export
                  </a>
                ) : (
                  <span>Locked</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {!generations.isLoading && (generations.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">Your library is empty.</p>
      ) : null}
    </div>
  );
}