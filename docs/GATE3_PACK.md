# Gate 3 pack — 27 Nov 2026

T3.11, assembled 26 Nov 2026 per `JLM_PHASE3_DEMO_EXECUTION_PLAN.md` Section 8. Code state: branch `feat/gate3-remaining-modules` (7 commits on top of `main` at `e7deaaa`), **not merged and not deployed yet**.

**Read this first.** Every module in the frozen scope now exists in code, and the site passes its automated checks locally. **None of it has been run against a real or emulated Firebase project in this session.** No credentials were available, and the Firestore emulator needs Java 21+ (this machine has Java 8). So every page below was verified in its **empty-data state** only. The demo needs a seeded staging environment, and the prep list in Section 7 is the critical path for tomorrow.

## 1. Module status (frozen scope, plan Section 2)

| Task | Status | Commit | Known gaps |
| --- | --- | --- | --- |
| T3.1 Core pages | Built | `8eb3458` | Contact page displayed `TODO(board): contact email` verbatim with seeded settings. Fixed in `990b117` |
| T3.2 Pôle + 9 project pages | Built | `0eee3aa`, `cfcbaa0` | Content is French only; AR/EN show the "Traduction en cours" note |
| T3.3 Platforms hub | Built | `0eee3aa` | 2 of 9 external links are broken on the platform side (Section 6, risk #12) |
| T3.4 News and ads | **Built today** | `a372789` | No generated OG image per post |
| T3.5 Donation module | Built, switched off | `d1a17d8`, `e7deaaa` | `donationsEnabled: false`; all 4 seeded campaigns unpublished, with a placeholder goal of 1 MAD |
| T3.6 Admin panel | Partial | `e7deaaa` | No image uploader, no autosave or preview, no dedicated 403 screen, no CRUD for stats, team, partners or users |
| T3.7 Multilingual | Partial | `cfcbaa0` + all | Interface: 236 keys in fr/ar/en, AR and EN **not native-reviewed**. Content: 0 of 149 fields translated, fallback note visible |
| T3.8 Impact page | **Built today** | `357dade` | Static caravan map missing (no image or location list supplied) |
| T3.9 SEO and sharing | **Built today** | `9fff0c9` | No generated OG images, no BreadcrumbList. Rich Results test not run (needs a public URL) |
| T3.10 Content load | Fallback | — | No project lead sent content by the 20 Nov deadline, so the 2026 annual-report text is used (risk #4 fallback) |
| J5 ID card (`/id`) | **Built today** | `990b117` | Logo is a text mark until the board sends logo files. Contacts are hidden until the board sets them |

None of the plan checkboxes are ticked. The rule is to tick only after the merge **and** after the acceptance criterion has been shown with real data, and neither has happened yet.

## 2. Gate 3 success criteria (plan Section 3)

| # | Criterion | Status |
| --- | --- | --- |
| 1 | 3 pôle and 9 project pages render in FR and AR with real seed content | Templates verified. Needs `pnpm seed` on staging to show it |
| 2 | Hub links to all 8 platforms and 3 prototypes | Hub built. GODEM (TLS failure) and Get a Plet (404) are broken at the source |
| 3 | A post published in admin is live within a minute | Code path is in place: the admin action revalidates `/[locale]/news` immediately, with a 60 s ISR floor. **Not demonstrated with real data** |
| 4 | Full pledge, then marked received, updates the progress bar | Code is in place. **Blocked:** no published campaign and donations switched off (Section 7) |
| 5 | No blocking bug on J1, J5, J6 | J5 verified locally. J1 and J6 not verified with data |
| 6 | Lighthouse mobile budgets on Home, a project page, the campaign page and `/id` | **Not run** (Section 3) |

## 3. Test status (26 Nov 2026, local production build)

| Check | Result |
| --- | --- |
| Typecheck, ESLint, logical-property lint | Pass |
| Unit tests (Vitest) | **32 passed**, 5 files: reference generator, locale fallback, news scheduling and RSS, vCard and contacts, SEO |
| E2E (Playwright), Chromium desktop + Pixel 7 | **62 passed, 4 skipped.** The skipped tests are J1 in fr/ar: they need `E2E_CAMPAIGN_SLUG` and a published campaign |
| axe (WCAG 2.2 AA), 14 routes × FR/AR × desktop/mobile | **62/62 pass with seeded data** (emulator, production build, 26 Nov). The empty-data run fixed 4 issues (`8c290a0`); the run with data found and fixed 3 more: pôle and status badges (2.4–3.1:1 contrast), the unnamed donation progress bar, and translucent text on the Impact band |
| Rendering | Pages are now pre-rendered and cached (ISR, 60 s) instead of rendered per request. A cached page answers in about 20–60 ms locally. Admin writes and Stripe payments refresh the affected pages immediately (verified: progress bar 400 → 500 MAD right after a test payment) |
| WebKit / Safari | Not run (browser not installed). Risk #14 is Accept |
| Firestore rules tests | **13/13 pass** on the emulator (JDK 21 installed later on 26 Nov). The first run found that **editors could write `campaigns`** (and so fake `receivedMAD`); fixed in `80050f5`. The suite had never run before: it pointed at the wrong port, and the test config excluded it |
| Stripe card payment (test mode) | **Works end to end** on the emulator (26 Nov): form → Checkout → `4242` test card → thank-you page → `checkout.session.completed` webhook (200) → pledge `received` → campaign total 100/1000 MAD. Unpaid sessions stay `pledged` and are not counted. Opt-in test: `tests/e2e/stripe-card.spec.ts`. Live keys are now refused in code (`611ca99`) |
| Lighthouse CI (mobile) | **Not run.** Run on staging: `npx lighthouse <url> --form-factor=mobile` on `/fr`, `/fr/projects/iqraa`, a campaign page and `/fr/id` |
| Manual passes (Android on 4G, keyboard on the donate flow, screen reader) | Not done. These need a person and a device |
| CI | **There is no `.github/workflows/` in the repo.** Nothing runs on pull requests (T2.12 was never done). Risk #5 requires the Arabic check to run in CI, so this gap matters |
| Prettier `--check` | Flags most files on a Windows checkout because of CRLF line endings only. The repo stores LF |

Open bugs: none known at blocking severity. The two broken external platforms are not site bugs (Section 6).

## 4. Content status

| Project | Text source | AR | EN |
| --- | --- | --- | --- |
| SmartED, GODEM, IQRAA, Golden Wishes, JLM Junior, Greenovators, Recycle It, Get a Plet, Handmade B'lkhir | 2026 annual report (fallback, risk #4). No final text received from any of the 9 leads | French fallback + note | French fallback + note |

- Interface strings: FR complete. AR and EN drafts are complete (236 keys, in sync) but **not reviewed by a native speaker** (risk #8, Accept).
- Pôles, stats, flagship actions, platforms and campaigns: French only.
- Visible `TODO(board)`: only on `/legal/notice` and `/legal/privacy` (legal name, publication director, CNDP). All three are tracked in `docs/OPEN_QUESTIONS.md`.

## 5. Open issues

| Issue | Owner | Target |
| --- | --- | --- |
| Bank details + reference convention (OPEN_QUESTIONS #3, risk #2) | Treasurer / board | Before `donationsEnabled` goes on (Gate 4) |
| Contact email, phone, WhatsApp, socials (#5). The ID card and contact page hide them until they are set | Board | Before the demo if possible |
| Logo files and brand colours (#4) | Board | Phase 4 |
| Legal name, address, publication director (#1) | Board | Gate 4 |
| CNDP / Law 09-08 question (#8, risk #10) | Phase 3 PM → board / legal contact | Gate 4 |
| Photo consent (#7) | Board | Phase 4 |
| Native AR and EN review (#10, risk #8) | Content lead | Phase 4 |
| Project texts from the 9 leads (risk #4) | Content lead | Phase 4 |
| GODEM TLS certificate, Get a Plet 404 (risk #12) | Project leads | Before launch |
| Caravan map locations or image (new, see OPEN_QUESTIONS) | Content lead | Phase 4 |
| CI workflow (lint, typecheck, unit, e2e + axe in FR/AR, Lighthouse) | Dev lead | Start of Phase 4 |
| Admin gaps: uploader, autosave, 403 screen, remaining CRUD | Dev lead | Phase 4 |
| OG images, BreadcrumbList, home "latest news" section | Dev lead | Phase 4 (`docs/BACKLOG.md`) |

## 6. Risk register review (Red risks first)

| # | Strategy | Carried out? |
| --- | --- | --- |
| 1 Capacity | Avoid | Scope held, with one exception: Stripe test-mode checkout, built on explicit request (DECISIONS 2026-11-20) |
| 2 Banking | Mitigate | **No.** The 14 Nov checkpoint was missed and the treasurer was never contacted. Contained by `donationsEnabled: false` |
| 3 Scope creep | Avoid | Yes. New requests go to `docs/BACKLOG.md` (the Stripe exception is recorded) |
| 4 Content delay | Mitigate | Fallback applied. The annual-report text is live and no `TODO` placeholders show on project pages |
| 5 RTL late | Mitigate | **Partly.** An Arabic Playwright + axe sweep exists (`tests/e2e/gate3-routes.spec.ts`) and caught an AR mobile header overflow today. It is not in CI because CI does not exist, and there is no screenshot diff |
| 6 Rules untested | Mitigate | **Yes.** 13/13 pass on the emulator, after fixing a real hole (editors could write campaigns) |
| 7 Reference collision | Avoid | Yes. Check-and-retry generator + unit test |
| 8 AR reviewer | Accept | Fallback note is now visible on content pages. Strings were never sent for review |
| 9 Spam / rate limit | Mitigate | **Not tested** against realistic abuse |
| 10 CNDP | Transfer | **Not transferred.** No legal contact exists. Board must pick it up |
| 11 Traffic / indexing | Accept | `SITE_NOINDEX=true` now exists. **Set it on staging** |
| 12 External links | Mitigate | Re-tested 26 Nov: 7/9 OK. GODEM TLS handshake fails (expired certificate reported 19 Nov), Get a Plet returns 404 |
| 13 Handover | Mitigate | `docs/HANDOVER.md` updated 26 Nov |
| 14 Safari | Accept | Not tested |

## 7. Demo prep (do before 27 Nov, in order)

> **Updated 26 Nov (evening):** the team chose to deploy on **Vercel in no-database mode** (docs/DECISIONS.md). Steps 2–4 below (rules, seed, admin) no longer apply. Instead: set the environment variables listed in `.env.example` (no-database section + Stripe), publish one campaign in `content/seed/campaigns.json` (real title, text, goal and dates), and register a Stripe webhook to `https://<site>/api/webhooks/stripe`. **Demo script changes:** step 4 becomes campaign → card payment → thank-you page → progress bar updated from Stripe (no "mark received" in admin); step 6 (publish from admin) is dropped. Tell the jury this was a deliberate scope decision.


1. Merge the branch, deploy to staging with `.env.example` filled in, including `SITE_NOINDEX=true`, `NEXT_PUBLIC_SITE_URL` and `REVALIDATE_SECRET`.
2. Deploy the fixed `firestore.rules` to the staging Firebase project (the campaign-write fix must be live).
3. `pnpm seed` against staging, then `pnpm make-admin` for the demo account.
4. J1 needs one **published** campaign with a real goal, and donations enabled **on staging only**. The RIB shown comes from Firestore `settings`. Since the real RIB is unconfirmed, the board must either provide it or approve a value clearly labelled as a test. Do not invent one.
5. Demo script changes: in step 2, click **Waraqa** or **Marche Verte**, not GODEM (TLS failure). In step 3, use **IQRAA** or **SmartED**, because GODEM's own platform link is broken.
6. Run Lighthouse (Section 3) on staging and record the scores here.
7. Record the 90-second backup video (plan Section 9).
