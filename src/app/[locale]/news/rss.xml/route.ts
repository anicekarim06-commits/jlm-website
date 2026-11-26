import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/lib/i18n/routing";
import { getPosts } from "@/lib/content/posts";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { buildRss } from "@/lib/content/rss";
import { absoluteUrl } from "@/lib/seo/site-url";

// Same freshness floor as the pages (master plan Section 8.3).
export const revalidate = 60;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** RSS 2.0 feed per locale at `/{locale}/news/rss.xml` (Section 8.4). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: localeParam } = await params;
  if (!hasLocale(routing.locales, localeParam)) {
    return new Response("Not found", { status: 404 });
  }
  const locale = localeParam as AppLocale;
  const t = await getTranslations({ locale, namespace: "news" });
  const posts = await getPosts();

  const xml = buildRss({
    title: `JLM ENSAM Casablanca — ${t("title")}`,
    link: absoluteUrl(`/${locale}/news`),
    selfLink: absoluteUrl(`/${locale}/news/rss.xml`),
    description: t("intro"),
    language: locale,
    items: posts.map((post) => {
      const link = absoluteUrl(`/${locale}/news/${post.slug}`);
      return {
        title: resolveLocalized(post.title, locale).text,
        description: resolveLocalized(post.excerpt, locale).text,
        link,
        guid: link,
        pubDate: post.publishAt,
        category: post.type,
      };
    }),
  });

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
