import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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

const SUPPORT_EMAIL = "anuragf863@gmail.com";

function SupportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    const body = `From: ${name || "Not provided"}%0D%0A%0D%0A${encodeURIComponent(message)}`;
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject || "Screenfast Support Request"
    )}&body=${body}`;
    window.location.href = mailto;
    setSent(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSent(false);
    setName("");
    setSubject("");
    setMessage("");
  }

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
          For billing or refund questions, contact {SUPPORT_EMAIL}. See our{" "}
          <a href="/refund" className="text-primary hover:underline">
            Refund Policy
          </a>{" "}
          for details on refund eligibility.
        </p>

        <h2 className="pt-4 text-2xl font-extrabold">Contact support</h2>
        <p className="font-mono text-sm font-semibold">{SUPPORT_EMAIL}</p>
        <p className="text-muted-foreground">Response time: within one business day</p>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Email Support
        </button>
      </main>
      <Footer />

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {!sent ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-extrabold">Email Support</h3>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Your name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="What's this about?"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Describe your issue..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send Message
                  </button>

                  <p className="text-center text-xs text-muted-foreground">
                    This opens your email app with the message pre-filled to {SUPPORT_EMAIL}.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4 text-center">
                <h3 className="text-lg font-extrabold">Your email app should be opening</h3>
                <p className="text-sm text-muted-foreground">
                  If it didn't open automatically, you can email us directly at{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
