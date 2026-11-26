import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getPost, getPosts } from "@/lib/content/posts";
import { getPartners } from "@/lib/content/partners";
import { relatedPosts } from "@/lib/content/post-visibility";
import { sanitizePostBody } from "@/lib/content/sanitize";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { formatDate } from "@/lib/utils/format";
import { pageMetadata, jsonLd, localizedPath } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/site-url";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { FallbackNote, fallbackAttrs } from "@/components/ui/FallbackNote";
import { Link } from "@/lib/i18n/navigation";
import { PostCard, postTypeKey } from "@/components/sections/PostCard";
import { ShareLinks } from "@/components/sections/ShareLinks";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as AppLocale;
  const post = await getPost(slug);
  if (!post) return {};
  return pageMetadata({
    locale,
    path: `/news/${post.slug}`,
    title: resolveLocalized(post.title, locale).text,
    description: resolveLocalized(post.excerpt, locale).text,
    image: post.cover,
    type: "article",
    publishedTime: post.publishAt,
    rss: true,
  });
}

// Rich text is sanitized on save (admin actions) and again here on render
// (master plan Section 8.4). These descendant styles stand in for a
// typography plugin; all spacing uses logical properties.
const bodyClasses =
  "max-w-prose text-lg leading-relaxed [&_a]:text-primary [&_a]:underline [&_blockquote]:border-s-4 [&_blockquote]:border-black/10 [&_blockquote]:ps-4 [&_blockquote]:italic [&_figcaption]:text-muted [&_figcaption]:text-sm [&_h2]:mt-8 [&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:text-xl [&_img]:rounded-2xl [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:mt-4 [&_ul]:list-disc [&_ul]:ps-6 [&>*:first-child]:mt-0";

// No slugs are prerendered at build time (content lives in Firestore);
// each page is rendered on first visit and then cached (ISR).
export function generateStaticParams() {
  return [];
}

export default async function PostPage({ params }: { params: Params }) {
  const { locale: localeParam, slug } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as AppLocale;
  const post = await getPost(slug);
  if (!post) notFound();

  const t = await getTranslations("news");
  const [posts, partners] = await Promise.all([getPosts(), getPartners()]);
  const related = relatedPosts(post, posts);
  const sponsor =
    post.type === "ad" && post.sponsorId
      ? partners.find((p) => p.id === post.sponsorId)
      : undefined;

  const title = resolveLocalized(post.title, locale);
  const excerpt = resolveLocalized(post.excerpt, locale);
  const body = resolveLocalized(post.body, locale);
  const url = absoluteUrl(localizedPath(locale, `/news/${post.slug}`));

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title.text,
    description: excerpt.text,
    datePublished: post.publishAt.toISOString(),
    dateModified: (post.updatedAt ?? post.publishAt).toISOString(),
    inLanguage: body.isFallback ? "fr" : locale,
    mainEntityOfPage: url,
    ...(post.cover && { image: [post.cover] }),
    author: { "@type": "Organization", name: "JLM ENSAM Casablanca" },
    publisher: { "@type": "Organization", name: "JLM ENSAM Casablanca" },
  };

  return (
    <Container className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(article) }}
      />
      <Link href="/news" className="text-primary text-sm font-medium">
        {t("backToNews")}
      </Link>

      <article className="mt-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="bg-tint-violet text-text rounded-full px-2.5 py-1 font-medium">
            {post.type === "ad" ? t("sponsored") : t(postTypeKey[post.type])}
          </span>
          <time dateTime={post.publishAt.toISOString()} className="text-muted">
            {t("publishedOn", { date: formatDate(post.publishAt, locale) })}
          </time>
        </div>

        <h1
          className="mt-4 max-w-3xl text-4xl sm:text-5xl"
          {...fallbackAttrs(title.isFallback)}
        >
          {title.text}
        </h1>
        <p
          className="text-muted mt-3 max-w-prose text-lg"
          {...fallbackAttrs(excerpt.isFallback)}
        >
          {excerpt.text}
        </p>
        <div className="mt-3">
          <FallbackNote
            show={title.isFallback || excerpt.isFallback || body.isFallback}
          />
        </div>

        {post.cover && (
          // eslint-disable-next-line @next/next/no-img-element -- admin-entered storage URLs, not wired to next/image remotePatterns yet
          <img
            src={post.cover}
            alt=""
            className="mt-8 aspect-[16/9] w-full max-w-3xl rounded-3xl object-cover"
          />
        )}

        <div
          className={`mt-8 ${bodyClasses}`}
          {...fallbackAttrs(body.isFallback)}
          dangerouslySetInnerHTML={{ __html: sanitizePostBody(body.text) }}
        />

        {sponsor && (
          <Card className="bg-surface mt-10 max-w-prose">
            <p className="text-muted text-sm">{t("sponsorTitle")}</p>
            <p className="mt-1 text-lg font-medium">
              {sponsor.url ? (
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="underline"
                >
                  {sponsor.name}
                </a>
              ) : (
                sponsor.name
              )}
            </p>
          </Card>
        )}

        <section aria-labelledby="share-title" className="mt-10">
          <h2 id="share-title" className="mb-3 text-lg font-medium">
            {t("share")}
          </h2>
          <ShareLinks
            url={url}
            title={title.text}
            labels={{
              copyLink: t("copyLink"),
              linkCopied: t("linkCopied"),
              opensInNewTab: t("opensInNewTab"),
            }}
          />
        </section>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-16">
          <h2 id="related-title" className="mb-6 text-2xl">
            {t("relatedTitle")}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <PostCard post={item} locale={locale} headingLevel="h3" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
