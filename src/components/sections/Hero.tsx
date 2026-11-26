import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { getFeaturedCampaign } from "@/lib/content/campaigns";
import { getStats } from "@/lib/content/stats";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { siteImages } from "@/lib/content/site-images";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export async function Hero() {
  const t = await getTranslations("home");
  const common = await getTranslations("common");
  const nav = await getTranslations("nav");
  const imagery = await getTranslations("imagery");
  const locale = (await getLocale()) as AppLocale;
  const campaign = await getFeaturedCampaign();
  const stats = await getStats();

  const beneficiaries = stats.find((s) => s.key === "beneficiaries");
  const members = stats.find((s) => s.key === "active-members");
  const format = new Intl.NumberFormat(locale);

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
      <Container className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col items-start gap-6">
          <span className="bg-tint-violet text-text rounded-full px-4 py-1.5 text-sm font-medium">
            {common("motto")}
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl">
            {common("siteName")}
          </h1>
          <p className="text-muted max-w-xl text-lg sm:text-xl">
            {t("heroSubline")}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <LinkButton
              href={campaign ? `/donate/${campaign.slug}` : "/donate"}
              size="lg"
            >
              {nav("donate")}
            </LinkButton>
            <LinkButton href="/projects" variant="secondary" size="lg">
              {t("discoverProjects")}
            </LinkButton>
          </div>
        </div>

        <div className="relative">
          <div className="bg-tint-violet relative aspect-[4/5] overflow-hidden rounded-[32px] sm:aspect-[5/4]">
            <Image
              src={siteImages.hero.src}
              alt={imagery("hero")}
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>

          {beneficiaries && (
            <div className="bg-bg absolute start-4 -bottom-6 rounded-2xl px-5 py-4 shadow-md sm:-start-6">
              <p className="text-primary text-3xl font-medium sm:text-4xl">
                <bdi dir="ltr">{format.format(beneficiaries.value)}</bdi>
              </p>
              <p className="text-muted text-sm">
                {resolveLocalized(beneficiaries.label, locale).text}
              </p>
            </div>
          )}
          {members && (
            <div className="bg-tint-mint absolute end-4 top-6 rounded-2xl px-5 py-4 shadow-md sm:-end-4">
              <p className="text-text text-3xl font-medium sm:text-4xl">
                <bdi dir="ltr">{format.format(members.value)}</bdi>
              </p>
              <p className="text-text/75 text-sm">
                {resolveLocalized(members.label, locale).text}
              </p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
