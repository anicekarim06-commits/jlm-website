import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPublicSettings } from "@/lib/content/settings";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/sections/ContactForm";
import { isConfigured } from "@/lib/id-card/contact";
import { staticPageMetadata } from "@/lib/seo/static-metadata";
import { FormMessages } from "@/components/ui/FormMessages";
import { FormUnavailable } from "@/components/sections/FormUnavailable";
import { canAcceptFormMessages } from "@/lib/forms/availability";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return staticPageMetadata(params, "contact", "/contact");
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("contact");
  const settings = await getPublicSettings();
  // Seeded values are `TODO(board): …` placeholders until the board answers
  // docs/OPEN_QUESTIONS.md #5 — never render those.
  const email = settings?.contact.email;
  const phone = settings?.contact.phone;
  const whatsapp = settings?.contact.whatsapp;

  return (
    <Container className="py-12">
      <h1 className="text-4xl sm:text-5xl">{t("title")}</h1>
      <p className="text-muted mt-2 max-w-prose">{t("intro")}</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr]">
        {canAcceptFormMessages() ? (
          <FormMessages namespaces={["contact"]}>
            <ContactForm />
          </FormMessages>
        ) : (
          <FormUnavailable />
        )}

        <aside className="flex flex-col gap-2 text-sm">
          {isConfigured(email) && (
            <a href={`mailto:${email}`} className="text-primary font-medium">
              <bdi dir="ltr">{email}</bdi>
            </a>
          )}
          {isConfigured(phone) && (
            <p>
              <bdi dir="ltr">{phone}</bdi>
            </p>
          )}
          {isConfigured(whatsapp) && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium"
            >
              {t("whatsapp")}
            </a>
          )}
        </aside>
      </div>
    </Container>
  );
}
