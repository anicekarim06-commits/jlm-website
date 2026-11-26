import "server-only";
import { cache } from "react";
import type Stripe from "stripe";
import { getStripeClient, isCardPaymentsEnabled } from "@/lib/payments/stripe";
import { sumPaidByCampaign } from "@/lib/payments/stripe-totals";

/** Safety cap: a student association will not exceed this per campaign. */
const MAX_SESSIONS = 2000;

/**
 * Paid card totals per campaign, straight from Stripe (no-database mode).
 * Cached per render with React `cache`; pages are ISR so Stripe is queried
 * at most about once a minute, plus right after a webhook revalidation.
 * Returns {} (and the page shows 0) if Stripe is not configured or fails.
 */
export const getStripeCampaignTotals = cache(
  async (): Promise<Record<string, number>> => {
    if (!isCardPaymentsEnabled()) return {};
    const currency = (process.env.STRIPE_CURRENCY ?? "mad").toLowerCase();
    try {
      const sessions: Stripe.Checkout.Session[] = [];
      for await (const session of getStripeClient().checkout.sessions.list({
        status: "complete",
        limit: 100,
      })) {
        sessions.push(session);
        if (sessions.length >= MAX_SESSIONS) break;
      }
      return sumPaidByCampaign(sessions, currency);
    } catch (error) {
      console.error("[payments] Could not read totals from Stripe:", error);
      return {};
    }
  },
);
