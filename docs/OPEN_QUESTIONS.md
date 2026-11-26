# Open questions for the JLM board / team

Carried over from `JLM_WEBSITE_EXECUTION_PLAN.md` Section 14, plus the Phase 3 checkpoints that an AI build session cannot itself resolve (no channel to the treasurer, no native Arabic reviewer, no legal contact). **None of the items below have been answered by a real person — do not treat anything in the codebase as a stand-in for a real answer.**

## From the master plan (Section 14), unanswered

1. Legal name of the association, registered address, publication director, and who signs off content after launch?
2. Public-fundraising authorization and an association bank account in its name — what text and number must be shown?
   - If the board wants real (not test-mode) online card payments eventually: Stripe does not pay out to Moroccan bank accounts, so this needs a CMI merchant contract with a Moroccan bank, or a PayPal Business account — neither is a free/instant signup, both need board decisions and paperwork.
3. **Bank details to display (holder, bank, RIB, IBAN) and the confirmation email address for pledges.** Blocking for `settings/bank` in Firestore and for T3.5's real-world correctness (risk #2, hard checkpoint 14 Nov in the day-by-day plan — **not met**, no treasurer contact happened). `donationsEnabled` is seeded `false` until this is answered.
4. Brand: official logo files, colors, fonts, year(s) of the national champion title. `src/styles/tokens.css` uses a placeholder neutral palette, marked `TODO(board): brand colors`.
   - **Partly answered 2026-11-26:** the JLM logo and the 9 project logos were taken from JLM's annual-report site and are now used on the site. Still open: master/vector logo files, brand colours (the site still uses a placeholder palette, and the logo uses green `#BFD66A`, red `#F4475A`, yellow `#F5B945`), fonts, champion title year.
5. Official social accounts and contact channels (WhatsApp number, email, phone).
6. Domain name and registrant.
7. Consent process for photos of children, patients, entrepreneurs — signed forms already exist?
8. Has the association declared its data processing to the CNDP (Law 09-08), or does it need to? (Risk #10, Transfer strategy — hand to JLM's legal contact; not done, no such contact exists in this session.)
9. Are the 2026 annual report figures final and approved for public use?
10. Who reviews Arabic and English translations, and who answers contact/sponsorship messages? (Risk #8 — AR strings have **not** been sent to a native reviewer; they ship with the French-fallback note per the Accept strategy.)
11. Should the old annual-report site (`jlmensamcportfolio.netlify.app`) redirect to the new one?

## Phase 3 checkpoints that need a human, not code

- **14 Nov hard checkpoint (risk #2):** RIB/IBAN and reference-code convention were never confirmed with a treasurer. The pledge schema and reference generator are built currency- and field-agnostic specifically so this is a config change, not a rebuild, once answered (see `docs/DECISIONS.md`).
- **20 Nov content deadline (risk #4):** no project lead has sent updated text/figures/consent. All 9 projects currently use the 2026 annual-report seed content from the master plan's Section 15.1 verbatim — this is the documented fallback, not a placeholder, but it should be reviewed by the project leads before Gate 3.
- **24 Nov Arabic review (risk #8):** not sent, not reviewed. Interface and content Arabic strings render with the French-fallback + "Traduction en cours" note where AR text is missing.
- **23 Nov legal/CNDP question (risk #10):** not transferred to anyone, because this session has no legal contact to transfer it to. The board must pick this up directly.

## Platform link check (risk #12), run 2026-11-19

Automated check of the 9 external platform/shop URLs in `content/seed/platforms.json` (the 3 prototypes have no public URL):

- **`https://godem.ensamien.com/` (GODEM) — SSL certificate has EXPIRED.** Browsers will show a security warning or block the page outright. GODEM is the platform behind journey J4 and one of the highest-traffic links — this needs the project lead/board to renew the certificate before Gate 3, not just a retest.
- **`https://web-production-2bc58.up.railway.app/` (Get a Plet digital shelter) — returns 404 Not Found.** The Railway deployment appears to be down or removed. Seeded as `status: "in-development"` already, but it should not be linked publicly if it 404s; re-check with the Get a Plet project lead.
- The other 7 URLs (Marche Verte, Discover Morocco quiz, heritage site, Waraqa, Golden Wishes tree, Recycle It, the Abdelhaq flowers shop) all returned HTTP 200.

Re-run before the 20 and 24 Nov checkpoints per the day-by-day plan.

**Re-run 2026-11-26 (risk #12, due today):** unchanged. 7/9 return HTTP 200. GODEM fails the TLS handshake (consistent with the expired certificate above), and Get a Plet still returns 404. For the Gate 3 demo, click Waraqa or Marche Verte rather than GODEM, and use IQRAA or SmartED as the example project page (see `docs/GATE3_PACK.md` Section 7).

## Added 2026-11-26

- **Caravan map (Impact page, master plan Section 7.7).** Not built: no static map image or list of caravan locations has been supplied, and the seed content only names Al Haouz and douar Tizi. Who can provide the locations, or an approved map image?
- **Arabic and English interface strings added for News, ID card, Impact and SEO metadata** are drafts written during the build and need the same native review as the rest (#10, risk #8).
- **All seed content (149 localized fields: projects, pôles, stats, platforms, flagship actions, campaigns) is French only.** AR and EN pages show it with the "Traduction en cours" note. Translating it is content work for the content lead and reviewers, not development.
- **Campaign goals.** All 4 seeded campaigns are unpublished with `goalMAD: 1` as a placeholder (the master plan says the board sets the amounts). The J1 demo needs at least one published campaign with a real goal on staging.

## TODO(board) markers in the codebase

Grep for `TODO(board)` to find every in-code placeholder; each one should also have a matching line above or be added here if new.
