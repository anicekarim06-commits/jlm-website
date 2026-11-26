import type { Metadata } from "next";
import { Figtree, Cairo } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { SkipLink } from "@/components/layout/SkipLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "@/styles/globals.css";

// One friendly sans for Latin (Figtree, the closest free match to the
// custom sans on alan.com that inspired the 2026-11-20 redesign) and Cairo
// for Arabic — see docs/DECISIONS.md.
const latin = Figtree({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});
const arabic = Cairo({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ISR floor so a Firestore edit shows up within a minute even without an
// on-demand revalidatePath/revalidateTag call (master plan Section 8.3).
// Applies to every page under [locale] unless a page sets its own.
export const revalidate = 60;

// Staging must stay out of search results (risk #11): set SITE_NOINDEX=true
// there. robots.ts reads the same flag.
const noindex = process.env.SITE_NOINDEX === "true";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  // Every page sets its own translated title (src/lib/seo); this adds the
  // site name. The home page is in this same segment, so the template does
  // not apply to it and it keeps its own full title.
  title: {
    default: "JLM ENSAM Casablanca",
    template: "%s · JLM ENSAM Casablanca",
  },
  ...(noindex && { robots: { index: false, follow: false } }),
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Lets next-intl read the locale without request headers, so pages can be
  // statically rendered and cached (ISR) instead of rendered per request.
  setRequestLocale(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${latin.variable} ${arabic.variable}`}
    >
      <body>
        {/* messages={null}: interactive components get their text from the
            server as props, so the full message catalogue is not sent with
            every page. Form pages add their own provider with just their
            section (see FormMessages). */}
        <NextIntlClientProvider locale={locale} messages={null}>
          <SkipLink />
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
