import { useTranslations } from "next-intl";

/**
 * Visible "Traduction en cours" note shown when AR/EN content falls back
 * to French (master plan Section 8.1, risk #8 Accept strategy). The
 * fallback text itself is French, so it carries `lang="fr"`/`dir="ltr"`
 * via the wrapping element at the call site; this note is in the page's
 * own language.
 */
export function FallbackNote({ show }: { show: boolean }) {
  const t = useTranslations("fallback");
  if (!show) return null;
  return (
    <p className="bg-tint-yellow text-text/80 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
      {t("translationInProgress")}
    </p>
  );
}

/**
 * Attributes for a text block that may be a French fallback: `lang="fr"`
 * (screen readers switch voice) and `dir="ltr"` (French punctuation stays
 * in place). On Arabic pages, globals.css right-aligns `[data-fallback]`
 * blocks so they line up with the rest of the RTL layout instead of
 * jumping to the left.
 */
export function fallbackAttrs(isFallback: boolean) {
  return isFallback
    ? ({ lang: "fr", dir: "ltr", "data-fallback": "" } as const)
    : {};
}
