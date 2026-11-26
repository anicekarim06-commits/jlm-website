import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { hasDatabase } from "@/lib/firebase/mode";
import { seedCollection, seedDoc } from "@/lib/content/seed-source";

/**
 * Reads a Firestore collection for use in Server Components. Revalidation
 * is handled by `/api/revalidate` calling `revalidatePath`/`revalidateTag`
 * (master plan Section 8.3), not by wrapping these in `unstable_cache` —
 * that combination triggered a React/Turbopack "Expected a suspended
 * thenable" crash together with next-intl's RSC hooks in this Next.js 16
 * version; see docs/DECISIONS.md.
 */
export function cachedCollection<T>(
  collection: string,
  parse: (data: Record<string, unknown>, id: string) => T | null,
) {
  return async () => {
    // No-database mode: read the bundled seed files (src/lib/firebase/mode.ts).
    if (!hasDatabase()) {
      const results: T[] = [];
      for (const doc of seedCollection(collection)) {
        const parsed = parse(doc.data, doc.id);
        if (parsed) results.push(parsed);
      }
      return results;
    }
    try {
      const snapshot = await getAdminDb().collection(collection).get();
      const results: T[] = [];
      for (const doc of snapshot.docs) {
        const parsed = parse(doc.data(), doc.id);
        if (parsed) results.push(parsed);
      }
      return results;
    } catch (error) {
      console.error(
        `[content] Failed to read collection "${collection}":`,
        error,
      );
      return [] as T[];
    }
  };
}

export function cachedDoc<T>(
  collection: string,
  id: string,
  parse: (data: Record<string, unknown>, id: string) => T | null,
) {
  return async () => {
    if (!hasDatabase()) {
      const data = seedDoc(collection, id);
      return data ? parse(data, id) : null;
    }
    try {
      const snapshot = await getAdminDb().collection(collection).doc(id).get();
      if (!snapshot.exists) return null;
      return parse(snapshot.data() as Record<string, unknown>, snapshot.id);
    } catch (error) {
      console.error(
        `[content] Failed to read doc "${collection}/${id}":`,
        error,
      );
      return null;
    }
  };
}
