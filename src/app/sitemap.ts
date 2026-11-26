import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content/projects";
import { getPoles } from "@/lib/content/poles";
import { getPosts } from "@/lib/content/posts";
import { getCampaigns } from "@/lib/content/campaigns";
import { absoluteUrl } from "@/lib/seo/site-url";
import { languageAlternates, localizedPath } from "@/lib/seo/metadata";
import { LOCALES } from "@/lib/content/locale";

export const revalidate = 3600;

/** Locale-agnostic public paths that are always present. */
const STATIC_PATHS = [
  "/",
  "/about",
  "/projects",
  "/platforms",
  "/impact",
  "/news",
  "/donate",
  "/join",
  "/partners",
  "/contact",
  "/id",
  "/legal/privacy",
  "/legal/notice",
];

/**
 * One entry per page per locale, each carrying its hreflang alternates
 * (master plan Section 7.12). Content entries come from Firestore so a
 * newly published project, post or campaign is listed without a deploy.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, poles, posts, campaigns] = await Promise.all([
    getProjects(),
    getPoles(),
    getPosts(),
    getCampaigns(),
  ]);

  const entries: { path: string; lastModified?: Date }[] = [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...poles.map((p) => ({ path: `/poles/${p.slug}` })),
    ...projects.map((p) => ({
      path: `/projects/${p.slug}`,
      lastModified: p.updatedAt,
    })),
    ...posts.map((p) => ({
      path: `/news/${p.slug}`,
      lastModified: p.updatedAt ?? p.publishAt,
    })),
    ...campaigns
      .filter((c) => c.published)
      .map((c) => ({ path: `/donate/${c.slug}`, lastModified: c.updatedAt })),
  ];

  return entries.flatMap(({ path, lastModified }) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(localizedPath(locale, path)),
      ...(lastModified && { lastModified }),
      alternates: { languages: languageAlternates(path) },
    })),
  );
}
