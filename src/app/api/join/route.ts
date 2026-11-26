import "server-only";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { joinFormSchema } from "@/lib/validation/schemas";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { isRateLimited, clientIpFrom } from "@/lib/security/rate-limit";
import { isEmailConfigured, sendEmail } from "@/lib/email/send";
import { hasDatabase } from "@/lib/firebase/mode";
import { getPublicSettings } from "@/lib/content/settings";

export async function POST(request: Request) {
  const ip = clientIpFrom(request.headers);
  if (isRateLimited(`join:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = joinFormSchema.safeParse(json);
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

  const settings = await getPublicSettings();
  if (settings?.joinOpen === false) {
    return NextResponse.json(
      { error: "Applications are closed" },
      { status: 403 },
    );
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
    await getAdminDb().collection("joinRequests").add({
      name: input.name,
      school: input.school,
      year: input.year,
      poleInterest: input.poleInterest,
      motivation: input.motivation,
      phone: input.phone,
      email: input.email,
      locale: input.locale,
      createdAt: new Date(),
    });
  }

  const boardEmail = process.env.BOARD_NOTIFICATION_EMAIL;
  if (boardEmail) {
    await sendEmail({
      to: boardEmail,
      subject: `[Candidature] ${input.name} — ${input.poleInterest}`,
      html: `<p>${input.school}, ${input.year}</p><p>${input.motivation}</p>`,
    });
  }

  return NextResponse.json({ ok: true });
}
