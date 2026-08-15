import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Screenfast" },
      { name: "description", content: "How refunds work for Screenfast subscriptions and credit top-ups." },
      { property: "og:title", content: "Refund Policy — Screenfast" },
      { property: "og:description", content: "How refunds work for Screenfast plans and top-ups." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onLight />
      <main className="mx-auto max-w-3xl space-y-6 px-5 pb-24 pt-36">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">Refund Policy</h1>
        <p className="text-muted-foreground">
          If something goes wrong, email support within 14 days of a charge and we'll make it right.
          Unused subscription periods are refundable in full; periods where credits have been spent
          are refunded pro rata at our discretion.
        </p>
        <h2 className="pt-4 text-2xl font-extrabold">Failed generations</h2>
        <p className="text-muted-foreground">
          Credits for failed generations are returned to your balance automatically — you are never
          charged for a design we could not produce.
        </p>
        <h2 className="pt-4 text-2xl font-extrabold">How to request</h2>
        <p className="text-muted-foreground">
          Email support@screenfast.app from your account address, or reply to your Paddle receipt.
          Refunds are issued to the original payment method by Paddle.
        </p>
      </main>
      <Footer />
    </div>
  );
}