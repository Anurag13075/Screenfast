import { Link } from "@tanstack/react-router";

import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Screenfast" width={32} height={32} className="h-8 w-8" loading="lazy" />
          <span className="font-display text-lg font-extrabold">screenfast</span>
        </div>
        <div className="flex flex-wrap gap-6 text-sm font-semibold text-muted-foreground">
          <Link to="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/refund" className="hover:text-foreground">
            Refund Policy
          </Link>
          <Link to="/support" className="hover:text-foreground">
            Support
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Screenfast. Payments by Paddle.
        </p>
      </div>
    </footer>
  );
}
