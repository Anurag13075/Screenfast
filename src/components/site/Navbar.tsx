import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import logo from "@/assets/logo.png";

const links = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Styles", href: "/#styles" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQs", href: "/#faq" },
];

export function Navbar({ onLight = false }: { onLight?: boolean }) {
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = floating || onLight;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={`pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-300 sm:px-6 ${
          solid
            ? "border border-border/70 bg-background/70 shadow-[var(--shadow-soft)] backdrop-blur-xl"
            : "border border-transparent bg-transparent"
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Screenfast logo" width={36} height={36} className="h-9 w-9" />
          <span
            className={`font-display text-xl font-extrabold tracking-tight ${
              solid ? "text-foreground" : "text-white"
            }`}
          >
            screenfast
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-bold transition-opacity hover:opacity-70 ${
                solid ? "text-foreground" : "text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <Link
          to="/dashboard"
          className="btn-press inline-flex items-center rounded-full px-5 py-2.5 text-sm font-extrabold"
        >
          Dashboard
        </Link>
      </nav>
    </div>
  );
}