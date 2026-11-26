import "server-only";
import { campaignSchema, type Campaign } from "@/lib/validation/schemas";
import { cachedCollection, cachedDoc } from "@/lib/content/cache";
import { hasDatabase } from "@/lib/firebase/mode";
import { getStripeCampaignTotals } from "@/lib/payments/stripe-totals-server";

function parseCampaign(data: Record<string, unknown>): Campaign | null {
  const result = campaignSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * No-database mode: the amount received is what Stripe has been paid for
 * the campaign (card donations only); bank transfers are not tracked.
 */
async function withReceived(campaigns: Campaign[]): Promise<Campaign[]> {
  if (hasDatabase()) return campaigns;
  const totals = await getStripeCampaignTotals();
  return campaigns.map((c) => ({ ...c, receivedMAD: totals[c.slug] ?? 0 }));
}

export async function getCampaigns(): Promise<Campaign[]> {
  const campaigns = await cachedCollection("campaigns", parseCampaign)();
  return withReceived(campaigns.filter((c) => c.published));
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
  const campaigns = await getCampaigns();
  const now = Date.now();
  return campaigns.filter(
    (c) => c.startsAt.getTime() <= now && c.endsAt.getTime() >= now,
  );
}

export async function getFeaturedCampaign(): Promise<Campaign | null> {
  const active = await getActiveCampaigns();
  return active.find((c) => c.featured) ?? active[0] ?? null;
}

export async function getCampaign(slug: string): Promise<Campaign | null> {
  const campaign = await cachedDoc("campaigns", slug, parseCampaign)();
  if (!campaign?.published) return null;
  const [withTotal] = await withReceived([campaign]);
  return withTotal ?? null;
}
