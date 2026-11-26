import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { staticPageMetadata } from "@/lib/seo/static-metadata";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "legalPrivacy", "/legal/privacy");
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("legal");

  return (
    <Container className="py-12">
      <h1 className="text-4xl sm:text-5xl">{t("privacyTitle")}</h1>
      <div className="mt-6 flex max-w-prose flex-col gap-4 text-sm">
        <p>
          JLM ENSAM Casablanca collecte les données que vous nous fournissez
          volontairement par les formulaires du site : promesse de don (nom
          optionnel, email ou téléphone, montant, message), contact (nom, email,
          sujet, message), candidature pour nous rejoindre (nom, école, année,
          pôle, motivation, téléphone ou email).
        </p>
        <p>
          Ces données sont utilisées uniquement pour traiter votre demande
          (confirmer un don, répondre à votre message, étudier votre
          candidature) et ne sont jamais revendues ni partagées avec un tiers.
        </p>
        <p>
          Elles sont accessibles uniquement aux membres du bureau et
          administrateurs du site, via un accès sécurisé, et conservées 12 mois
          avant suppression.
        </p>
        <p>
          Vous pouvez demander la consultation ou la suppression de vos données
          à tout moment en nous écrivant via la page Contact.
        </p>
        <p>
          TODO(board) : JLM a-t-elle déclaré ce traitement de données auprès de
          la CNDP (loi 09-08) ? Voir docs/OPEN_QUESTIONS.md, question 8.
        </p>
      </div>
    </Container>
  );
}
