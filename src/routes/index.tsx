import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Code2,
  Download,
  FileText,
  Layers,
  Smartphone,
  Sparkles,
  TrendingUp,
  Wand2,
} from "lucide-react";

import demoPoster from "@/assets/demo-poster.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";
import screen1 from "@/assets/screen-1.jpg";
import screen2 from "@/assets/screen-2.jpg";
import screen3 from "@/assets/screen-3.jpg";
import screen4 from "@/assets/screen-4.jpg";
import styleSystem from "@/assets/style-system.jpg";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { Pricing } from "@/components/site/Pricing";
import { PromptConsole, type ConsoleTab } from "@/components/site/PromptConsole";

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

const FEATURES = [
  {
    icon: Sparkles,
    title: "Prompt-to-screens",
    body: "Describe your product in one sentence, pick a visual style, and generate a coherent set of app or web screens.",
  },
  {
    icon: Layers,
    title: "Design systems",
    body: "Get consistent colour tokens, type scales, buttons, inputs and cards generated across every screen you make.",
  },
  {
    icon: Wand2,
    title: "Refine flow",
    body: "Iterate on any generated design with a follow-up instruction — no need to start over from scratch.",
  },
  {
    icon: Smartphone,
    title: "Responsive variants",
    body: "Turn any screen into matching mobile, tablet and desktop versions — same content and style, adapted layout.",
    isNew: true,
  },
  {
    icon: Code2,
    title: "Code export",
    body: "Export generated designs as production-ready React or HTML components, not just flat images.",
  },
  {
    icon: FileText,
    title: "Handoff specs",
    body: "Generate developer-ready documentation — layout structure, spacing scale, colour tokens and edge cases.",
  },
  {
    icon: Download,
    title: "Full-resolution export",
    body: "Unlock and download production-ready assets at full resolution whenever you're ready to ship.",
  },
];

const FAQS = [
  { q: "What exactly do I get?", body: "Pixel-sharp UI mockups: mobile screen sets in device frames, desktop dashboards, or a full design system sheet with tokens and components." },
  { q: "Do I need design skills?", body: "No. Type your idea, pick a style, and get a coherent screen set in under a minute." },
  { q: "How does billing work?", body: "Every plan comes with monthly credits. One credit generates a design, two unlock a full-resolution export. Paddle handles payment, tax and invoices." },
  { q: "Can I cancel anytime?", body: "Yes — cancel in one click and keep using your remaining credits until the period ends." },
];

function Index() {
  const [prompt, setPrompt] = useState("");
  const [tab, setTab] = useState<ConsoleTab>("describe");
  const [attachment, setAttachment] = useState<{ name: string; dataUrl: string } | null>(null);
  const navigate = useNavigate();

  const start = () => navigate({ to: "/auth", search: { redirect: "/dashboard" } });

  function readFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setAttachment({ name: file.name, dataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  }

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
        <div className="grain absolute inset-0 bg-brand-blue/25" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pb-40 pt-36 text-center sm:pt-40">
          <motion.button
            onClick={start}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="float-slow group flex items-center gap-3 rounded-full border border-white/25 bg-white/10 py-2 pl-2 pr-4 text-white backdrop-blur-xl"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <TrendingUp className="h-4 w-4" />
            </span>
            <span className="h-5 w-px bg-white/25" />
            <span className="text-[15px] font-extrabold">3.2x faster shipping</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="mt-10 font-display text-[2.75rem] font-extrabold leading-[0.95] tracking-[-0.045em] text-white sm:text-7xl lg:text-[5.5rem]"
          >
            From idea to shippable{" "}
            <img
              src={logo}
              alt=""
              aria-hidden
              className="inline-block h-[0.85em] w-[0.85em] translate-y-[0.06em] drop-shadow-[0_0_28px_oklch(0.72_0.19_48/0.9)]"
            />{" "}
            app design in minutes.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-14 w-full max-w-3xl"
          >
            <PromptConsole
              value={prompt}
              onChange={setPrompt}
              onSubmit={start}
              tab={tab}
              onTabChange={setTab}
              attachment={attachment}
              onAttach={readFile}
              onClearAttachment={() => setAttachment(null)}
              placeholder={
                tab === "describe"
                  ? "A meditation app for busy parents — soft, calm, iOS style"
                  : "Not sure yet? Describe your users and we'll brainstorm the screens."
              }
            />
            <p className="mt-5 text-sm font-semibold text-white/70">
              Plans from $4/mo · Cancel anytime
            </p>
          </motion.div>
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

      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <p className="text-center text-sm font-extrabold uppercase tracking-[0.2em] text-primary">
          Features
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Everything you need to go from idea to shipped
        </h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="relative rounded-[26px] border border-border bg-card p-7 card-raised"
            >
              {feature.isNew ? (
                <span className="absolute right-6 top-6 rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-primary-foreground">
                  New
                </span>
              ) : null}
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
                <feature.icon className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <h3 className="mt-5 text-lg font-extrabold">{feature.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{feature.body}</p>
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
