import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stripeKeyStatus } from "@/lib/payments/stripe-key";

// `server-only` throws outside Next's server bundle; stub it for tests.
vi.mock("server-only", () => ({}));

// Fake keys only: these are format fixtures, not credentials.
const FAKE_TEST_KEY = "sk_test_FAKE0000000000000000";
const FAKE_RESTRICTED_TEST_KEY = "rk_test_FAKE0000000000000000";
const FAKE_LIVE_KEY = "sk_live_FAKE0000000000000000";

describe("stripeKeyStatus", () => {
  it("accepts secret and restricted test-mode keys", () => {
    expect(stripeKeyStatus(FAKE_TEST_KEY)).toBe("test");
    expect(stripeKeyStatus(FAKE_RESTRICTED_TEST_KEY)).toBe("test");
    expect(stripeKeyStatus(`  ${FAKE_TEST_KEY}\n`)).toBe("test");
  });

  it("rejects live keys and anything that is not a test secret key", () => {
    expect(stripeKeyStatus(FAKE_LIVE_KEY)).toBe("rejected");
    expect(stripeKeyStatus("rk_live_FAKE000")).toBe("rejected");
    expect(stripeKeyStatus("pk_test_FAKE000")).toBe("rejected"); // publishable key
    expect(stripeKeyStatus("sk_test_")).toBe("rejected");
    expect(stripeKeyStatus("TODO(board)")).toBe("rejected");
  });

  it("reports a missing key", () => {
    expect(stripeKeyStatus(undefined)).toBe("missing");
    expect(stripeKeyStatus("   ")).toBe("missing");
  });
});

describe("Stripe client gate", () => {
  const original = process.env.STRIPE_SECRET_KEY;

  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    // Assigning undefined would store the string "undefined".
    if (original === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = original;
    vi.restoreAllMocks();
  });

  async function load(key: string | undefined) {
    if (key === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = key;
    return import("@/lib/payments/stripe");
  }

  it("enables card payments with a test key", async () => {
    const stripe = await load(FAKE_TEST_KEY);
    expect(stripe.isCardPaymentsEnabled()).toBe(true);
    expect(() => stripe.getStripeClient()).not.toThrow();
  });

  it("disables card payments and refuses a client with a live key", async () => {
    const stripe = await load(FAKE_LIVE_KEY);
    expect(stripe.isCardPaymentsEnabled()).toBe(false);
    expect(() => stripe.getStripeClient()).toThrow(/not a Stripe test key/);
    // The warning must never include the key itself.
    const logged = vi.mocked(console.error).mock.calls.flat().join(" ");
    expect(logged).not.toContain(FAKE_LIVE_KEY);
  });

  it("stays off with no key", async () => {
    const stripe = await load(undefined);
    expect(stripe.isCardPaymentsEnabled()).toBe(false);
    expect(() => stripe.getStripeClient()).toThrow(/not configured/);
  });
});
