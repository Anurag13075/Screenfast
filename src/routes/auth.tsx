import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Screenfast" },
      { name: "description", content: "Sign in to generate app screens, web UI and design systems with Screenfast." },
      { property: "og:title", content: "Sign in — Screenfast" },
      { property: "og:description", content: "Sign in to your Screenfast workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function Field({
  label,
  index,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; index: number }) {
  const [focused, setFocused] = useState(false);
  const filled = String(props.value ?? "").length > 0;
  const floating = focused || filled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 0 0 4px color-mix(in oklab, var(--color-primary) 18%, transparent)"
            : "0 0 0 0px color-mix(in oklab, var(--color-primary) 0%, transparent)",
          borderColor: focused ? "var(--color-primary)" : "var(--color-border)",
        }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border bg-card"
      >
        <input
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className="w-full rounded-2xl bg-transparent px-5 pb-2.5 pt-6 font-medium outline-none"
        />
      </motion.div>
      <motion.label
        animate={{
          y: floating ? 0 : 8,
          scale: floating ? 0.82 : 1,
          opacity: floating ? 1 : 0.65,
        }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="pointer-events-none absolute left-5 top-2 origin-left text-sm font-bold text-muted-foreground"
      >
        {label}
      </motion.label>
    </motion.div>
  );
}

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(0);
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const search = useSearch({ from: "/auth" });
  const target = search.redirect?.startsWith("/") ? search.redirect : "/dashboard";
  const redirected = useRef(false);

  useEffect(() => {
    if (!loading && session && !redirected.current && !busy) {
      redirected.current = true;
      navigate({ to: target });
    }
  }, [loading, session, navigate, target, busy]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${target}` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      setDone(true);
      redirected.current = true;
      setTimeout(() => navigate({ to: target }), 620);
    } catch (error) {
      setShake((n) => n + 1);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary-deep lg:block">
        <div className="grain absolute inset-0 bg-gradient-to-br from-primary via-primary-deep to-[#0b1d3a]" />
        <motion.div
          aria-hidden
          className="absolute -left-32 top-10 h-[36rem] w-[36rem] rounded-full bg-[color:var(--color-primary)] opacity-40 blur-[120px]"
          animate={{ x: [0, 120, -40, 0], y: [0, 80, 160, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-24 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[color:var(--color-secondary,#ff6b2c)] opacity-30 blur-[130px]"
          animate={{ x: [0, -90, 30, 0], y: [0, -70, -140, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Screenfast" className="h-9 w-9" />
            <span className="font-display text-xl font-extrabold">screenfast</span>
          </Link>
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl font-extrabold leading-[1.05]"
            >
              From idea to shippable UI in minutes.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-md text-lg text-white/70"
            >
              Generate mobile screens, web dashboards and full design systems on an infinite canvas
              — then export them at full resolution.
            </motion.p>
          </div>
          <p className="text-sm text-white/50">Secure payments handled by Paddle.</p>
        </div>
      </div>

      <div className="relative flex items-center justify-center overflow-hidden px-5 py-16">
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.5]"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage:
              "radial-gradient(60rem 40rem at 10% 10%, color-mix(in oklab, var(--color-primary) 12%, transparent), transparent), radial-gradient(50rem 30rem at 90% 90%, color-mix(in oklab, var(--color-accent) 60%, transparent), transparent)",
            backgroundSize: "200% 200%",
          }}
        />
        <motion.div
          key={shake}
          animate={shake ? { x: [0, -4, 4, -3, 3, 0] } : undefined}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "signin" ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "signin" ? 16 : -16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-display text-4xl font-extrabold tracking-tight">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-3 text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to open your canvas."
                  : "Start with a free preview, pay only to export."}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field
              index={0}
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field
              index={1}
              label="Password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <motion.button
              type="submit"
              disabled={busy}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="btn-press flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-extrabold disabled:opacity-80"
            >
              <AnimatePresence mode="wait" initial={false}>
                {done ? (
                  <motion.span
                    key="done"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-5 w-5" /> You're in
                  </motion.span>
                ) : busy ? (
                  <motion.span
                    key="busy"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {mode === "signin" ? "Sign in" : "Create account"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
