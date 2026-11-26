/**
 * "No-database mode" (docs/DECISIONS.md, 2026-11-26): when no Firebase
 * project is configured, the site runs as a front end plus Stripe only.
 * Content comes from content/seed/*.json, contact details and bank details
 * from environment variables, card donations straight from Stripe, and the
 * admin panel is unavailable. Configuring Firebase switches everything back
 * to the database without code changes.
 */
export function hasDatabase(): boolean {
  if (process.env.FIRESTORE_EMULATOR_HOST) return true;
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  );
}
