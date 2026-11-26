"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/lib/content/locale";
import { boundaryLabels } from "@/lib/i18n/boundary-labels";
import { JLM_LOGO_SRC } from "@/lib/content/image-src";

/**
 * Shown instantly while a page under /[locale] loads (Next.js wraps every
 * page in a Suspense boundary that falls back to this). The pulse and the
 * bar animation are disabled under prefers-reduced-motion (motion-safe:),
 * and screen readers get a polite "Loading…" status.
 *
 * Client component on purpose: a server-side `getTranslations` here runs
 * outside the layout's `setRequestLocale` and forced every page to render
 * per request. Its text comes from boundary-labels.ts rather than
 * useTranslations, so no message formatter ships to the browser.
 */
export default function Loading() {
  const labels = boundaryLabels[useLocale() as AppLocale];
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4"
    >
      <Image
        src={JLM_LOGO_SRC}
        alt=""
        width={88}
        height={88}
        sizes="88px"
        priority
        className="motion-safe:animate-[jlm-pulse_1.6s_ease-in-out_infinite]"
      />
      <div
        aria-hidden="true"
        className="bg-tint-violet relative h-1.5 w-40 overflow-hidden rounded-full"
      >
        <span className="bg-primary absolute inset-y-0 start-0 w-1/3 rounded-full motion-safe:animate-[jlm-loading-bar_1.2s_ease-in-out_infinite]" />
      </div>
      <p className="text-muted text-sm">{labels.loading}</p>
    </div>
  );
}
