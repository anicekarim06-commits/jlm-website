import "server-only";
import nodemailer from "nodemailer";

/** True when real SMTP delivery is configured (otherwise emails are only logged). */
export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD,
  );
}

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !pass) {
    console.warn(
      "[email] SMTP is not configured — emails will be logged, not sent.",
    );
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const from =
    process.env.BOARD_NOTIFICATION_EMAIL ?? "no-reply@jlm-ensamc.local";
  try {
    const info = await getTransporter().sendMail({ from, ...options });
    if ("message" in info) {
      console.log(
        "[email] (no SMTP configured) would have sent:",
        options.subject,
        "->",
        options.to,
      );
    }
  } catch (error) {
    // Never let an email failure break a form submission that already
    // succeeded in Firestore (master plan Section 8.7).
    console.error("[email] Failed to send:", error);
  }
}
