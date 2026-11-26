import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPartners } from "@/lib/content/partners";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import type { Partner } from "@/lib/validation/schemas";
import { staticPageMetadata } from "@/lib/seo/static-metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "partners", "/partners");
}

const tierTitleKey: Record<Partner["tier"], string> = {
  institutional: "institutional",
  sponsor: "sponsors",
  supplier: "suppliers",
};

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("partners");
  const partners = await getPartners();

  const byTier = (tier: Partner["tier"]) =>
    partners.filter((p) => p.tier === tier);

  return (
    <Container className="py-12">
      <h1 className="text-4xl sm:text-5xl">{t("title")}</h1>

      {partners.length === 0 ? (
        <p className="text-muted mt-6">{t("noPartners")}</p>
      ) : (
        (["institutional", "sponsor", "supplier"] as const).map((tier) => {
          const items = byTier(tier);
          if (items.length === 0) return null;
          return (
            <section key={tier} className="mt-8">
              <h2 className="mb-4 font-semibold">{t(tierTitleKey[tier])}</h2>
              <div className="flex flex-wrap items-center gap-6">
                {items.map((partner) =>
                  partner.url ? (
                    <a
                      key={partner.id}
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- storage URLs, next/image loader not wired up yet */}
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="h-12 object-contain"
                      />
                    </a>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- storage URLs, next/image loader not wired up yet
                    <img
                      key={partner.id}
                      src={partner.logo}
                      alt={partner.name}
                      className="h-12 object-contain"
                    />
                  ),
                )}
              </div>
            </section>
          );
        })
      )}

      <LinkButton href="/contact" variant="secondary" className="mt-10">
        {t("becomePartner")}
      </LinkButton>
    </Container>
  );
}
