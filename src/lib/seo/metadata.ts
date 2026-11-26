import type { Metadata } from "next";
import { LOCALES, type AppLocale } from "@/lib/content/locale";
import { absoluteUrl } from "@/lib/seo/site-url";

const ogLocale: Record<AppLocale, string> = {
  fr: "fr_FR",
  ar: "ar_MA",
  en: "en_GB",
};

/** `/fr/about`, `/ar/about`, … for a locale-agnostic path like `/about`. */
export function localizedPath(locale: AppLocale, path: string): string {
  const clean = path === "/" ? "" : path;
  return `/${locale}${clean}`;
}

/** hreflang map for every locale plus `x-default` (French, master plan 4.3). */
export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = absoluteUrl(localizedPath(locale, path));
  }
  languages["x-default"] = absoluteUrl(localizedPath("fr", path));
  return languages;
}

/**
 * Per-page metadata (master plan Section 7.12): unique title and
 * description per page and locale, canonical, hreflang alternates, Open
 * Graph and Twitter card. The root layout adds the " · JLM ENSAM
 * Casablanca" suffix via `title.template`.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
  publishedTime,
  rss = false,
  noindex = false,
}: {
  locale: AppLocale;
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: Date;
  rss?: boolean;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(localizedPath(locale, path));
  const images = image ? [{ url: image }] : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
      ...(rss && {
        types: {
          "application/rss+xml": absoluteUrl(`/${locale}/news/rss.xml`),
        },
      }),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "JLM ENSAM Casablanca",
      locale: ogLocale[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map(
        (l) => ogLocale[l],
      ),
      type,
      ...(publishedTime && { publishedTime: publishedTime.toISOString() }),
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images && { images }),
    },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}

/** Serialises JSON-LD safely for a `<script type="application/ld+json">`. */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
