import type { Metadata } from "next";
import "@/styles/globals.css";
import { hasDatabase } from "@/lib/firebase/mode";

// Its own root layout (master plan Section 3: `app/admin/` is not
// localized). `noindex` is also set in next.config.ts's headers() for
// every /admin/* response, belt-and-suspenders with this metadata.
// Admin pages are per-user and read Firestore directly: never prerender them
// at build time (in no-database mode there is nothing to read).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Administration — JLM ENSAM Casablanca",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr">
      <body className="bg-surface min-h-screen">
        {hasDatabase() ? (
          children
        ) : (
          // No-database mode (src/lib/firebase/mode.ts): content is edited in
          // content/seed/*.json and redeployed, so there is no admin panel.
          <main className="mx-auto max-w-lg px-6 py-24 text-center">
            <h1 className="text-2xl font-semibold">
              Administration indisponible
            </h1>
            <p className="text-muted mt-3">
              Ce site fonctionne sans base de données : le contenu se modifie
              dans le code (content/seed) puis est redéployé. Les dons par carte
              sont consultables dans le tableau de bord Stripe.
            </p>
          </main>
        )}
      </body>
    </html>
  );
}
