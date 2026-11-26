import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getProject } from "@/lib/content/projects";
import { getPlatformsByProject } from "@/lib/content/platforms";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { PlatformLink } from "@/components/sections/PlatformLink";
import { getPlatformLinkLabels } from "@/components/sections/platform-link-labels";
import { ProjectLogo } from "@/components/sections/ProjectLogo";
import { FallbackNote, fallbackAttrs } from "@/components/ui/FallbackNote";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return pageMetadata({
    locale: locale as AppLocale,
    path: `/projects/${project.slug}`,
    title: resolveLocalized(project.name, locale as AppLocale).text,
    description: resolveLocalized(project.tagline, locale as AppLocale).text,
    image: project.cover,
  });
}

// No slugs are prerendered at build time (content lives in Firestore);
// each page is rendered on first visit and then cached (ISR).
export function generateStaticParams() {
  return [];
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const platformLabels = await getPlatformLinkLabels();
  const locale = localeParam as AppLocale;
  const project = await getProject(slug);
  if (!project) notFound();

  const platforms = await getPlatformsByProject(project.slug);
  const t = await getTranslations("projects");
  const name = resolveLocalized(project.name, locale);
  const tagline = resolveLocalized(project.tagline, locale);
  const description = resolveLocalized(project.description, locale);

  return (
    <Container className="py-12">
      <ProjectLogo src={project.logo} size={96} className="mb-6" />
      <h1 className="text-4xl sm:text-5xl" {...fallbackAttrs(name.isFallback)}>
        {name.text}
      </h1>
      <p
        className="text-muted mt-2 text-lg"
        {...fallbackAttrs(tagline.isFallback)}
      >
        {tagline.text}
      </p>
      <p
        className="mt-4 max-w-prose whitespace-pre-line"
        {...fallbackAttrs(description.isFallback)}
      >
        {description.text}
      </p>
      <div className="mt-4">
        <FallbackNote
          show={name.isFallback || tagline.isFallback || description.isFallback}
        />
      </div>

      {project.stats.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold">{t("statsTitle")}</h2>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {project.stats.map((stat) => (
              <div key={stat.key}>
                <dd className="text-primary text-2xl font-bold">
                  <bdi dir="ltr">
                    {new Intl.NumberFormat(locale).format(stat.value)}
                  </bdi>
                  {stat.unit && (
                    <span className="ms-1 text-base">
                      {resolveLocalized(stat.unit, locale).text}
                    </span>
                  )}
                </dd>
                <dt
                  className="text-muted text-sm"
                  {...fallbackAttrs(
                    resolveLocalized(stat.label, locale).isFallback,
                  )}
                >
                  {resolveLocalized(stat.label, locale).text}
                </dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {project.gallery.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold">{t("galleryTitle")}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {project.gallery.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- plain storage URLs, not yet wired to next/image loader config
              <img
                key={i}
                src={src}
                alt=""
                className="aspect-square rounded-md object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {platforms.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold">{t("platformsTitle")}</h2>
          <div className="flex flex-col gap-2">
            {platforms.map((platform) => (
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
      )}

      <LinkButton href="/donate" className="mt-8">
        {t("supportProject")}
      </LinkButton>
    </Container>
  );
}
