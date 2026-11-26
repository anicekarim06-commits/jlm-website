import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPoles } from "@/lib/content/poles";
import { getPublicSettings } from "@/lib/content/settings";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { JoinForm } from "@/components/sections/JoinForm";
import { staticPageMetadata } from "@/lib/seo/static-metadata";
import { FormMessages } from "@/components/ui/FormMessages";
import { FormUnavailable } from "@/components/sections/FormUnavailable";
import { canAcceptFormMessages } from "@/lib/forms/availability";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "join", "/join");
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("join");
  const poles = await getPoles();
  const settings = await getPublicSettings();

  return (
    <Container className="py-12">
      <h1 className="text-4xl sm:text-5xl">{t("title")}</h1>
      <p className="text-muted mt-2 max-w-prose">{t("intro")}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="font-semibold">{t("juniorTitle")}</h2>
          <p className="text-muted mt-1 text-sm">{t("juniorBody")}</p>
        </Card>
        <Card>
          <h2 className="font-semibold">{t("volunteerTitle")}</h2>
          <p className="text-muted mt-1 text-sm">{t("volunteerBody")}</p>
        </Card>
      </div>

      <div className="mt-10 max-w-lg">
        {settings?.joinOpen === false ? (
          <p className="text-muted">{t("closedNotice")}</p>
        ) : canAcceptFormMessages() ? (
          <FormMessages namespaces={["join"]}>
            <JoinForm poles={poles} />
          </FormMessages>
        ) : (
          <FormUnavailable />
        )}
      </div>
    </Container>
  );
}
