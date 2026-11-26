import { afterEach, describe, expect, it } from "vitest";
import { settingsFromEnv } from "@/lib/content/env-settings";
import { sumPaidByCampaign } from "@/lib/payments/stripe-totals";
import { seedCollection, seedDoc } from "@/lib/content/seed-source";
import { hasDatabase } from "@/lib/firebase/mode";
import { projectSchema } from "@/lib/validation/schemas";

describe("settingsFromEnv", () => {
  it("builds public settings from environment variables", () => {
    const s = settingsFromEnv({
      CONTACT_EMAIL: "contact@example.org",
      CONTACT_WHATSAPP: " +212600000000 ",
      BANK_RIB: "000 TEST",
      BANK_HOLDER: "JLM",
      BANK_NAME: "Banque Test",
      DONATIONS_ENABLED: "true",
    });
    expect(s.contact).toEqual({
      email: "contact@example.org",
      phone: undefined,
      whatsapp: "+212600000000",
    });
    expect(s.bank).toEqual({
      holder: "JLM",
      bankName: "Banque Test",
      rib: "000 TEST",
      iban: undefined,
      swift: undefined,
    });
    expect(s.donationsEnabled).toBe(true);
    expect(s.joinOpen).toBe(true);
  });

  it("has no bank block without BANK_RIB and keeps donations off by default", () => {
    const s = settingsFromEnv({ BANK_HOLDER: "JLM", JOIN_OPEN: "false" });
    expect(s.bank).toBeUndefined();
    expect(s.donationsEnabled).toBe(false);
    expect(s.joinOpen).toBe(false);
    expect(s.contact.email).toBe("");
  });
});

describe("sumPaidByCampaign", () => {
  const session = (
    slug: string | null,
    amount: number,
    status = "paid",
    currency = "mad",
  ) => ({
    payment_status: status,
    amount_total: amount,
    currency,
    metadata: slug ? { campaignSlug: slug } : null,
  });

  it("sums paid sessions per campaign in major units", () => {
    const totals = sumPaidByCampaign(
      [
        session("ramadan", 10000),
        session("ramadan", 25050),
        session("well", 5000),
        session("well", 5000, "unpaid"),
        session(null, 9900),
        session("ramadan", 100, "paid", "eur"),
      ],
      "MAD",
    );
    expect(totals).toEqual({ ramadan: 350.5, well: 50 });
  });
});

describe("seed source", () => {
  it("exposes the seed files as collections with their ids", () => {
    const projects = seedCollection("projects");
    expect(projects).toHaveLength(9);
    expect(projects.map((p) => p.id)).toContain("iqraa");
    for (const p of projects) {
      expect(projectSchema.safeParse(p.data).success).toBe(true);
    }
    expect(seedDoc("platforms", "waraqa")).not.toBeNull();
    expect(seedCollection("posts")).toEqual([]);
    expect(seedCollection("unknown")).toEqual([]);
  });
});

describe("hasDatabase", () => {
  const saved = { ...process.env };
  afterEach(() => {
    for (const k of [
      "FIRESTORE_EMULATOR_HOST",
      "FIREBASE_ADMIN_PROJECT_ID",
      "FIREBASE_ADMIN_CLIENT_EMAIL",
      "FIREBASE_ADMIN_PRIVATE_KEY",
    ]) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("is false without credentials and true with an emulator or a service account", () => {
    delete process.env.FIRESTORE_EMULATOR_HOST;
    delete process.env.FIREBASE_ADMIN_PROJECT_ID;
    delete process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    delete process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    expect(hasDatabase()).toBe(false);
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8081";
    expect(hasDatabase()).toBe(true);
    delete process.env.FIRESTORE_EMULATOR_HOST;
    process.env.FIREBASE_ADMIN_PROJECT_ID = "p";
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL = "e";
    expect(hasDatabase()).toBe(false);
    process.env.FIREBASE_ADMIN_PRIVATE_KEY = "k";
    expect(hasDatabase()).toBe(true);
  });
});
