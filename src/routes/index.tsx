import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import demoPoster from "@/assets/demo-poster.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import screen1 from "@/assets/screen-1.jpg";
import screen2 from "@/assets/screen-2.jpg";
import screen3 from "@/assets/screen-3.jpg";
import screen4 from "@/assets/screen-4.jpg";
import styleSystem from "@/assets/style-system.jpg";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { Pricing } from "@/components/site/Pricing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Screenfast — From idea to shippable app UI in minutes" },
      {
        name: "description",
        content:
          "Generate mobile app screens, web dashboards and full design systems with AI. Pay-as-you-go credits, full-resolution exports, no design team required.",
      },
      { property: "og:title", content: "Screenfast — From idea to shippable app UI in minutes" },
      {
        property: "og:description",
        content: "AI-generated mobile screens, web UI and design systems. Export at full resolution.",
      },
    ],
  }),
  component: Index,
});

const SCREENS = [screen1, screen2, screen3, screen4];

const STEPS = [
  { n: "01", title: "Describe your product", body: "One sentence is enough. Tell us what the app does and who it's for." },
  { n: "02", title: "Pick a look", body: "Minimal, brutalist, glassy, dark premium — choose the direction you want." },
  { n: "03", title: "Export and build", body: "Unlock full-resolution screens and hand them straight to your developers." },
];

const FAQS = [
  { q: "What exactly do I get?", body: "Pixel-sharp UI mockups: mobile screen sets in device frames, desktop dashboards, or a full design system sheet with tokens and components." },
  { q: "Do I need design skills?", body: "No. Type your idea, pick a style, and get a coherent screen set in under a minute." },
  { q: "How does billing work?", body: "Every plan comes with monthly credits. One credit generates a design, two unlock a full-resolution export. Paddle handles payment, tax and invoices." },
  { q: "Can I cancel anytime?", body: "Yes — cancel in one click and keep using your remaining credits until the period ends." },
];

function Index() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  return (
    <div className="bg-background">
      <Navbar />

      <section className="relative overflow-hidden">
        <img
          src={heroBg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="grain absolute inset-0 bg-primary-deep/60" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-5 pb-32 pt-44 text-center">
          <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white backdrop-blur">
            AI product design studio
          </span>
          <h1 className="mt-7 font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-7xl">
            From idea to shippable app UI in minutes.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/75">
            Screenfast turns one sentence into mobile screens, web dashboards and complete design
            systems — ready to export and build.
          </p>

          <div className="mt-10 w-full max-w-2xl rounded-[28px] border border-white/20 bg-white/10 p-2.5 backdrop-blur-xl">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A meditation app for busy parents…"
                className="w-full rounded-2xl bg-white px-5 py-4 text-base font-medium text-foreground outline-none"
              />
              <button
                onClick={() => navigate({ to: "/auth", search: { redirect: "/dashboard" } })}
                className="btn-press inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-extrabold"
              >
                <Sparkles className="h-5 w-5" /> Generate
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/60">Plans from $9/mo · Cancel anytime</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="text-center font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          See Screenfast in action
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground">
          Real output from a single prompt — no touch-ups, no manual layout.
        </p>
        <div className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {SCREENS.map((src, i) => (
            <div
              key={src}
              className={`overflow-hidden rounded-[32px] border-[6px] border-foreground/90 bg-card shadow-[var(--shadow-soft)] ${
                i % 2 ? "lg:translate-y-6" : ""
              }`}
            >
              <img src={src} alt={`Generated app screen ${i + 1}`} loading="lazy" className="w-full" />
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-accent/60 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Three steps. That's the whole workflow.
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="rounded-[26px] border border-border bg-card p-8">
                <div className="font-display text-5xl font-extrabold text-primary/25">{step.n}</div>
                <h3 className="mt-4 text-xl font-extrabold">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="styles" className="mx-auto grid max-w-6xl gap-10 px-5 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Not just screens — a whole system
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Generate colour tokens, type scales, buttons, inputs and cards that stay consistent
            across every screen you make. Hand your developers something they can actually build.
          </p>
          <button
            onClick={() => navigate({ to: "/auth", search: { redirect: "/dashboard" } })}
            className="btn-press mt-8 inline-flex items-center gap-2 rounded-full px-7 py-4 text-base font-extrabold"
          >
            Start designing <ArrowRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-5">
          <img
            src={styleSystem}
            alt="Generated design system sheet with colour swatches and components"
            loading="lazy"
            className="w-full rounded-[26px] border border-border shadow-[var(--shadow-soft)]"
          />
          <img
            src={demoPoster}
            alt="Generated web app dashboard design"
            loading="lazy"
            className="w-full rounded-[26px] border border-border shadow-[var(--shadow-soft)]"
          />
        </div>
      </section>

      <Pricing />

      <section id="faq" className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="text-center font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Questions, answered
        </h2>
        <div className="mt-12 divide-y divide-border rounded-[26px] border border-border bg-card px-7">
          {FAQS.map((faq) => (
            <div key={faq.q} className="py-6">
              <h3 className="text-lg font-extrabold">{faq.q}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{faq.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
