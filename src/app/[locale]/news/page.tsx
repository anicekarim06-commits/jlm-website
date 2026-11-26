import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getPosts } from "@/lib/content/posts";
import type { AppLocale } from "@/lib/content/locale";
import { postTypeSchema } from "@/lib/validation/schemas";
import { Container } from "@/components/ui/Container";
import { Link } from "@/lib/i18n/navigation";
import { PostCard, postTypeKey } from "@/components/sections/PostCard";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return pageMetadata({
    locale: locale as AppLocale,
    path: "/news",
    title: t("title"),
    description: t("intro"),
    rss: true,
  });
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as AppLocale;
  const { type: typeParam } = await searchParams;
  const parsedType = postTypeSchema.safeParse(typeParam);
  const type = parsedType.success ? parsedType.data : undefined;
  const t = await getTranslations("news");

  const posts = await getPosts();
  const filtered = type ? posts.filter((p) => p.type === type) : posts;

  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-4 text-sm ${active ? "border-primary bg-primary text-primary-contrast" : "border-black/10 hover:bg-black/5"}`;

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl">{t("title")}</h1>
          <p className="text-muted mt-2 max-w-prose">{t("intro")}</p>
        </div>
        <a
          href={`/${locale}/news/rss.xml`}
          className="text-primary text-sm font-medium underline"
        >
          {t("rssLink")}
        </a>
      </div>

      <nav aria-label={t("filterLabel")} className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/news"
          className={chip(!type)}
          aria-current={!type ? "page" : undefined}
        >
          {t("filterAll")}
        </Link>
        {postTypeSchema.options.map((option) => (
          <Link
            key={option}
            href={`/news?type=${option}`}
            className={chip(type === option)}
            aria-current={type === option ? "page" : undefined}
          >
            {t(postTypeKey[option])}
          </Link>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <p className="text-muted mt-10">{t("empty")}</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
