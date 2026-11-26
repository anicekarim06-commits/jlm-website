import "server-only";
import type Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase/admin";
import { recomputeCampaignTotal } from "@/lib/pledges/recompute-campaign-total";

/**
 * Marks the pledge behind a paid Checkout Session as received and refreshes
 * the campaign total. Safe to call more than once for the same session: it
 * only acts on a pledge that is still "pledged" (a duplicate webhook delivery
 * or a manual replay is a no-op). Returns whether a pledge was updated.
 */
export async function reconcileCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  if (session.payment_status !== "paid") return false;
  const pledgeId = session.metadata?.pledgeId;
  if (!pledgeId) return false;

  const pledgeRef = getAdminDb().collection("pledges").doc(pledgeId);
  const pledgeDoc = await pledgeRef.get();
  if (!pledgeDoc.exists || pledgeDoc.data()?.status !== "pledged") {
    return false;
  }

  await pledgeRef.update({
    status: "received",
    receivedAt: new Date(),
    stripePaymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id,
    updatedAt: new Date(),
  });
  await recomputeCampaignTotal(pledgeDoc.data()!.campaignSlug);
  // Campaign pages are cached (ISR): refresh them so the progress bar
  // reflects the payment immediately.
  revalidatePath("/[locale]/donate", "layout");
  return true;
}
