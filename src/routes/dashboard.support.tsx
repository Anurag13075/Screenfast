import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/support")({
  component: SupportPage,
});

const faqs = [
  {
    q: "How do credits work?",
    a: "One credit generates a design. Unlocking a full-resolution export costs two credits. Plan credits refresh every month; top-ups never expire while your plan is active.",
  },
  {
    q: "Can I use the designs commercially?",
    a: "Yes. Everything you unlock and export is yours to use in client and commercial work.",
  },
  {
    q: "How do I cancel?",
    a: "Cancel any time from your Paddle receipt link or by emailing support — your credits stay usable until the end of the billing period.",
  },
];

function SupportPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-[26px] border border-border bg-card p-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Questions about billing or generations? We answer within one business day.
        </p>
      </header>

      <section className="divide-y divide-border rounded-[26px] border border-border bg-card p-7">
        {faqs.map((faq) => (
          <div key={faq.q} className="py-5 first:pt-0 last:pb-0">
            <h2 className="text-base font-extrabold">{faq.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </section>

      <a
        href="mailto:support@screenfast.app"
        className="btn-press inline-flex rounded-full px-6 py-3.5 text-sm font-extrabold"
      >
        Email support
      </a>
    </div>
  );
}