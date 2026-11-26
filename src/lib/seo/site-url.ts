/**
 * Absolute base URL for canonical links, sitemap, RSS, share links and
 * JSON-LD. Set `NEXT_PUBLIC_SITE_URL` per environment (staging, prod).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
