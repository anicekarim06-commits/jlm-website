import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Gate 3 route sweep (JLM_PHASE3_DEMO_EXECUTION_PLAN.md Section 7): every
 * public route renders in FR (LTR) and AR (RTL) with the right document
 * direction, a single H1, no visible TODO(board) placeholder, and no
 * serious or critical axe violations.
 *
 * Works with or without seeded Firestore data: with no data the pages
 * render their empty states, which must be accessible too.
 */
const ROUTES = [
  "",
  "/about",
  "/projects",
  "/platforms",
  "/impact",
  "/news",
  "/donate",
  "/join",
  "/partners",
  "/contact",
  "/id",
  "/id/print",
  "/legal/privacy",
  "/legal/notice",
];

// Tracked in docs/OPEN_QUESTIONS.md (legal name, publication director,
// CNDP declaration) — the only pages allowed to show TODO(board).
const TODO_ALLOWED = new Set(["/legal/privacy", "/legal/notice"]);

for (const locale of ["fr", "ar"] as const) {
  test.describe(`${locale.toUpperCase()} routes`, () => {
    for (const route of ROUTES) {
      test(`/${locale}${route}`, async ({ page }) => {
        const response = await page.goto(`/${locale}${route}`);
        expect(response?.status()).toBe(200);

        const html = page.locator("html");
        await expect(html).toHaveAttribute("lang", locale);
        await expect(html).toHaveAttribute(
          "dir",
          locale === "ar" ? "rtl" : "ltr",
        );
        await expect(page.locator("h1")).toHaveCount(1);

        if (!TODO_ALLOWED.has(route)) {
          await expect(page.locator("body")).not.toContainText("TODO(");
        }

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        const blocking = results.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical",
        );
        expect(
          blocking.map((v) => `${v.id}: ${v.nodes.length} node(s)`),
        ).toEqual([]);
      });
    }
  });
}

test("RSS feed is served per locale", async ({ request }) => {
  for (const locale of ["fr", "ar", "en"]) {
    const response = await request.get(`/${locale}/news/rss.xml`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("rss+xml");
    expect(await response.text()).toContain(`<language>${locale}</language>`);
  }
});

test("vCard downloads and never contains placeholders", async ({ request }) => {
  const response = await request.get("/api/vcard");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/vcard");
  const body = await response.text();
  expect(body).toMatch(/^BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
  expect(body).not.toContain("TODO");
});

test("robots.txt keeps admin and API out of search", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).toMatch(/Disallow: \/(admin)?/);
});
