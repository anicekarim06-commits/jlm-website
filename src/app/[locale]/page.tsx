import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { StatsBand } from "@/components/sections/StatsBand";
import { PoleCards } from "@/components/sections/PoleCards";
import { FlagshipActions } from "@/components/sections/FlagshipActions";
import { FinalCta } from "@/components/sections/FinalCta";
import { getProjects } from "@/lib/content/projects";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { Link } from "@/lib/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ProjectLogo } from "@/components/sections/ProjectLogo";
import { staticPageMetadata } from "@/lib/seo/static-metadata";
import { getPublicSettings } from "@/lib/content/settings";
import { isConfigured } from "@/lib/id-card/contact";
import { jsonLd } from "@/lib/seo/metadata";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site-url";
import { JLM_LOGO_PNG } from "@/lib/content/image-src";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "home", "/");
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  setRequestLocale((await params).locale);
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("home");
  const common = await getTranslations("common");
  const [allProjects, settings] = await Promise.all([
    getProjects(),
    getPublicSettings(),
  ]);
  const projects = allProjects.slice(0, 6);

  // Organization (NGO) JSON-LD (master plan Section 7.12). Facts only from
  // the seed content; social profiles only once the board has set them.
  const sameAs = Object.values(settings?.social ?? {}).filter(
    (url): url is string => isConfigured(url) && /^https?:\/\//.test(url),
  );
  const organization = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: common("siteName"),
    alternateName: "Jeunes Leaders Marocains",
    url: getSiteUrl(),
    foundingDate: "2014",
    slogan: common("motto"),
    logo: absoluteUrl(JLM_LOGO_PNG),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Casablanca",
      addressCountry: "MA",
    },
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organization) }}
      />
      <Hero />
      <StatsBand />
      <PoleCards />
      <FlagshipActions />
      {projects.length > 0 && (
        <section className="py-16">
          <Container>
            <h2 className="mb-10 max-w-2xl text-3xl sm:text-4xl">
              {t("featuredProjectsTitle")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const name = resolveLocalized(project.name, locale);
                const tagline = resolveLocalized(project.tagline, locale);
                return (
                  <Link key={project.slug} href={`/projects/${project.slug}`}>
                    <Card className="h-full hover:-translate-y-1 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <ProjectLogo src={project.logo} />
                        <h3 className="text-xl">{name.text}</h3>
                      </div>
                      <p className="text-muted mt-2 text-sm">{tagline.text}</p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}
      <FinalCta />
    </>
  );
}
