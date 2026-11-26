import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCampaigns, getActiveCampaigns } from "@/lib/content/campaigns";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/donate/ProgressBar";
import { Link } from "@/lib/i18n/navigation";
import { staticPageMetadata } from "@/lib/seo/static-metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "donate", "/donate");
}

export default async function DonateListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as AppLocale;
  const t = await getTranslations("donate");

  const all = await getCampaigns();
  const active = await getActiveCampaigns();
  // Only campaigns that have actually ended are "past" — an upcoming one
  // (startsAt in the future) used to be mislabelled as past and shown as a
  // dead, unclickable card.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const past = all.filter((c) => c.endsAt.getTime() < now);

  return (
    <Container className="py-12">
      <h1 className="text-4xl sm:text-5xl">{t("title")}</h1>
      <p className="text-muted mt-4 max-w-prose">{t("intro")}</p>

      <h2 className="mt-10 mb-4 text-2xl">{t("activeCampaigns")}</h2>
      {active.length === 0 ? (
        <p className="text-muted">{t("noActiveCampaigns")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((campaign) => {
            const title = resolveLocalized(campaign.title, locale);
            return (
              <Link key={campaign.slug} href={`/donate/${campaign.slug}`}>
                <Card className="h-full hover:-translate-y-1 hover:shadow-md">
                  <h3 className="text-xl">{title.text}</h3>
                  <div className="mt-3">
                    <ProgressBar
                      label={t("progressLabel")}
                      receivedMAD={campaign.receivedMAD}
                      goalMAD={campaign.goalMAD}
                    />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mt-10 mb-4 text-2xl">{t("pastCampaigns")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {past.map((campaign) => {
              const title = resolveLocalized(campaign.title, locale);
              return (
                <Card key={campaign.slug}>
                  <h3 className="text-xl">{title.text}</h3>
                  <p className="text-muted mt-1 text-sm">
                    <bdi dir="ltr">{campaign.receivedMAD}</bdi> MAD
                  </p>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </Container>
  );
}
