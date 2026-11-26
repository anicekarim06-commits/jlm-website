import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getStats } from "@/lib/content/stats";
import { getProjects } from "@/lib/content/projects";
import { getPoles } from "@/lib/content/poles";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { pageMetadata } from "@/lib/seo/metadata";
import { poleTone } from "@/lib/id-card/card-stats";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { PoleBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { FallbackNote, fallbackAttrs } from "@/components/ui/FallbackNote";
import { FlagshipActions } from "@/components/sections/FlagshipActions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "impact" });
  return pageMetadata({
    locale: locale as AppLocale,
    path: "/impact",
    title: t("title"),
    description: t("intro"),
  });
}

const tints = [
  "bg-tint-violet",
  "bg-tint-mint",
  "bg-tint-pink",
  "bg-tint-yellow",
];

/** Cumulative "since 2014" figures get their own band (Section 7.7). */
const isCumulative = (key: string) => key.endsWith("-since-2014");

export default async function ImpactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as AppLocale;
  const t = await getTranslations("impact");

  const [stats, projects, poles] = await Promise.all([
    getStats(),
    getProjects(),
    getPoles(),
  ]);
  const yearFigures = stats.filter((s) => !isCumulative(s.key));
  const cumulative = stats.filter((s) => isCumulative(s.key));
  const projectsWithStats = projects.filter((p) => p.stats.length > 0);
  // Every figure on the page cites where it comes from (AC T3.8).
  const sources = [
    ...new Map(
      stats.map((s) => [`${s.source}|${s.asOf}`, s] as const),
    ).values(),
  ];
  const labelsFallback = stats.some(
    (s) => resolveLocalized(s.label, locale).isFallback,
  );
  const format = new Intl.NumberFormat(locale);

  return (
    <>
      <Container className="py-12">
        <h1 className="max-w-3xl text-4xl sm:text-5xl">{t("title")}</h1>
        <p className="text-muted mt-3 max-w-prose text-lg">{t("intro")}</p>
      </Container>

      {yearFigures.length > 0 && (
        <section aria-labelledby="impact-figures" className="pb-12">
          <Container>
            <h2 id="impact-figures" className="mb-6 text-3xl">
              {t("figuresTitle", { year: yearFigures[0]?.asOf ?? "" })}
            </h2>
            <FallbackNote show={labelsFallback} />
            <dl className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {yearFigures.map((stat, i) => {
                const label = resolveLocalized(stat.label, locale);
                return (
                  <div
                    key={stat.key}
                    className={`flex flex-col-reverse justify-end gap-2 rounded-3xl p-6 sm:p-8 ${tints[i % tints.length]}`}
                  >
                    <dt
                      className="text-text/75 text-sm sm:text-base"
                      {...fallbackAttrs(label.isFallback)}
                    >
                      {label.text}
                    </dt>
                    <dd className="text-primary text-4xl font-medium sm:text-5xl">
                      <CountUp value={stat.value} locale={locale} />
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Container>
        </section>
      )}

      {cumulative.length > 0 && (
        <section
          aria-labelledby="impact-since"
          className="bg-primary text-primary-contrast py-14"
        >
          <Container>
            <h2 id="impact-since" className="mb-8 text-3xl">
              {t("sinceTitle")}
            </h2>
            <dl className="grid gap-8 sm:grid-cols-2">
              {cumulative.map((stat) => {
                const label = resolveLocalized(stat.label, locale);
                return (
                  <div key={stat.key} className="flex flex-col-reverse gap-1">
                    <dt
                      className="text-lg"
                      {...fallbackAttrs(label.isFallback)}
                    >
                      {label.text}
                    </dt>
                    <dd className="text-5xl font-medium sm:text-6xl">
                      <CountUp value={stat.value} locale={locale} />
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Container>
        </section>
      )}

      {projectsWithStats.length > 0 && (
        <section aria-labelledby="impact-projects" className="py-16">
          <Container>
            <h2 id="impact-projects" className="mb-2 text-3xl">
              {t("projectsTitle")}
            </h2>
            <p className="text-muted mb-6 max-w-prose">{t("projectsIntro")}</p>
            <div className="flex flex-col gap-3">
              {projectsWithStats.map((project) => {
                const name = resolveLocalized(project.name, locale);
                const pole = poles.find((p) => p.slug === project.poleSlug);
                return (
                  <details
                    key={project.slug}
                    className="group bg-bg rounded-3xl border border-black/[0.07] shadow-sm"
                  >
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="flex flex-wrap items-center gap-3">
                        <span className="text-xl font-medium">{name.text}</span>
                        {pole && (
                          <PoleBadge tone={poleTone[pole.slug]}>
                            {resolveLocalized(pole.name, locale).text}
                          </PoleBadge>
                        )}
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-muted text-2xl transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <dl className="grid grid-cols-2 gap-4 border-t border-black/5 px-6 py-5 sm:grid-cols-3 lg:grid-cols-4">
                      {project.stats.map((stat) => {
                        const label = resolveLocalized(stat.label, locale);
                        return (
                          <div key={stat.key} className="flex flex-col-reverse">
                            <dt
                              className="text-muted text-sm"
                              {...fallbackAttrs(label.isFallback)}
                            >
                              {label.text}
                            </dt>
                            <dd className="text-primary text-2xl font-medium">
                              <bdi dir="ltr">{format.format(stat.value)}</bdi>
                              {stat.unit && (
                                <span className="ms-1 text-base">
                                  {resolveLocalized(stat.unit, locale).text}
                                </span>
                              )}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </details>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      <FlagshipActions />

      <section aria-labelledby="impact-method" className="py-16">
        <Container className="max-w-3xl">
          <h2 id="impact-method" className="mb-3 text-2xl">
            {t("methodTitle")}
          </h2>
          <p className="text-muted">{t("methodBody")}</p>
          {sources.length > 0 && (
            <ul className="text-muted mt-4 list-disc ps-6 text-sm">
              {sources.map((s) => (
                <li key={`${s.source}|${s.asOf}`}>
                  {t("sourceLine", { source: s.source, asOf: s.asOf })}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/donate">{t("ctaDonate")}</LinkButton>
            <LinkButton href="/projects" variant="secondary">
              {t("ctaProjects")}
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}
