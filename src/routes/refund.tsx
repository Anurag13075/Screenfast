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
        <h2 className="pt-4 text-2xl font-extrabold">Subscription refunds</h2>
        <p className="text-muted-foreground">
          You may request a refund for an unused subscription period within 14 days of purchase. If
          you have used credits from your subscription, refunds are issued pro rata (proportional to
          the unused portion) at our discretion.
        </p>
        <h2 className="pt-4 text-2xl font-extrabold">One-time top-up refunds</h2>
        <p className="text-muted-foreground">
          Top-up credits purchased separately may be eligible for refund within 14 days if unused or
          if your account is closed. Top-up credits do not expire while your subscription plan
          remains active.
        </p>
        <h2 className="pt-4 text-2xl font-extrabold">Failed generation credit refunds</h2>
        <p className="text-muted-foreground">
          Credits for failed design generations are returned to your balance automatically. You are
          never charged for a design we could not produce. Partial generation failures (when only
          some variations succeed) result in automatic pro-rata credit refunds.
        </p>
        <h2 className="pt-4 text-2xl font-extrabold">How to request a refund</h2>
        <p className="text-muted-foreground">
          To request a refund, email anuragf863@gmail.com from your account email address within
          14 days of your charge. Include your order details and the reason for your refund request.
          You may also reply directly to your Paddle receipt email.
        </p>
        <h2 className="pt-4 text-2xl font-extrabold">Refund processing</h2>
        <p className="text-muted-foreground">
          Refunds are issued to the original payment method through Paddle, our Merchant of Record.
          Refund processing time depends on your payment provider and typically takes 5–10 business
          days.
        </p>
        <h2 className="pt-4 text-2xl font-extrabold">Support email</h2>
        <p className="font-mono text-sm font-semibold">anuragf863@gmail.com</p>
        <h2 className="pt-4 text-2xl font-extrabold">Questions</h2>
        <p className="text-muted-foreground">
          If you have questions about refunds or your billing, contact anuragf863@gmail.com
        </p>
      </main>
      <Footer />
    </div>
  );
}
