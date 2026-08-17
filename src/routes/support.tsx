import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — Screenfast" },
      { name: "description", content: "Support and FAQ for Screenfast billing, credits, and generations." },
      { property: "og:title", content: "Support — Screenfast" },
      { property: "og:description", content: "Get support for Screenfast." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onLight />
      <main className="mx-auto max-w-3xl space-y-6 px-5 pb-24 pt-36">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">Support</h1>
        <p className="text-muted-foreground">
          Questions about billing, subscriptions, credits, or generations? We aim to respond within
          one business day.
        </p>
        <h2 className="pt-4 text-2xl font-extrabold">How credits work</h2>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong>Generate a design:</strong> 1 credit
          </li>
          <li>
            <strong>Unlock full-resolution export:</strong> 2 credits
          </li>
          <li>
            <strong>Refine a design:</strong> 1 credit
          </li>
          <li>
            <strong>Export code (React or HTML):</strong> 2 credits
          </li>
          <li>
            <strong>Create handoff spec:</strong> 1 credit
          </li>
        </ul>
        <h2 className="pt-4 text-2xl font-extrabold">Credit refresh and expiration</h2>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong>Subscription credits:</strong> Refresh at the start of each billing period
          </li>
          <li>
            <strong>Top-up credits:</strong> Do not expire while your plan is active
          </li>
        </ul>
        <h2 className="pt-4 text-2xl font-extrabold">Billing and refunds</h2>
        <p className="text-muted-foreground">
          For billing or refund questions, contact anuragf863@gmail.com. See our{" "}
          <a href="/refund" className="text-primary hover:underline">
            Refund Policy
          </a>{" "}
          for details on refund eligibility.
        </p>
        <h2 className="pt-4 text-2xl font-extrabold">Contact support</h2>
        <p className="font-mono text-sm font-semibold">anuragf863@gmail.com</p>
        <p className="text-muted-foreground">Response time: within one business day</p>
      </main>
      <Footer />
    </div>
  );
}
