import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCampaign } from "@/lib/content/campaigns";
import { getPublicSettings } from "@/lib/content/settings";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/donate/ProgressBar";
import { PledgeForm } from "@/components/donate/PledgeForm";
import { LinkButton } from "@/components/ui/Button";
import { ViewTracker } from "@/components/ui/ViewTracker";
import { isCardPaymentsEnabled } from "@/lib/payments/stripe";
import { pageMetadata, jsonLd, localizedPath } from "@/lib/seo/metadata";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site-url";
import { FormMessages } from "@/components/ui/FormMessages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; campaign: string }>;
}): Promise<Metadata> {
  const { campaign: slug, locale } = await params;
  const campaign = await getCampaign(slug);
  if (!campaign) return {};
  return pageMetadata({
    locale: locale as AppLocale,
    path: `/donate/${campaign.slug}`,
    title: resolveLocalized(campaign.title, locale as AppLocale).text,
    description: resolveLocalized(campaign.summary, locale as AppLocale).text,
    image: campaign.cover,
  });
}

// No slugs are prerendered at build time (content lives in Firestore);
// each page is rendered on first visit and then cached (ISR).
export function generateStaticParams() {
  return [];
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ locale: string; campaign: string }>;
}) {
  const { locale: localeParam, campaign: slug } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as AppLocale;
  const campaign = await getCampaign(slug);
  if (!campaign) notFound();

  const t = await getTranslations("donate");
  const settings = await getPublicSettings();
  const title = resolveLocalized(campaign.title, locale);
  const story = resolveLocalized(campaign.story, locale);
  // One-time computation for this request, not a client re-render concern.
  // eslint-disable-next-line react-hooks/purity
  const hasEnded = campaign.endsAt.getTime() < Date.now();
  // DonateAction JSON-LD (master plan Section 7.12).
  const donateAction = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: title.text,
    description: resolveLocalized(campaign.summary, locale).text,
    url: absoluteUrl(localizedPath(locale, `/donate/${campaign.slug}`)),
    recipient: {
      "@type": "NGO",
      name: "JLM ENSAM Casablanca",
      url: getSiteUrl(),
    },
    priceCurrency: "MAD",
    startTime: campaign.startsAt.toISOString(),
    endTime: campaign.endsAt.toISOString(),
  };

  return (
    <Container className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(donateAction) }}
      />
      <ViewTracker event="donate_view" data={{ campaign: campaign.slug }} />
      <h1 className="text-4xl sm:text-5xl">{title.text}</h1>
      <p className="text-muted mt-4 max-w-prose">{story.text}</p>

      <div className="mt-6 max-w-md">
        <ProgressBar
          label={t("progressLabel")}
          receivedMAD={campaign.receivedMAD}
          goalMAD={campaign.goalMAD}
        />
      </div>

      {campaign.breakdown.length > 0 && (
        <Card className="mt-6 max-w-md">
          <h2 className="mb-2 font-semibold">{t("breakdownTitle")}</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {campaign.breakdown.map((item, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>{resolveLocalized(item.label, locale).text}</span>
                <bdi dir="ltr">{item.amountMAD} MAD</bdi>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {settings?.donationsEnabled === false ? (
        <p className="text-muted mt-8 max-w-md">{t("disabledNotice")}</p>
      ) : hasEnded ? (
        <div className="mt-8">
          <p className="text-muted">{t("campaignEndedNotice")}</p>
          <LinkButton href="/donate" variant="secondary" className="mt-3">
            {t("seeNextCampaign")}
          </LinkButton>
        </div>
      ) : (
        <div className="mt-8 max-w-md">
          <FormMessages namespaces={["donate"]}>
            <PledgeForm
              campaignSlug={campaign.slug}
              inKindAccepted={campaign.inKindAccepted}
              cardPaymentsEnabled={isCardPaymentsEnabled()}
            />
          </FormMessages>
        </div>
      )}
    </Container>
  );
}
