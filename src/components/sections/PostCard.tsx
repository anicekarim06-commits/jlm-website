import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { FallbackNote, fallbackAttrs } from "@/components/ui/FallbackNote";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { formatDate } from "@/lib/utils/format";
import type { Post } from "@/lib/validation/schemas";
import { cn } from "@/lib/utils/cn";

export const postTypeKey: Record<Post["type"], string> = {
  news: "typeNews",
  announcement: "typeAnnouncement",
  ad: "typeAd",
  "volunteer-call": "typeVolunteerCall",
  report: "typeReport",
};

export async function PostCard({
  post,
  locale,
  headingLevel = "h2",
}: {
  post: Post;
  locale: AppLocale;
  headingLevel?: "h2" | "h3";
}) {
  const t = await getTranslations("news");
  const title = resolveLocalized(post.title, locale);
  const excerpt = resolveLocalized(post.excerpt, locale);
  const Heading = headingLevel;
  const isAd = post.type === "ad";

  return (
    // Ads are visibly labelled and styled differently so they never look
    // like editorial posts (master plan Section 8.4).
    <Card
      className={cn(
        "relative flex h-full flex-col gap-3",
        isAd && "bg-surface border-dashed",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="bg-tint-violet text-text rounded-full px-2.5 py-1 font-medium">
          {isAd ? t("sponsored") : t(postTypeKey[post.type])}
        </span>
        {post.pinned && (
          <span className="bg-tint-mint rounded-full px-2.5 py-1 font-medium">
            {t("pinned")}
          </span>
        )}
        <time dateTime={post.publishAt.toISOString()} className="text-muted">
          {formatDate(post.publishAt, locale)}
        </time>
      </div>
      <Heading className="text-xl" {...fallbackAttrs(title.isFallback)}>
        <Link
          href={`/news/${post.slug}`}
          className="after:absolute after:inset-0 hover:underline"
        >
          {title.text}
        </Link>
      </Heading>
      <p className="text-muted text-sm" {...fallbackAttrs(excerpt.isFallback)}>
        {excerpt.text}
      </p>
      <div className="mt-auto">
        <FallbackNote show={title.isFallback || excerpt.isFallback} />
      </div>
    </Card>
  );
}
