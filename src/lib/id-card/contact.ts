/**
 * Pure helpers for the digital ID card (master plan Section 8.2, J5).
 * No Firestore or `server-only` import so they can be unit tested.
 */

/**
 * Seeded settings carry `TODO(board): …` placeholders until the board
 * answers docs/OPEN_QUESTIONS.md #5. Those must never be rendered, dialled
 * or written into a vCard, so every contact value goes through this.
 */
export function isConfigured(
  value: string | undefined | null,
): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !/TODO\(/i.test(trimmed);
}

export type CardContact = {
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
};

export type ContactLink = {
  kind: "call" | "whatsapp" | "email" | "instagram" | "facebook" | "linkedin";
  href: string;
  /** Human-readable value, shown LTR (numbers, addresses, handles). */
  display: string;
};

function digitsOnly(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

function socialUrl(value: string, base: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `${base}${value.replace(/^@/, "")}`;
}

/** Only configured channels, in the order J5 lists them. */
export function contactLinks(contact: CardContact): ContactLink[] {
  const links: ContactLink[] = [];
  if (isConfigured(contact.phone)) {
    links.push({
      kind: "call",
      href: `tel:${contact.phone.replace(/[^\d+]/g, "")}`,
      display: contact.phone,
    });
  }
  if (isConfigured(contact.whatsapp)) {
    links.push({
      kind: "whatsapp",
      href: `https://wa.me/${digitsOnly(contact.whatsapp)}`,
      display: contact.whatsapp,
    });
  }
  if (isConfigured(contact.email)) {
    links.push({
      kind: "email",
      href: `mailto:${contact.email}`,
      display: contact.email,
    });
  }
  if (isConfigured(contact.instagram)) {
    links.push({
      kind: "instagram",
      href: socialUrl(contact.instagram, "https://www.instagram.com/"),
      display: contact.instagram,
    });
  }
  if (isConfigured(contact.facebook)) {
    links.push({
      kind: "facebook",
      href: socialUrl(contact.facebook, "https://www.facebook.com/"),
      display: contact.facebook,
    });
  }
  if (isConfigured(contact.linkedin)) {
    links.push({
      kind: "linkedin",
      href: socialUrl(contact.linkedin, "https://www.linkedin.com/company/"),
      display: contact.linkedin,
    });
  }
  return links;
}

/** RFC 6350 text escaping (backslash, comma, semicolon, newline). */
function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** Folds lines longer than 75 octets, as vCard requires. */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (encoder.encode(current + char).length > limit) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join("\r\n ");
}

/**
 * vCard 3.0 (best import support across iOS/Android contacts apps) built
 * from `settings` — only configured fields are written.
 */
export function buildVCard({
  name,
  url,
  note,
  contact,
  logoUrl,
}: {
  name: string;
  url: string;
  note?: string;
  contact: CardContact;
  logoUrl?: string;
}): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(name)}`,
    `N:;;;;`,
    `ORG:${escapeVCard(name)}`,
    `URL:${url}`,
  ];
  if (isConfigured(contact.email)) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${escapeVCard(contact.email)}`);
  }
  if (isConfigured(contact.phone)) {
    lines.push(`TEL;TYPE=WORK,VOICE:${escapeVCard(contact.phone)}`);
  }
  if (isConfigured(contact.whatsapp) && contact.whatsapp !== contact.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(contact.whatsapp)}`);
  }
  for (const link of contactLinks(contact)) {
    if (["instagram", "facebook", "linkedin"].includes(link.kind)) {
      lines.push(`X-SOCIALPROFILE;TYPE=${link.kind}:${link.href}`);
    }
  }
  if (logoUrl) lines.push(`PHOTO;VALUE=URI:${logoUrl}`);
  if (note) lines.push(`NOTE:${escapeVCard(note)}`);
  lines.push("END:VCARD");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
