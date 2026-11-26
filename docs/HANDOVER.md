# Handover note

Updated at every gate and whenever the PM role rotates (risk #13). Read this before picking up the project.

## 2026-11-26: remaining Gate 3 modules built, Gate 3 pack assembled

**Start with `docs/GATE3_PACK.md`.** It has module status, test numbers, content status, the risk review and the ordered demo-prep list for 27 Nov.

**Built on branch `feat/gate3-remaining-modules` (not merged):** News and ads with RSS per locale (T3.4); digital ID card `/id`, `/id/print` (A6) and `/api/vcard` (J5); Impact page with reduced-motion-safe counters (T3.8); per-page translated metadata, hreflang, sitemap, robots and JSON-LD (T3.9); a visible "Traduction en cours" note on project, pôle and news pages (T3.7). The ComingSoon placeholders are gone. Admin post writes now revalidate the public News pages directly.

**Bugs fixed on the way:** the Contact page rendered `TODO(board): …` settings verbatim (`isConfigured()` in `src/lib/id-card/contact.ts` now guards every contact value); 4 WCAG AA failures (contrast + label-in-name); and in Arabic on phones, the header site name wrapped to three lines and overflowed.

**Verified:** typecheck, lint, 32 unit tests, and 62 Playwright tests (FR+AR, desktop+mobile, axe), all against a local production build **with no Firebase data**. **Not verified:** anything with real data, the rules emulator suite (needs Java 21+), Lighthouse, WebKit, and the manual passes.

**Environment notes for the next person:** pnpm is not on PATH on this machine, so use `corepack pnpm …`. The `corepack` shim on Windows breaks on paths containing `(protected)`; call `node node_modules/prettier/bin/prettier.cjs` directly for those. `.env.example` now exists (it was referenced before but never committed), including the new `SITE_NOINDEX` flag for staging.

**Biggest gap found:** there is no CI at all (`.github/workflows/` does not exist), so nothing runs on pull requests. Make this the first Phase 4 task.

## 2026-11-19 — foundation + Phase 3 build started (this session)

**What exists:** repo scaffolded from scratch (Next.js 16 App Router, TypeScript, Tailwind v4, `next-intl`, Firebase client + Admin SDK, zod). See `docs/DECISIONS.md` for why — the repo was empty when this session started despite the plan assuming Gate 2 was passed.

**What to check next session:** run `git log --oneline` and read this file's latest entry before doing anything; it will say exactly which T-numbered task was last completed and demonstrated, and which is in progress.

**Known gaps that are not code problems:** see `docs/OPEN_QUESTIONS.md` — bank details, Arabic native review, legal/CNDP contact, and brand colors all need a real person on the JLM board or team, not more development time.

## 2026-11-20 — Admin CRUD built for Posts, Campaigns, Projects, Platforms, Settings

The biggest remaining T3.6 gap from the previous entry is closed: `/admin/posts`, `/admin/campaigns` (admin-only), `/admin/projects`, `/admin/platforms` (editor+admin) and `/admin/settings` (admin-only) now have working list + create + edit + delete + publish-toggle, all going through `requireEditorOrAdmin`/`requireAdmin` (`src/lib/security/require-role.ts`) and logging `updatedBy`/`updatedAt` on every write. Not run against real data — same caveat as everything else, no Firebase project configured in this session.

**Known gaps against the full T3.6 AC** (`JLM_PHASE3_DEMO_EXECUTION_PLAN.md`), left for a follow-up session, not silently dropped:

- No image uploader — cover/logo/screenshot fields are plain URL text inputs, same as the seed data. Firebase Storage client exists but nothing uploads to it yet.
- No autosave, no preview.
- Nested array-of-object fields (campaign `breakdown`, project `stats`/`leads`) are edited as raw JSON in a textarea, not a dynamic repeater UI — functional for a technical admin, not friendly for a non-technical board member.
- Wrong-role access redirects to `/admin` (same pattern the existing Pledges page already used), not the dedicated "403 screen" the day-by-day plan's AC names.
- CRUD for the smaller entities the write-matrix also covers (stats, flagship actions, team, partners, users) isn't built — only the five entities `docs/BACKLOG.md`/this file previously flagged as missing.

## 2026-11-20 — Stripe webhook gotchas found while testing locally

- The Stripe CLI (`stripe listen`) must be switched to the **same Stripe account as `STRIPE_SECRET_KEY`** (`stripe switch <acct_id>`). `stripe login` authorizes both sandboxes ("jlm web" and "jlm web sandbox") and defaults to one of them; a payment made in the other account never reaches the forwarder, and the pledge stays `pledged`. `whsec_...` differs per account, so update `STRIPE_WEBHOOK_SECRET` and restart `pnpm dev` after switching.
- The CLI login token expires after a few hours; `stripe listen` then dies with a 401 and needs `stripe login` again.
- "Mark pledge received" now lives in `src/lib/payments/reconcile.ts` (idempotent, only acts on a paid session), used by the webhook — a missed event can be replayed by retrieving the session from Stripe and calling it.
- Verified end to end against the Firebase emulator on 2026-11-20: a real test payment and a `stripe trigger checkout.session.completed` both flipped the pledge to `received` and updated the campaign total.

## 2026-11-20 — Stripe test-mode card payment added to the pledge flow

At the user's explicit request (not part of the frozen Gate 3 scope — see `docs/BACKLOG.md` and `docs/DECISIONS.md`), the pledge form now offers a second payment method: a Stripe Checkout redirect, **test mode only**. It only appears/works when `STRIPE_SECRET_KEY` is set in the environment; without it the site behaves exactly as before (bank-transfer only). `src/app/api/webhooks/stripe/route.ts` is new — needs `STRIPE_WEBHOOK_SECRET` and a webhook pointed at `/api/webhooks/stripe` registered in the Stripe dashboard (test mode) to actually flip a card pledge from `pledged` to `received`; untested end-to-end since there's no Stripe account configured in this session. Not run against a real Firebase project, same as the rest of T3.5.

## 2026-11-19 — T3.5 (donation module) + minimal admin panel done

Pledge flow (campaign page → amount/in-kind → form → `/api/pledges` → thank-you with reference + RIB) works end to end against whatever Firestore project is configured; it's just gated `donationsEnabled: false` so nothing can actually be donated until the board confirms bank details. Admin login (Firebase Auth + session cookie) and a Pledges table (mark received/cancelled, CSV export) exist, but that's the only admin screen — Posts/Campaigns/Projects/Platforms/Settings CRUD (the rest of T3.6) is not built yet.

**Not done, and genuinely blocked without a real Firebase project:** nothing in this repo has been run against real data. `pnpm seed`, the admin login, and the Playwright J1 test all need `FIREBASE_ADMIN_*`/`NEXT_PUBLIC_FIREBASE_*` env vars pointing at an actual Firebase project before they can be exercised for real — see `.env.example`.

**Still open from the Phase 3 task list (T3.1–T3.11):** core pages (About/Contact/Join/Partners/Legal), pôle/project/platform pages, news/ads, the rest of the admin panel, multilingual completion review, Impact page, SEO/sharing metadata, final content load, and the Gate 3 pack.
