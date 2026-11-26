import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site-url";

/**
 * Master plan Section 7.12: admin and API disallowed. Staging
 * (`SITE_NOINDEX=true`, risk #11) disallows everything.
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_NOINDEX === "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
