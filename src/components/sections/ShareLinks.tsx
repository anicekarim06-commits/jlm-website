"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics/track";

const linkClasses =
  "inline-flex min-h-11 items-center rounded-xl border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5";

/**
 * Copy link, WhatsApp, Facebook, LinkedIn (master plan Section 7.7, post
 * page). Plain share URLs — no third-party SDK or script is loaded.
 */
export type ShareLinksLabels = {
  copyLink: string;
  linkCopied: string;
  opensInNewTab: string;
};

/** Labels are translated on the server and passed in (no client formatter). */
export function ShareLinks({
  url,
  title,
  labels,
}: {
  url: string;
  title: string;
  labels: ShareLinksLabels;
}) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} ${url}`);

  const targets = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={linkClasses}
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          trackEvent("share_click", { target: "copy" });
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        <span aria-live="polite">
          {copied ? labels.linkCopied : labels.copyLink}
        </span>
      </button>
      {targets.map((target) => (
        <a
          key={target.id}
          href={target.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses}
          onClick={() => trackEvent("share_click", { target: target.id })}
        >
          {target.label}
          <span className="sr-only"> ({labels.opensInNewTab})</span>
        </a>
      ))}
    </div>
  );
}
