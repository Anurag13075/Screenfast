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

        <h2 className="pt-4 text-2xl font-extrabold">What Screenfast provides</h2>
        <p className="text-muted-foreground">
          Screenfast is an AI-powered design generation service that creates UI mockups, app screens,
          web designs, and design systems based on text prompts you provide. You can generate designs
          in multiple formats (mobile, web, system) and export full-resolution versions.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Your responsibility for prompts and content</h2>
        <p className="text-muted-foreground">
          You are solely responsible for the prompts you submit to Screenfast and for ensuring that
          your use of any generated content complies with applicable laws, does not infringe
          third-party rights, and does not violate the acceptable use policy below.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Ownership and use of generated designs</h2>
        <p className="text-muted-foreground">
          Designs you generate and unlock are yours to use, including commercially, in client work,
          and in production. We do not claim ownership of your generated output. You may export,
          modify, and redistribute the designs as you see fit.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Account responsibility</h2>
        <p className="text-muted-foreground">
          You are responsible for maintaining the confidentiality of your account credentials and for
          all activity that occurs under your account. You agree to notify us immediately of any
          unauthorized use of your account.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Credits and billing</h2>
        <p className="text-muted-foreground">
          Plans are billed according to the billing frequency displayed at checkout through Paddle,
          our Merchant of Record, which handles payment processing, tax and invoicing. Subscription
          credits refresh at the start of each billing period. Top-up credits are one-time purchases
          and remain usable while your plan is active.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Subscription and cancellation</h2>
        <p className="text-muted-foreground">
          You may cancel your subscription at any time. Cancellation takes effect at the end of your
          current billing period. Unused credits in your current billing period remain usable until
          the end of the period.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Refund policy</h2>
        <p className="text-muted-foreground">
          Our refund policy is detailed at{" "}
          <a href="/refund" className="text-primary hover:underline">
            /refund
          </a>
          . In summary: subscription periods refund in full if unused; periods where credits have
          been spent refund pro rata at our discretion. Failed generation credits are refunded
          automatically. Top-up credits do not expire while your plan is active.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Acceptable use</h2>
        <p className="text-muted-foreground">
          Do not use Screenfast to generate unlawful, infringing, defamatory, or harmful content, or
          to attempt to disrupt, reverse-engineer, or gain unauthorized access to the service. Do not
          use Screenfast to violate anyone's intellectual property, privacy, or other rights.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Service availability and disclaimer</h2>
        <p className="text-muted-foreground">
          Screenfast is provided on an "as-is" basis. We aim to maintain high availability but do not
          guarantee uninterrupted service. We are not liable for any loss of data, designs, or
          credits due to service interruptions, data loss, or other technical issues beyond our
          reasonable control.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Changes to the service and terms</h2>
        <p className="text-muted-foreground">
          We may modify Screenfast and these terms at any time. Material changes to the terms will be
          announced in advance. Continued use of Screenfast after changes constitute acceptance of
          the updated terms.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Contact</h2>
        <p className="text-muted-foreground">For questions or legal requests, contact:</p>
        <p className="font-mono text-sm font-semibold">support@screenfast.app</p>
      </main>
      <Footer />
    </div>
  );
}
