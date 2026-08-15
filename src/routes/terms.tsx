import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Screenfast" },
      { name: "description", content: "The terms that apply when you use Screenfast to generate and export AI product designs." },
      { property: "og:title", content: "Terms of Service — Screenfast" },
      { property: "og:description", content: "Terms that apply when you use Screenfast." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onLight />
      <main className="mx-auto max-w-3xl space-y-6 px-5 pb-24 pt-36">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">
          By using Screenfast you agree to these terms. Screenfast generates UI design imagery from
          the prompts you provide. You are responsible for the prompts you submit and for ensuring
          your use of generated output complies with applicable law.
        </p>
        <h2 className="pt-4 text-2xl font-extrabold">Your designs</h2>
        <p className="text-muted-foreground">
          Designs you generate and unlock are yours to use, including commercially. We do not claim
          ownership of your output.
        </p>
        <h2 className="pt-4 text-2xl font-extrabold">Credits and billing</h2>
        <p className="text-muted-foreground">
          Plans are billed monthly through Paddle, our merchant of record, who handles payment
          processing, tax and invoicing. Credits refresh at the start of each billing period.
          Top-up credits remain usable while your plan is active.
        </p>
        <h2 className="pt-4 text-2xl font-extrabold">Acceptable use</h2>
        <p className="text-muted-foreground">
          Do not use Screenfast to generate unlawful, infringing or harmful content, or to attempt to
          disrupt the service.
        </p>
      </main>
      <Footer />
    </div>
  );
}