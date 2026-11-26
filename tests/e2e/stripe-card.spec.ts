import { test, expect, type Frame } from "@playwright/test";

/**
 * Card pledge through Stripe Checkout, TEST MODE ONLY (docs/DECISIONS.md).
 *
 * Opt-in: needs the app running with a Stripe test key, `stripe listen`
 * forwarding to /api/webhooks/stripe, and a published campaign with
 * donations enabled (e.g. the Firebase emulator). Set
 * E2E_STRIPE_CAMPAIGN_SLUG to that campaign; otherwise this is skipped.
 *
 * It only covers the browser side (form -> Checkout -> thank-you page).
 * Whether the webhook marked the pledge "received" is checked against
 * Firestore separately, since pledges are not readable by any client.
 */
const campaignSlug = process.env.E2E_STRIPE_CAMPAIGN_SLUG;

test.describe("Card pledge via Stripe Checkout (test mode)", () => {
  test.skip(!campaignSlug, "Set E2E_STRIPE_CAMPAIGN_SLUG to run");
  test.setTimeout(120_000);

  test("pays with the 4242 test card and lands on the thank-you page", async ({
    page,
  }) => {
    await page.goto(`/fr/donate/${campaignSlug}`);

    await page
      .getByRole("button", { name: /100|290|500|1000/ })
      .first()
      .click();
    await page.getByRole("radio", { name: /carte/i }).check();
    await page.getByLabel(/email/i).fill("donor-test@example.com");
    await page.getByRole("checkbox", { name: /confidentialité/i }).check();
    await page.getByRole("button", { name: /confirmer|payer/i }).click();

    // Stripe-hosted Checkout (test mode).
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 });
    await expect(
      page.getByText(/test mode|mode test|sandbox/i).first(),
    ).toBeVisible({ timeout: 30_000 });
    // Current Checkout renders the payment form inside an iframe; find the
    // frame that holds the card fields and fill them by accessible name.
    let form: Frame | undefined;
    await expect
      .poll(
        async () => {
          for (const frame of page.frames()) {
            const count = await frame
              .getByRole("textbox", { name: "Card number" })
              .count()
              .catch(() => 0);
            if (count > 0) {
              form = frame;
              return true;
            }
          }
          return false;
        },
        { timeout: 30_000 },
      )
      .toBe(true);
    const f = form!;
    await f
      .getByRole("textbox", { name: "Card number" })
      .fill("4242424242424242");
    await f.getByRole("textbox", { name: /Expiration/ }).fill("12/34");
    await f.getByRole("textbox", { name: "Security code" }).fill("123");
    await f.getByRole("textbox", { name: "Name on card" }).fill("Test Donor");
    const postal = f.getByRole("textbox", { name: /ZIP|Postal/i });
    if (await postal.isVisible().catch(() => false)) await postal.fill("20000");
    // "Pay securely with Link" also starts with "Pay"; use the submit button.
    await f.getByTestId("payment-form-submit-button").click();

    await page.waitForURL(/\/donate\/thanks\?.*method=card/, {
      timeout: 60_000,
    });
    await expect(page.getByText(/JLM-\d{4}-[A-Z0-9]{4}/)).toBeVisible();
  });
});
