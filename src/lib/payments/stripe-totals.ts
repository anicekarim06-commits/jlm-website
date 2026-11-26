/**
 * No-database mode: Stripe is the record of card donations, so a campaign's
 * total is the sum of its paid Checkout Sessions (metadata.campaignSlug).
 * Pure part here (unit tested); the Stripe call is in stripe-totals-server.ts.
 */
export type SessionLike = {
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  metadata: Record<string, string> | null;
};

/** Paid totals per campaign, in major units (MAD), for one currency. */
export function sumPaidByCampaign(
  sessions: Iterable<SessionLike>,
  currency: string,
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const session of sessions) {
    const slug = session.metadata?.campaignSlug;
    if (!slug || session.payment_status !== "paid") continue;
    if ((session.currency ?? "").toLowerCase() !== currency.toLowerCase())
      continue;
    totals[slug] = (totals[slug] ?? 0) + (session.amount_total ?? 0) / 100;
  }
  return totals;
}
