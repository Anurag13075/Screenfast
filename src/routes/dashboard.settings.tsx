import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { getAccount } from "@/lib/app.functions";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const account = useQuery({ queryKey: ["account"], queryFn: () => getAccount() });

  return (
    <div className="space-y-8">
      <header className="rounded-[26px] border border-border bg-card p-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your account details.</p>
      </header>

      <section className="space-y-5 rounded-[26px] border border-border bg-card p-7">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
            Email
          </div>
          <div className="mt-1 font-semibold">{user?.email}</div>
        </div>
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
            Name
          </div>
          <div className="mt-1 font-semibold">{account.data?.displayName ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
            Plan
          </div>
          <div className="mt-1 font-semibold capitalize">{account.data?.plan ?? "free"}</div>
        </div>
      </section>
    </div>
  );
}