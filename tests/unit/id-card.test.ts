import { describe, expect, it } from "vitest";
import { buildVCard, contactLinks, isConfigured } from "@/lib/id-card/contact";
import { pickCardStats } from "@/lib/id-card/card-stats";
import type { StatItem } from "@/lib/validation/schemas";

describe("isConfigured", () => {
  it("rejects empty values and TODO(board) placeholders", () => {
    expect(isConfigured(undefined)).toBe(false);
    expect(isConfigured("  ")).toBe(false);
    expect(isConfigured("TODO(board): contact email")).toBe(false);
    expect(isConfigured("todo(board)")).toBe(false);
    expect(isConfigured("contact@example.org")).toBe(true);
  });
});

describe("contactLinks", () => {
  it("skips placeholders and builds dialable / web links", () => {
    const links = contactLinks({
      email: "TODO(board): contact email",
      phone: "+212 6 00 00 00 00",
      whatsapp: "+212 6 11-11-11-11",
      instagram: "@jlm.example",
      linkedin: "https://www.linkedin.com/company/example",
    });
    expect(links.map((l) => l.kind)).toEqual([
      "call",
      "whatsapp",
      "instagram",
      "linkedin",
    ]);
    expect(links[0]?.href).toBe("tel:+212600000000");
    expect(links[1]?.href).toBe("https://wa.me/212611111111");
    expect(links[2]?.href).toBe("https://www.instagram.com/jlm.example");
    expect(links[3]?.href).toBe("https://www.linkedin.com/company/example");
  });
});

describe("buildVCard", () => {
  it("writes a vCard 3.0 with CRLF line endings and only configured fields", () => {
    const vcard = buildVCard({
      name: "JLM ENSAM Casablanca",
      url: "https://example.org",
      note: "Ce qu'on transmet reste; depuis 2014, merci",
      contact: { email: "contact@example.org", phone: "TODO(board): phone" },
    });
    const lines = vcard.split("\r\n");
    expect(lines[0]).toBe("BEGIN:VCARD");
    expect(lines[1]).toBe("VERSION:3.0");
    expect(lines).toContain("FN:JLM ENSAM Casablanca");
    expect(lines).toContain("EMAIL;TYPE=INTERNET,WORK:contact@example.org");
    expect(vcard).not.toContain("TODO");
    expect(vcard).not.toContain("TEL");
    // Semicolons and commas in text values are escaped.
    expect(lines).toContain(
      "NOTE:Ce qu'on transmet reste\\; depuis 2014\\, merci",
    );
    expect(lines.at(-2)).toBe("END:VCARD");
    expect(vcard.endsWith("\r\n")).toBe(true);
  });

  it("folds lines longer than 75 octets", () => {
    const vcard = buildVCard({
      name: "JLM",
      url: "https://example.org",
      note: "é".repeat(80),
      contact: {},
    });
    for (const line of vcard.split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
    // Unfolding restores the original value.
    expect(vcard.replace(/\r\n /g, "")).toContain(`NOTE:${"é".repeat(80)}`);
  });
});

describe("pickCardStats", () => {
  const stat = (key: string): StatItem => ({
    key,
    label: { fr: key },
    value: 1,
    source: "Rapport annuel JLM 2026",
    asOf: "2026",
  });

  it("picks beneficiaries, km and members in that order", () => {
    const result = pickCardStats([
      stat("caravans"),
      stat("active-members"),
      stat("beneficiaries"),
      stat("km-traveled"),
    ]);
    expect(result.map((s) => s.key)).toEqual([
      "beneficiaries",
      "km-traveled",
      "active-members",
    ]);
  });

  it("falls back to the first three stats", () => {
    const result = pickCardStats([stat("a"), stat("b"), stat("c"), stat("d")]);
    expect(result.map((s) => s.key)).toEqual(["a", "b", "c"]);
  });
});
