import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { Pricing } from "@/components/site/Pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Screenfast AI design generator" },
      {
        name: "description",
        content:
          "Simple credit plans for AI-generated mobile screens, web app UI and design systems. From $9/mo, cancel anytime.",
      },
      { property: "og:title", content: "Pricing — Screenfast AI design generator" },
      {
        property: "og:description",
        content: "Credit plans from $9/mo for AI-generated app and web UI design. Cancel anytime.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onLight />
      <div className="pt-28">
        <Pricing />
      </div>
      <Footer />
    </div>
  );
}