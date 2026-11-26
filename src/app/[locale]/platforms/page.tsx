import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPlatforms } from "@/lib/content/platforms";
import { getProjects } from "@/lib/content/projects";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Link } from "@/lib/i18n/navigation";
import { PlatformLink } from "@/components/sections/PlatformLink";
import { getPlatformLinkLabels } from "@/components/sections/platform-link-labels";
import { isImageSrc } from "@/lib/content/image-src";
import type { Platform } from "@/lib/validation/schemas";
import { staticPageMetadata } from "@/lib/seo/static-metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "platforms", "/platforms");
}

const KINDS: Exclude<Platform["kind"], "prototype">[] = [
  "platform",
  "game",
  "website",
  "shop",
];
const kindFilterKey: Record<string, string> = {
  platform: "filterPlatform",
  game: "filterGame",
  website: "filterWebsite",
  shop: "filterShop",
};

export default async function PlatformsHubPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const platformLabels = await getPlatformLinkLabels();
  const locale = localeParam as AppLocale;
  const { type } = await searchParams;
  const t = await getTranslations("platforms");

  const [allPlatforms, projects] = await Promise.all([
    getPlatforms(),
    getProjects(),
  ]);
  const platforms = allPlatforms.filter((p) => p.kind !== "prototype");
  const prototypes = allPlatforms.filter((p) => p.kind === "prototype");
  const filtered = type ? platforms.filter((p) => p.kind === type) : platforms;

  const byProject = new Map<string, Platform[]>();
  for (const platform of filtered) {
    byProject.set(platform.projectSlug, [
      ...(byProject.get(platform.projectSlug) ?? []),
      platform,
    ]);
  }

  return (
    <Container className="py-12">
      <h1 className="text-4xl sm:text-5xl">{t("title")}</h1>
      <p className="text-muted mt-2 max-w-prose">{t("subtitle")}</p>

      <nav aria-label={t("title")} className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/platforms"
          className={`rounded-full border px-3 py-1 text-sm ${!type ? "border-primary bg-primary text-primary-contrast" : "border-black/10"}`}
        >
          {t("filterAll")}
        </Link>
        {KINDS.map((kind) => (
          <Link
            key={kind}
            href={`/platforms?type=${kind}`}
            className={`rounded-full border px-3 py-1 text-sm ${type === kind ? "border-primary bg-primary text-primary-contrast" : "border-black/10"}`}
          >
            {t(kindFilterKey[kind])}
          </Link>
        ))}
      </nav>

      <div className="mt-8 flex flex-col gap-6">
        {[...byProject.entries()].map(([projectSlug, items]) => {
          const project = projects.find((p) => p.slug === projectSlug);
          const projectName = project
            ? resolveLocalized(project.name, locale).text
            : projectSlug;
          return (
            <section key={projectSlug}>
              <h2 className="mb-2 font-semibold">{projectName}</h2>
              <div className="flex flex-col gap-2">
                {items.map((platform) => (
                  <Card key={platform.id}>
                    <PlatformLink
                      platform={platform}
                      locale={locale}
                      labels={platformLabels}
                    />
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {prototypes.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-2xl">{t("prototypesTitle")}</h2>
          <div className="flex flex-col gap-2">
            {prototypes.map((platform) => (
              <Card key={platform.id} className="flex flex-col gap-4">
                {isImageSrc(platform.screenshot) && (
                  <Image
                    src={platform.screenshot}
                    alt={resolveLocalized(platform.name, locale).text}
                    width={640}
                    height={400}
                    sizes="(min-width: 768px) 640px, 100vw"
                    className="aspect-[16/10] w-full max-w-xl rounded-2xl object-cover"
                  />
                )}
                <PlatformLink
                  platform={platform}
                  locale={locale}
                  labels={platformLabels}
                />
              </Card>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
