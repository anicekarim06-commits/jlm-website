import type { PoleSlug, StatItem } from "@/lib/validation/schemas";

/** The three figures J5 puts on the card, in this order when present. */
const CARD_STAT_KEYS = ["beneficiaries", "km-traveled", "active-members"];

export function pickCardStats(stats: StatItem[]): StatItem[] {
  const preferred = CARD_STAT_KEYS.map((key) =>
    stats.find((s) => s.key === key),
  ).filter((s): s is StatItem => s !== undefined);
  return preferred.length === CARD_STAT_KEYS.length
    ? preferred
    : stats.slice(0, 3);
}

/** Pôle slug → `PoleBadge` tone. */
export const poleTone: Record<
  PoleSlug,
  "solidarity" | "environment" | "entrepreneurship"
> = {
  solidarity: "solidarity",
  environment: "environment",
  "social-entrepreneurship": "entrepreneurship",
};
