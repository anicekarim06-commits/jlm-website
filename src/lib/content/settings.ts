import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { settingsSchema, type Settings } from "@/lib/validation/schemas";
import { hasDatabase } from "@/lib/firebase/mode";
import {
  settingsFromEnv,
  type PublicSettings,
} from "@/lib/content/env-settings";

export type { PublicSettings } from "@/lib/content/env-settings";

export async function getPublicSettings(): Promise<PublicSettings | null> {
  // No-database mode: contact and bank details come from the environment.
  if (!hasDatabase()) return settingsFromEnv(process.env);
  try {
    const snapshot = await getAdminDb()
      .collection("settingsPublic")
      .doc("site")
      .get();
    if (!snapshot.exists) return null;
    return snapshot.data() as PublicSettings;
  } catch (error) {
    console.error("[content] Failed to read settingsPublic/site:", error);
    return null;
  }
}

/**
 * The full private settings document, including bank/RIB and fundraising
 * authorization — admin-only (master plan Section 5.1), never exposed to
 * public pages. Use `getPublicSettings` for anything rendered on the site.
 */
export async function getAdminSettings(): Promise<Settings | null> {
  const snapshot = await getAdminDb().collection("settings").doc("site").get();
  if (!snapshot.exists) return null;
  const parsed = settingsSchema.safeParse(snapshot.data());
  return parsed.success ? parsed.data : null;
}
