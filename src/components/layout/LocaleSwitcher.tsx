"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export type LocaleSwitcherLabels = {
  switchLabel: string;
  names: Record<(typeof routing.locales)[number], string>;
};

/**
 * Labels come translated from the server (Header). Calling useTranslations
 * here would ship next-intl's message formatter (~12 KB gz) and every
 * message to the browser on every page, just for four short strings.
 */
export function LocaleSwitcher({ labels }: { labels: LocaleSwitcherLabels }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav
      aria-label={labels.switchLabel}
      className="flex items-center gap-1 text-sm"
    >
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={`/${loc}${pathname === "/" ? "" : pathname}`}
          aria-current={loc === locale ? "true" : undefined}
          className={cn(
            "rounded-md px-2 py-1 font-medium",
            loc === locale
              ? "bg-primary text-primary-contrast"
              : "text-muted hover:text-text",
          )}
        >
          {labels.names[loc]}
        </Link>
      ))}
    </nav>
  );
}
