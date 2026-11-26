import "server-only";
import Stripe from "stripe";
import { stripeKeyStatus } from "@/lib/payments/stripe-key";

/**
 * Card payments are test-mode only (see docs/BACKLOG.md: real online payment
 * is release 2, and Stripe does not pay out to Moroccan bank accounts). The
 * feature is gated on STRIPE_SECRET_KEY holding a Stripe *test* key; with no
 * key, or with a live key, the site behaves exactly as before: bank-transfer
 * pledges only.
 */
let warnedAboutRejectedKey = false;

export function isCardPaymentsEnabled(): boolean {
  const status = stripeKeyStatus(process.env.STRIPE_SECRET_KEY);
  if (status === "rejected" && !warnedAboutRejectedKey) {
    warnedAboutRejectedKey = true;
    // Never log the key itself.
    console.error(
      "[payments] STRIPE_SECRET_KEY is not a Stripe test key (sk_test_/rk_test_). Card payments stay disabled: live payments are not approved (docs/DECISIONS.md).",
    );
  }
  return status === "test";
}

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    const status = stripeKeyStatus(key);
    if (status === "missing") {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    if (status === "rejected") {
      throw new Error(
        "STRIPE_SECRET_KEY is not a Stripe test key; live payments are disabled",
      );
    }
    stripeClient = new Stripe(key!.trim());
  }
  return stripeClient;
}
