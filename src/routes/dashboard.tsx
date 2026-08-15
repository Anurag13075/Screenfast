import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { CreditCard, LayoutGrid, LifeBuoy, LogOut, Settings, Sparkles } from "lucide-react";

import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Workspace — Screenfast" },
      { name: "description", content: "Generate, review and export your AI product designs." },
      { property: "og:title", content: "Workspace — Screenfast" },
      { property: "og:description", content: "Generate, review and export your AI product designs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardLayout,
});

const nav = [
  { to: "/dashboard", label: "Generate", icon: Sparkles, exact: true },
  { to: "/dashboard/library", label: "Library", icon: LayoutGrid },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
  { to: "/dashboard/support", label: "Support", icon: LifeBuoy },
] as const;

function DashboardLayout() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/auth", search: { redirect: pathname } });
    }
  }, [loading, session, navigate, pathname]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex max-w-[1400px] gap-8 px-4 py-6 lg:px-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-[26px] border border-border bg-card p-5 lg:flex">
          <Link to="/" className="flex items-center gap-2.5 px-2">
            <img src={logo} alt="Screenfast" className="h-9 w-9" />
            <span className="font-display text-xl font-extrabold">screenfast</span>
          </Link>

          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-bold ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}