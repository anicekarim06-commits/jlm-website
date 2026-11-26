/**
 * Minimal RSS 2.0 builder for the per-locale news feed (master plan
 * Section 8.4). Pure, so it can be unit tested and validated without a
 * server.
 */
export type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate: Date;
  guid: string;
  category?: string;
};

export type RssChannel = {
  title: string;
  link: string;
  selfLink: string;
  description: string;
  language: string;
  items: RssItem[];
};

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRss(channel: RssChannel): string {
  const items = channel.items
    .map((item) =>
      [
        "    <item>",
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>`,
        `      <pubDate>${item.pubDate.toUTCString()}</pubDate>`,
        item.category
          ? `      <category>${escapeXml(item.category)}</category>`
          : null,
        `      <description>${escapeXml(item.description)}</description>`,
        "    </item>",
      ]
        .filter((line): line is string => line !== null)
        .join("\n"),
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(channel.title)}</title>`,
    `    <link>${escapeXml(channel.link)}</link>`,
    `    <atom:link href="${escapeXml(channel.selfLink)}" rel="self" type="application/rss+xml" />`,
    `    <description>${escapeXml(channel.description)}</description>`,
    `    <language>${escapeXml(channel.language)}</language>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
