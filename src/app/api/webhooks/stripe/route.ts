import "server-only";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient, isCardPaymentsEnabled } from "@/lib/payments/stripe";
import { reconcileCheckoutSession } from "@/lib/payments/reconcile";
import { revalidatePath } from "next/cache";
import { hasDatabase } from "@/lib/firebase/mode";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret || !isCardPaymentsEnabled()) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    if (hasDatabase()) {
      await reconcileCheckoutSession(
        event.data.object as Stripe.Checkout.Session,
      );
    } else {
      // No-database mode: Stripe is the record; just refresh campaign pages
      // so the progress bar (read from Stripe) updates right away.
      revalidatePath("/[locale]/donate", "layout");
    }
  }

  return NextResponse.json({ received: true });
}
