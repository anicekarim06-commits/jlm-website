import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import type { AppLocale } from "@/lib/content/locale";
import { getCardContact } from "@/lib/id-card/card-data";
import { contactLinks } from "@/lib/id-card/contact";
import { qrSvg } from "@/lib/id-card/qr";
import { absoluteUrl } from "@/lib/seo/site-url";
import { pageMetadata } from "@/lib/seo/metadata";
import { LinkButton } from "@/components/ui/Button";
import { PrintButton } from "@/components/ui/PrintButton";
import { IdCardMark } from "@/components/sections/IdCardMark";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "idCard" });
  return pageMetadata({
    locale: locale as AppLocale,
    path: "/id/print",
    title: t("printTitle"),
    description: t("description"),
    // A print utility, not a landing page.
    noindex: true,
  });
}

// A6 = 105 × 148 mm (master plan Section 8.2). On paper only the two
// faces print, one per page; the site header, footer and the on-screen
// controls are hidden.
const printCss = `
@page { size: 105mm 148mm; margin: 0; }
@media print {
  body > a, header, footer, [data-print-hide] { display: none !important; }
  main { padding: 0 !important; }
  .id-face { box-shadow: none !important; border: 0 !important; border-radius: 0 !important; break-after: page; }
}
`;

const faceClasses =
  "id-face bg-bg flex h-[148mm] w-[105mm] flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-black/10 p-[10mm] text-center shadow-sm";

export default async function IdCardPrintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("idCard");
  const common = await getTranslations("common");
  const contact = await getCardContact();
  const links = contactLinks(contact);
  const cardUrl = absoluteUrl("/id");
  const qr = await qrSvg(cardUrl);
  const shortUrl = cardUrl.replace(/^https?:\/\//, "");

  return (
    <div className="bg-surface flex flex-col items-center gap-8 px-4 py-10 print:bg-white print:p-0">
      <style>{printCss}</style>

      <div
        data-print-hide
        className="flex max-w-xl flex-col items-center gap-4 text-center"
      >
        <h1 className="text-3xl">{t("printTitle")}</h1>
        <p className="text-muted">{t("printHint")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <PrintButton label={t("printAction")} />
          <LinkButton href="/id" variant="secondary">
            {t("backToCard")}
          </LinkButton>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-8 print:block">
        <section aria-label={t("printFront")} className={faceClasses}>
          <IdCardMark size="lg" />
          <div>
            <p className="text-2xl font-medium">{common("siteName")}</p>
            <p className="text-muted mt-1">{common("motto")}</p>
          </div>
          <div
            role="img"
            aria-label={t("qrAlt")}
            className="size-[45mm]"
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          <p className="text-sm">
            <bdi dir="ltr">{shortUrl}</bdi>
          </p>
        </section>

        <section aria-label={t("printBack")} className={faceClasses}>
          <p className="text-xl font-medium">{t("contactTitle")}</p>
          {links.length > 0 ? (
            <dl className="flex w-full flex-col gap-3 text-start">
              {links.map((link) => (
                <div key={link.kind}>
                  <dt className="text-muted text-xs">{t(link.kind)}</dt>
                  <dd className="break-all">
                    <bdi dir="ltr">{link.display}</bdi>
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-muted">{t("printNoContacts")}</p>
          )}
          <p className="mt-auto text-sm">
            <bdi dir="ltr">{shortUrl}</bdi>
          </p>
        </section>
      </div>
    </div>
  );
}
