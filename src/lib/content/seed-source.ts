import poles from "../../../content/seed/poles.json";
import projects from "../../../content/seed/projects.json";
import platforms from "../../../content/seed/platforms.json";
import stats from "../../../content/seed/stats.json";
import flagshipActions from "../../../content/seed/flagship-actions.json";
import campaigns from "../../../content/seed/campaigns.json";
import posts from "../../../content/seed/posts.json";
import partners from "../../../content/seed/partners.json";

/**
 * Content for no-database mode (src/lib/firebase/mode.ts): the same seed
 * files `pnpm seed` loads into Firestore, bundled at build time. To change
 * content in this mode, edit content/seed/*.json and redeploy.
 *
 * Each entry: the documents and the field used as the Firestore doc id.
 */
type SeedDoc = Record<string, unknown>;

const collections: Record<string, { docs: SeedDoc[]; idKey: string }> = {
  poles: { docs: poles, idKey: "slug" },
  projects: { docs: projects, idKey: "slug" },
  platforms: { docs: platforms, idKey: "id" },
  stats: { docs: stats, idKey: "key" },
  flagshipActions: { docs: flagshipActions, idKey: "slug" },
  campaigns: { docs: campaigns, idKey: "slug" },
  posts: { docs: posts as SeedDoc[], idKey: "slug" },
  partners: { docs: partners as SeedDoc[], idKey: "id" },
};

export function seedCollection(name: string): { id: string; data: SeedDoc }[] {
  const entry = collections[name];
  if (!entry) return [];
  return entry.docs.map((data) => ({ id: String(data[entry.idKey]), data }));
}

export function seedDoc(name: string, id: string): SeedDoc | null {
  return seedCollection(name).find((doc) => doc.id === id)?.data ?? null;
}
