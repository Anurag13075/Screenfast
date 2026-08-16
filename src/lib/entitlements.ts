/**
 * Server-side entitlement overrides.
 *
 * Accounts listed here (or in the PREMIUM_OVERRIDE_EMAILS env var, comma separated)
 * bypass every billing / credit / paywall check. This is evaluated on the server
 * from the verified JWT claims, never from client input.
 */
const HARDCODED_OVERRIDES = ["assainegaming@gmail.com"];

export function overrideEmails(): string[] {
  const fromEnv = (process.env["PREMIUM_OVERRIDE_EMAILS"] ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return [...HARDCODED_OVERRIDES.map((e) => e.toLowerCase()), ...fromEnv];
}

/** True when the authenticated user has unlimited, permanent access. */
export function isUnlimited(claims: { email?: unknown } | null | undefined): boolean {
  const email = typeof claims?.email === "string" ? claims.email.trim().toLowerCase() : "";
  if (!email) return false;
  return overrideEmails().includes(email);
}

export const UNLIMITED_CREDITS = 999_999;
