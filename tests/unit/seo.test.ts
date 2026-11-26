import { describe, expect, it } from "vitest";
import {
  jsonLd,
  languageAlternates,
  localizedPath,
  pageMetadata,
} from "@/lib/seo/metadata";
import fr from "@/messages/fr.json";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

describe("localizedPath", () => {
  it("prefixes the locale and maps the home page to /{locale}", () => {
    expect(localizedPath("ar", "/projects/godem")).toBe("/ar/projects/godem");
    expect(localizedPath("fr", "/")).toBe("/fr");
  });
});

describe("languageAlternates", () => {
  it("lists every locale plus x-default (French)", () => {
    const alternates = languageAlternates("/about");
    expect(Object.keys(alternates).sort()).toEqual(
      ["ar", "en", "fr", "x-default"].sort(),
    );
    expect(alternates["x-default"]).toBe(alternates.fr);
    expect(alternates.ar).toMatch(/\/ar\/about$/);
  });
});

describe("pageMetadata", () => {
  it("sets canonical, hreflang, Open Graph and Twitter", () => {
    const meta = pageMetadata({
      locale: "ar",
      path: "/news",
      title: "الأخبار",
      description: "وصف",
      rss: true,
    });
    expect(meta.alternates?.canonical).toMatch(/\/ar\/news$/);
    expect(meta.alternates?.types?.["application/rss+xml"]).toMatch(
      /\/ar\/news\/rss\.xml$/,
    );
    expect(meta.openGraph).toMatchObject({ locale: "ar_MA", title: "الأخبار" });
    expect(meta.robots).toBeUndefined();
  });

  it("marks utility pages noindex", () => {
    const meta = pageMetadata({
      locale: "fr",
      path: "/id/print",
      title: "t",
      description: "d",
      noindex: true,
    });
    expect(meta.robots).toMatchObject({ index: false });
  });
});

describe("jsonLd", () => {
  it("cannot close the surrounding script tag", () => {
    const out = jsonLd({ headline: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).headline).toBe("</script><script>alert(1)</script>");
  });
});

describe("seo messages (T3.9: unique title and description per page)", () => {
  for (const [locale, messages] of Object.entries({ fr, ar, en })) {
    it(`has unique titles and descriptions in ${locale}`, () => {
      const seo = messages.seo as Record<string, string>;
      const titles = Object.entries(seo)
        .filter(([k]) => k.endsWith("Title"))
        .map(([, v]) => v);
      const descriptions = Object.entries(seo)
        .filter(([k]) => k.endsWith("Description"))
        .map(([, v]) => v);
      expect(titles.length).toBeGreaterThan(0);
      expect(new Set(titles).size).toBe(titles.length);
      expect(new Set(descriptions).size).toBe(descriptions.length);
      for (const d of descriptions) expect(d.length).toBeGreaterThan(30);
    });
  }
});
