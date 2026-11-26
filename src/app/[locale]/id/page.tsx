import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getStats } from "@/lib/content/stats";
import { getPoles } from "@/lib/content/poles";
import { resolveLocalized, type AppLocale } from "@/lib/content/locale";
import { getCardContact } from "@/lib/id-card/card-data";
import { contactLinks } from "@/lib/id-card/contact";
import { qrSvg } from "@/lib/id-card/qr";
import { absoluteUrl } from "@/lib/seo/site-url";
import { pageMetadata } from "@/lib/seo/metadata";
import { pickCardStats, poleTone } from "@/lib/id-card/card-stats";
import { Link } from "@/lib/i18n/navigation";
import { LinkButton } from "@/components/ui/Button";
import { PoleBadge } from "@/components/ui/Badge";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { ViewTracker } from "@/components/ui/ViewTracker";
import { IdCardMark } from "@/components/sections/IdCardMark";
import { ShareLinks } from "@/components/sections/ShareLinks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "idCard" });
  return pageMetadata({
    locale: locale as AppLocale,
    path: "/id",
    title: t("title"),
    description: t("description"),
  });
}

const contactLabelKey = {
  call: "call",
  whatsapp: "whatsapp",
  email: "email",
  instagram: "instagram",
  facebook: "facebook",
  linkedin: "linkedin",
} as const;

export default async function IdCardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as AppLocale;
  const t = await getTranslations("idCard");
  const common = await getTranslations("common");
  const home = await getTranslations("home");
  const newsT = await getTranslations("news");

  const [stats, poles, contact] = await Promise.all([
    getStats(),
    getPoles(),
    getCardContact(),
  ]);
  const figures = pickCardStats(stats);
  const links = contactLinks(contact);
  // The QR always encodes the short, locale-less `/id` printed on cards —
  // the proxy picks the visitor's language (master plan Section 4.3).
  const cardUrl = absoluteUrl("/id");
  const qr = await qrSvg(cardUrl);
  const format = new Intl.NumberFormat(locale);

  return (
    <div className="bg-surface px-4 py-10 sm:py-16">
      <ViewTracker event="id_view" />
      <article className="bg-bg mx-auto flex max-w-md flex-col gap-8 rounded-3xl p-6 shadow-sm sm:p-8">
        <header className="flex items-center gap-4">
          <IdCardMark />
          <div>
            <h1 className="text-2xl">{common("siteName")}</h1>
            <p className="text-muted">{common("motto")}</p>
          </div>
        </header>

        <p className="text-text/80">{home("heroSubline")}</p>

        <TrackedLink
          href="/api/vcard"
          download="jlm-ensam-casablanca.vcf"
          event="vcard_download"
          className="bg-primary text-primary-contrast inline-flex min-h-12 items-center justify-center rounded-xl px-6 text-lg font-medium shadow-sm hover:brightness-110"
        >
          {t("saveContact")}
        </TrackedLink>

        {figures.length > 0 && (
          <section aria-labelledby="id-figures">
            <h2 id="id-figures" className="sr-only">
              {t("figuresTitle")}
            </h2>
            <dl className="grid grid-cols-3 gap-2 text-center">
              {figures.map((stat) => (
                <div
                  key={stat.key}
                  className="bg-tint-violet flex flex-col-reverse rounded-2xl p-3"
                >
                  <dt className="text-text/75 text-xs">
                    {resolveLocalized(stat.label, locale).text}
                  </dt>
                  <dd className="text-text text-xl font-medium">
                    <bdi dir="ltr">{format.format(stat.value)}</bdi>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-muted mt-2 text-xs">
              {home("statsAsOf", { year: figures[0]?.asOf ?? "" })}
            </p>
          </section>
        )}

        {poles.length > 0 && (
          <section aria-labelledby="id-poles">
            <h2 id="id-poles" className="mb-2 text-sm font-medium">
              {t("polesTitle")}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {poles.map((pole) => (
                <li key={pole.slug}>
                  <Link href={`/poles/${pole.slug}`}>
                    <PoleBadge tone={poleTone[pole.slug]}>
                      {resolveLocalized(pole.name, locale).text}
                    </PoleBadge>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="id-contact">
          <h2 id="id-contact" className="mb-2 text-sm font-medium">
            {t("contactTitle")}
          </h2>
          {links.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {links.map((link) => (
                <li key={link.kind}>
                  <a
                    href={link.href}
                    {...(link.href.startsWith("http") && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                    className="hover:bg-surface flex min-h-11 items-center justify-between gap-3 rounded-xl border border-black/10 px-4 py-2"
                  >
                    <span className="font-medium">
                      {t(contactLabelKey[link.kind])}
                    </span>
                    <bdi dir="ltr" className="text-muted truncate text-sm">
                      {link.display}
                    </bdi>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <Link
              href="/contact"
              className="text-primary font-medium underline"
            >
              {t("contactFallback")}
            </Link>
          )}
        </section>

        <figure className="flex flex-col items-center gap-2">
          <div
            role="img"
            aria-label={t("qrAlt")}
            className="size-40"
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          <figcaption className="text-muted text-sm">
            <bdi dir="ltr">{cardUrl.replace(/^https?:\/\//, "")}</bdi>
          </figcaption>
        </figure>

        <section aria-labelledby="id-share">
          <h2 id="id-share" className="mb-2 text-sm font-medium">
            {t("share")}
          </h2>
          <ShareLinks
            url={cardUrl}
            title={common("siteName")}
            labels={{
              copyLink: newsT("copyLink"),
              linkCopied: newsT("linkCopied"),
              opensInNewTab: newsT("opensInNewTab"),
            }}
          />
        </section>

        <div className="flex flex-wrap gap-3">
          <LinkButton href="/" variant="secondary">
            {t("seeFullSite")}
          </LinkButton>
          <LinkButton href="/id/print" variant="ghost">
            {t("print")}
          </LinkButton>
        </div>
      </article>
    </div>
  );
}
