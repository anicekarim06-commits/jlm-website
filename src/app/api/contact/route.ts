import "server-only";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { contactFormSchema } from "@/lib/validation/schemas";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { isRateLimited, clientIpFrom } from "@/lib/security/rate-limit";
import { isEmailConfigured, sendEmail } from "@/lib/email/send";
import { hasDatabase } from "@/lib/firebase/mode";

export async function POST(request: Request) {
  const ip = clientIpFrom(request.headers);
  if (isRateLimited(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = contactFormSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  if (input.website) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const verified = await verifyTurnstile(input.turnstileToken, ip);
  if (!verified) {
    return NextResponse.json({ error: "Verification failed" }, { status: 403 });
  }

  // No-database mode: nothing is stored, so the message must be emailed.
  if (
    !hasDatabase() &&
    !(isEmailConfigured() && process.env.BOARD_NOTIFICATION_EMAIL)
  ) {
    return NextResponse.json({ error: "Form unavailable" }, { status: 503 });
  }
  if (hasDatabase()) {
    await getAdminDb().collection("contactMessages").add({
      name: input.name,
      email: input.email,
      topic: input.topic,
      message: input.message,
      locale: input.locale,
      createdAt: new Date(),
    });
  }

  const boardEmail = process.env.BOARD_NOTIFICATION_EMAIL;
  if (boardEmail) {
    await sendEmail({
      to: boardEmail,
      subject: `[Contact — ${input.topic}] ${input.name}`,
      html: `<p>${input.email}</p><p>${input.message}</p>`,
    });
  }

  return NextResponse.json({ ok: true });
}
