import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProjects } from "@/lib/content/projects";
import { getPoles } from "@/lib/content/poles";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Link } from "@/lib/i18n/navigation";
import { ProjectLogo } from "@/components/sections/ProjectLogo";
import { staticPageMetadata } from "@/lib/seo/static-metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "projects", "/projects");
}

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pole?: string }>;
}) {
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as AppLocale;
  const { pole: poleFilter } = await searchParams;
  const t = await getTranslations("projects");

  const [projects, poles] = await Promise.all([getProjects(), getPoles()]);
  const filtered = poleFilter
    ? projects.filter((p) => p.poleSlug === poleFilter)
    : projects;

  return (
    <Container className="py-12">
      <h1 className="text-4xl sm:text-5xl">{t("title")}</h1>

      <nav aria-label={t("title")} className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/projects"
          className={`rounded-full border px-3 py-1 text-sm ${!poleFilter ? "border-primary bg-primary text-primary-contrast" : "border-black/10"}`}
        >
          {t("filterAll")}
        </Link>
        {poles.map((pole) => {
          const name = resolveLocalized(pole.name, locale);
          return (
            <Link
              key={pole.slug}
              href={`/projects?pole=${pole.slug}`}
              className={`rounded-full border px-3 py-1 text-sm ${poleFilter === pole.slug ? "border-primary bg-primary text-primary-contrast" : "border-black/10"}`}
            >
              {name.text}
            </Link>
          );
        })}
      </nav>

      {filtered.length === 0 ? (
        <p className="text-muted mt-8">{t("noProjects")}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const name = resolveLocalized(project.name, locale);
            const tagline = resolveLocalized(project.tagline, locale);
            return (
              <Link key={project.slug} href={`/projects/${project.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <ProjectLogo src={project.logo} />
                    <h2 className="font-semibold">{name.text}</h2>
                  </div>
                  <p className="text-muted mt-1 text-sm">{tagline.text}</p>
                  {project.stats.slice(0, 2).map((stat) => (
                    <p key={stat.key} className="text-muted mt-2 text-xs">
                      <bdi dir="ltr">{stat.value}</bdi>{" "}
                      {resolveLocalized(stat.label, locale).text}
                    </p>
                  ))}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
