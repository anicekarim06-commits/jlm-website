import { getCardContact } from "@/lib/id-card/card-data";
import { buildVCard } from "@/lib/id-card/contact";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site-url";
import { JLM_LOGO_PNG } from "@/lib/content/image-src";

export const revalidate = 300;

/**
 * `.vcf` download for the "Save contact" button on `/id` (master plan
 * Section 8.2), generated from `settingsPublic/site` — only configured
 * channels are written, never `TODO(board)` placeholders.
 */
export async function GET() {
  const contact = await getCardContact();
  const vcard = buildVCard({
    name: "JLM ENSAM Casablanca",
    url: getSiteUrl(),
    note: "Jeunes Leaders Marocains — Ce qu'on transmet reste",
    contact,
    logoUrl: absoluteUrl(JLM_LOGO_PNG),
  });

  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="jlm-ensam-casablanca.vcf"',
    },
  });
}
