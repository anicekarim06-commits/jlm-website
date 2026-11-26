import { describe, expect, it } from "vitest";
import {
  isPostVisible,
  relatedPosts,
  visiblePosts,
} from "@/lib/content/post-visibility";
import { buildRss, escapeXml } from "@/lib/content/rss";
import type { Post } from "@/lib/validation/schemas";

const NOW = new Date("2026-11-26T12:00:00Z").getTime();
const day = 24 * 60 * 60 * 1000;

function post(overrides: Partial<Post> & { slug: string }): Post {
  return {
    type: "news",
    title: { fr: overrides.slug },
    excerpt: { fr: "Résumé" },
    body: { fr: "<p>Corps</p>" },
    tags: [],
    publishAt: new Date(NOW - day),
    pinned: false,
    published: true,
    authorUid: "uid",
    ...overrides,
  };
}

describe("isPostVisible (T3.4 scheduling AC)", () => {
  it("shows a published post whose publishAt has passed", () => {
    expect(isPostVisible(post({ slug: "a" }), NOW)).toBe(true);
  });

  it("hides a draft", () => {
    expect(isPostVisible(post({ slug: "a", published: false }), NOW)).toBe(
      false,
    );
  });

  it("hides a scheduled post until its time, then shows it", () => {
    const scheduled = post({ slug: "a", publishAt: new Date(NOW + 60_000) });
    expect(isPostVisible(scheduled, NOW)).toBe(false);
    expect(isPostVisible(scheduled, NOW + 60_000)).toBe(true);
  });

  it("hides an expired ad", () => {
    const ad = post({
      slug: "ad",
      type: "ad",
      expiresAt: new Date(NOW - 1),
    });
    expect(isPostVisible(ad, NOW)).toBe(false);
    expect(isPostVisible(ad, NOW - 2)).toBe(true);
  });
});

describe("visiblePosts ordering", () => {
  it("puts pinned posts first, then newest first", () => {
    const result = visiblePosts(
      [
        post({ slug: "old", publishAt: new Date(NOW - 3 * day) }),
        post({ slug: "new", publishAt: new Date(NOW - day) }),
        post({
          slug: "pinned-old",
          pinned: true,
          publishAt: new Date(NOW - 10 * day),
        }),
        post({ slug: "draft", published: false }),
      ],
      NOW,
    );
    expect(result.map((p) => p.slug)).toEqual(["pinned-old", "new", "old"]);
  });
});

describe("relatedPosts", () => {
  it("prefers the same project, excludes itself, and caps the list", () => {
    const current = post({ slug: "current", projectSlug: "godem" });
    const all = [
      current,
      post({ slug: "other", publishAt: new Date(NOW - 1000) }),
      post({ slug: "same-project", projectSlug: "godem", type: "report" }),
      post({ slug: "x" }),
      post({ slug: "y" }),
    ];
    const result = relatedPosts(current, all, 3);
    expect(result).toHaveLength(3);
    expect(result[0]?.slug).toBe("same-project");
    expect(result.map((p) => p.slug)).not.toContain("current");
  });
});

describe("buildRss", () => {
  it("escapes XML and produces a well-formed RSS 2.0 document", () => {
    const xml = buildRss({
      title: "JLM — Actualités",
      link: "https://example.org/fr/news",
      selfLink: "https://example.org/fr/news/rss.xml",
      description: "Desc",
      language: "fr",
      items: [
        {
          title: 'Caravane <Tizi> & "puits"',
          link: "https://example.org/fr/news/a?x=1&y=2",
          guid: "https://example.org/fr/news/a",
          description: "Résumé",
          pubDate: new Date("2026-11-20T10:00:00Z"),
          category: "news",
        },
      ],
    });

    const doc = new DOMParser().parseFromString(xml, "application/xml");
    expect(doc.getElementsByTagName("parsererror")).toHaveLength(0);
    expect(doc.documentElement.getAttribute("version")).toBe("2.0");
    const item = doc.getElementsByTagName("item")[0];
    expect(item?.getElementsByTagName("title")[0]?.textContent).toBe(
      'Caravane <Tizi> & "puits"',
    );
    expect(item?.getElementsByTagName("pubDate")[0]?.textContent).toBe(
      "Fri, 20 Nov 2026 10:00:00 GMT",
    );
  });

  it("escapes all five XML special characters", () => {
    expect(escapeXml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&apos;&amp;&apos;&lt;/a&gt;",
    );
  });
});
