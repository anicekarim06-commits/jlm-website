import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getPole } from "@/lib/content/poles";
import { getProjectsByPole } from "@/lib/content/projects";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Link } from "@/lib/i18n/navigation";
import { ProjectLogo } from "@/components/sections/ProjectLogo";
import { FallbackNote, fallbackAttrs } from "@/components/ui/FallbackNote";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const pole = await getPole(slug);
  if (!pole) return {};
  return pageMetadata({
    locale: locale as AppLocale,
    path: `/poles/${pole.slug}`,
    title: resolveLocalized(pole.name, locale as AppLocale).text,
    description: resolveLocalized(pole.tagline, locale as AppLocale).text,
  });
}

const poleAccentVar: Record<string, string> = {
  solidarity: "var(--color-pole-solidarity)",
  environment: "var(--color-pole-environment)",
  "social-entrepreneurship": "var(--color-pole-entrepreneurship)",
};

// No slugs are prerendered at build time (content lives in Firestore);
// each page is rendered on first visit and then cached (ISR).
export function generateStaticParams() {
  return [];
}

export default async function PolePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as AppLocale;
  const pole = await getPole(slug);
  if (!pole) notFound();

  const projects = await getProjectsByPole(pole.slug);
  const t = await getTranslations("poles");
  const name = resolveLocalized(pole.name, locale);
  const tagline = resolveLocalized(pole.tagline, locale);
  const description = resolveLocalized(pole.description, locale);

  return (
    <div>
      <div
        className="border-b-4 py-12"
        style={{ borderBottomColor: poleAccentVar[pole.slug] }}
      >
        <Container>
          <h1
            className="text-4xl sm:text-5xl"
            {...fallbackAttrs(name.isFallback)}
          >
            {name.text}
          </h1>
          <p
            className="text-muted mt-2 text-lg"
            {...fallbackAttrs(tagline.isFallback)}
          >
            {tagline.text}
          </p>
          <p
            className="mt-4 max-w-prose"
            {...fallbackAttrs(description.isFallback)}
          >
            {description.text}
          </p>
          <div className="mt-4">
            <FallbackNote
              show={
                name.isFallback || tagline.isFallback || description.isFallback
              }
            />
          </div>
        </Container>
      </div>

      <Container className="py-10">
        <h2 className="mb-4 text-2xl">{t("projectsTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const projectName = resolveLocalized(project.name, locale);
            const projectTagline = resolveLocalized(project.tagline, locale);
            return (
              <Link key={project.slug} href={`/projects/${project.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <ProjectLogo src={project.logo} className="mb-3" />
                  <h3
                    className="font-semibold"
                    {...fallbackAttrs(projectName.isFallback)}
                  >
                    {projectName.text}
                  </h3>
                  <p
                    className="text-muted mt-1 text-sm"
                    {...fallbackAttrs(projectTagline.isFallback)}
                  >
                    {projectTagline.text}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
