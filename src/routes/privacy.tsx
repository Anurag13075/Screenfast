import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Screenfast" },
      { name: "description", content: "How Screenfast collects, uses, and protects your information." },
      { property: "og:title", content: "Privacy Policy — Screenfast" },
      { property: "og:description", content: "Screenfast privacy policy and data protection." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onLight />
      <main className="mx-auto max-w-3xl space-y-6 px-5 pb-24 pt-36">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: August 2026</p>

        <p className="text-muted-foreground">
          Screenfast ("Screenfast", "we", "us", or "our") respects your privacy. This Privacy Policy
          explains what information we collect, how we use it, and how we protect it when you use
          Screenfast.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Information we collect</h2>
        <p className="text-muted-foreground">
          When you create and use a Screenfast account, we may collect information necessary to
          provide the service, such as your account information, authentication information, prompts
          and designs you submit, usage information, and billing-related information.
        </p>
        <p className="text-muted-foreground">
          Payment information is processed by Paddle, our Merchant of Record. Screenfast does not
          need to store your full payment card details.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">How we use information</h2>
        <p className="text-muted-foreground">We use information to:</p>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>Provide and operate Screenfast.</li>
          <li>Create and deliver the designs you request.</li>
          <li>Maintain your account and usage balance.</li>
          <li>Process subscriptions and purchases through Paddle.</li>
          <li>Provide customer support.</li>
          <li>Detect abuse, fraud, and misuse.</li>
          <li>Maintain and improve the reliability and security of the service.</li>
        </ul>

        <h2 className="pt-4 text-2xl font-extrabold">AI-generated designs</h2>
        <p className="text-muted-foreground">
          Screenfast processes the prompts and other information necessary to generate the designs
          requested by you.
        </p>
        <p className="text-muted-foreground">
          You are responsible for the content you submit and for ensuring that your use of generated
          content complies with applicable laws and third-party rights.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Payments</h2>
        <p className="text-muted-foreground">
          Payments and billing are handled through Paddle, our Merchant of Record.
        </p>
        <p className="text-muted-foreground">
          Paddle may collect and process payment, billing, tax, and transaction information required
          to complete purchases and provide payment-related services.
        </p>
        <p className="text-muted-foreground">
          Screenfast receives the information necessary to associate a transaction or subscription
          with your Screenfast account.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Information sharing</h2>
        <p className="text-muted-foreground">We do not sell your personal information.</p>
        <p className="text-muted-foreground">
          We may share information with service providers when necessary to operate Screenfast,
          process payments, provide infrastructure, provide AI generation functionality, maintain
          security, or comply with legal obligations.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Data retention</h2>
        <p className="text-muted-foreground">
          We retain information for as long as reasonably necessary to provide Screenfast, maintain
          account and transaction records, comply with legal obligations, resolve disputes, and
          enforce our agreements.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Security</h2>
        <p className="text-muted-foreground">
          We take reasonable measures to protect information used by Screenfast. However, no
          internet service can guarantee absolute security.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Your choices and rights</h2>
        <p className="text-muted-foreground">
          Depending on your location, you may have rights regarding your personal information,
          including rights to access, correct, delete, or restrict certain processing of your
          information.
        </p>
        <p className="text-muted-foreground">For privacy-related requests, contact:</p>
        <p className="font-mono text-sm font-semibold">>anuragf863@gmail.com</p>

        <h2 className="pt-4 text-2xl font-extrabold">Children's privacy</h2>
        <p className="text-muted-foreground">
          Screenfast is not intended for children who are not legally permitted to use online
          services in their jurisdiction.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Changes to this Privacy Policy</h2>
        <p className="text-muted-foreground">
          We may update this Privacy Policy from time to time. When we make changes, we will update
          the "Last updated" date on this page.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Contact</h2>
        <p className="text-muted-foreground">
          If you have questions about this Privacy Policy or how Screenfast handles information,
          contact:
        </p>
        <p className="font-mono text-sm font-semibold">>anuragf863@gmail.com</p>
      </main>
      <Footer />
    </div>
  );
}
