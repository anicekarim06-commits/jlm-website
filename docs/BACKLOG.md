# Backlog (post-Gate-3 / out of frozen scope)

Anything requested that is not in `JLM_PHASE3_DEMO_EXECUTION_PLAN.md` Section 2's frozen scope goes here instead of being built. Per risk #1 and #3 (Avoid strategy), nothing here gets built before Gate 3 (27 Nov 2026).

- **Real, live online card payment (release 2, master plan Section 8.5).** A test-mode-only Stripe Checkout demo was added 2026-11-20 at explicit user request as an exception to this freeze (see `docs/DECISIONS.md`) — it cannot take real money and is not a substitute for this item. Going live needs a real merchant account the board hasn't set up, and Stripe itself doesn't pay out to Moroccan bank accounts (see `docs/OPEN_QUESTIONS.md`), so launch likely needs CMI or PayPal Business instead.
- Dark mode (master plan Section 7.2 — optional for release 1, build only if time remains after Gate 3).
- Rebuilding any of the 8 external platforms/games.
- Weekly link-checker GitHub Action for the 8 external platforms (master plan Section 8.3, "nice to have" — not required for the Gate 3 AC, just re-test manually before the 20 and 24 Nov checkpoints).
- `stylelint-use-logical` for full raw-CSS logical-property coverage (current lint is a grep-based script; see `docs/DECISIONS.md`).
- Weekly Firestore export to Storage (master plan Section 9, "backups" — Phase 4/launch concern).
- Shared (non-in-memory) rate-limit store for `/api/pledges`, `/api/contact`, `/api/join` if Netlify ever runs them as multiple concurrent function instances — see `src/lib/security/rate-limit.ts`.
- Wire `src/lib/analytics/track.ts` to Cloudflare Web Analytics (or equivalent cookie-less tool, master plan Section 2) — currently a dev-only console.log stub so call sites exist now.
- **CI pipeline (T2.12, never built).** `.github/workflows/` does not exist. Add lint, typecheck, unit, build, Playwright (`tests/e2e/gate3-routes.spec.ts` covers FR+AR with axe), and Lighthouse CI budgets. First Phase 4 task; risk #5 assumed it existed.
- Generated `opengraph-image` per locale (master plan Section 7.12). Needs Arabic font loading inside `ImageResponse`; pages currently fall back to the post, project or campaign cover image when one is set.
- `BreadcrumbList` JSON-LD (master plan Section 7.12).
- Home page "Latest news" section and pinned announcement (master plan Section 7.7, Home items 7). The News module exists now; only the Home teaser is missing.
- Static caravan map on the Impact page (blocked on content, see `docs/OPEN_QUESTIONS.md`).
- **Scroll-reveal animations (requested 2026-11-26, deferred by the user until further notice).** Ideas: photos unveiling from the centre, cards sliding in from the sides (mirrored in RTL), a staggered photo strip, and possibly a pinned horizontal gallery (that one borders on master plan 7.9 "no parallax"). Proposed approach: CSS scroll-driven animations (`animation-timeline: view()`), no JS and no library. Content stays visible by default and when `prefers-reduced-motion` is set, so there is no LCP/CLS risk.
- **Last ~12 KB gz of JS per page (master plan 7.11 budget is 150 KB; pages are at ~158 KB, of which ~125 KB is the Next.js/React framework).** The remaining app-side cost is next-intl's message formatter, which `NextIntlClientProvider` imports unconditionally; the layout still needs the provider because next-intl's `Link` calls `useLocale()` on the client. Removing it means replacing next-intl's `Link`/`usePathname` with our own locale-aware wrappers around `next/link` sitewide. Too risky the day before Gate 3; measure again with Lighthouse on staging first.
