import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { staticPageMetadata } from "@/lib/seo/static-metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "legalNotice", "/legal/notice");
}

export default async function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("legal");

  return (
    <Container className="py-12">
      <h1 className="text-4xl sm:text-5xl">{t("noticeTitle")}</h1>
      <div className="mt-6 flex max-w-prose flex-col gap-2 text-sm">
        <p>
          TODO(board): nom légal exact de l&apos;association et adresse du
          siège.
        </p>
        <p>TODO(board): directeur de publication.</p>
        <p>Hébergement : Netlify, Inc.</p>
        <p>
          Voir <code>docs/OPEN_QUESTIONS.md</code> (question 1) — ces
          informations doivent venir du bureau avant publication.
        </p>
      </div>
    </Container>
  );
}
