/**
 * Card payments are a test-mode-only demo (docs/DECISIONS.md, 2026-11-20):
 * the board has no merchant agreement, and Stripe cannot pay out to a
 * Moroccan bank account. Until the code enforced it, a live `sk_live_…` key
 * dropped into the environment would have charged real cards.
 *
 * Only Stripe test-mode secret keys (`sk_test_…`) or restricted test keys
 * (`rk_test_…`) are accepted. Anything else is treated as "not configured".
 * Pure function, no `server-only`, so it can be unit tested.
 */
export type StripeKeyStatus = "missing" | "test" | "rejected";

export function stripeKeyStatus(key: string | undefined): StripeKeyStatus {
  const trimmed = key?.trim();
  if (!trimmed) return "missing";
  return /^(sk|rk)_test_[A-Za-z0-9]+$/.test(trimmed) ? "test" : "rejected";
}
