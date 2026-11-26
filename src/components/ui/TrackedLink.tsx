"use client";

import type { ComponentProps } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics/track";

/**
 * A plain `<a>` that fires a cookie-less analytics event on click. The
 * link works without JavaScript; the event is a progressive extra.
 */
export function TrackedLink({
  event,
  eventData,
  onClick,
  ...props
}: ComponentProps<"a"> & {
  event: AnalyticsEvent;
  eventData?: Record<string, string | number>;
}) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackEvent(event, eventData);
        onClick?.(e);
      }}
    />
  );
}
