import Image from "next/image";
import { useTranslations } from "next-intl";
import { JLM_LOGO_SRC } from "@/lib/content/image-src";
import { Link } from "@/lib/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Header() {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const localeT = useTranslations("locale");

  const items: { href: string; label: string }[] = [
    { href: "/about", label: t("about") },
    { href: "/projects", label: t("projects") },
    { href: "/impact", label: t("impact") },
    { href: "/news", label: t("news") },
    { href: "/platforms", label: t("platforms") },
  ];

  return (
    <header className="bg-bg/90 sticky top-0 z-40 border-b border-black/[0.06] backdrop-blur">
      <Container className="flex h-[72px] items-center justify-between gap-4">
        {/* Below lg the header shows the short "JLM" mark: the full name
            wrapped to three lines in Arabic at 390 px and overflowed the bar
            (risk #5). The accessible name starts with the visible "JLM"
            (WCAG 2.5.3 label in name) and adds the full site name. */}
        <Link
          href="/"
          className="text-text flex shrink-0 items-center gap-2.5 text-lg font-semibold tracking-tight whitespace-nowrap"
        >
          <Image
            src={JLM_LOGO_SRC}
            alt=""
            width={40}
            height={40}
            sizes="40px"
            priority
          />
          <span className="lg:hidden">
            JLM<span className="sr-only"> — {common("siteName")}</span>
          </span>
          <span className="hidden lg:inline">{common("siteName")}</span>
        </Link>
        <nav
          aria-label={t("menu")}
          className="hidden items-center gap-6 md:flex"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-text/80 hover:text-text text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LocaleSwitcher
            labels={{
              switchLabel: localeT("switchLabel"),
              names: {
                fr: localeT("fr"),
                ar: localeT("ar"),
                en: localeT("en"),
              },
            }}
          />
          <LinkButton href="/donate" size="sm">
            {t("donate")}
          </LinkButton>
          <details className="relative md:hidden">
            <summary
              className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-md border border-black/10"
              aria-label={t("menu")}
            >
              <span aria-hidden="true">☰</span>
            </summary>
            <nav
              aria-label={t("menu")}
              className="bg-bg absolute end-0 top-full z-50 mt-2 flex w-48 flex-col gap-1 rounded-md border border-black/10 p-2 shadow-md"
            >
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-text rounded-md px-3 py-2 text-sm font-medium hover:bg-black/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </Container>
    </header>
  );
}
