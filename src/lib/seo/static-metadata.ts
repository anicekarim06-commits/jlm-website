import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/lib/content/locale";
import { pageMetadata } from "@/lib/seo/metadata";

export type StaticPageKey =
  | "home"
  | "about"
  | "contact"
  | "donate"
  | "donateThanks"
  | "join"
  | "legalNotice"
  | "legalPrivacy"
  | "partners"
  | "platforms"
  | "projects";

/**
 * Metadata for a page whose title and description are interface strings
 * (`seo.{key}Title` / `seo.{key}Description` in src/messages), so each
 * page gets a unique, translated title and description per locale
 * (T3.9 AC).
 */
export async function staticPageMetadata(
  params: Promise<{ locale: string }>,
  key: StaticPageKey,
  path: string,
  options: { noindex?: boolean } = {},
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMetadata({
    locale: locale as AppLocale,
    path,
    title: t(`${key}Title`),
    description: t(`${key}Description`),
    noindex: options.noindex,
  });
}
