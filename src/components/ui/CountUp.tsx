"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1200;

/**
 * Animated counter (master plan Section 7.9): counts up once when scrolled
 * into view, and stays static under `prefers-reduced-motion`.
 *
 * The server renders the final value, so the number is correct without
 * JavaScript, for crawlers and for screen readers (which always get the
 * final value via the visually hidden copy). The animation only starts if
 * the counter is still below the fold when the page hydrates, so a figure
 * already on screen never flashes back to 0.
 */
export function CountUp({ value, locale }: { value: number; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const format = new Intl.NumberFormat(locale);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return; // already visible: stay static

    let frame = 0;
    setDisplay(0);
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION_MS, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref}>
      <bdi dir="ltr" aria-hidden="true" className="tabular-nums">
        {format.format(display)}
      </bdi>
      <span className="sr-only">{format.format(value)}</span>
    </span>
  );
}
