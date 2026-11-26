import "server-only";
import { getPublicSettings } from "@/lib/content/settings";
import type { CardContact } from "@/lib/id-card/contact";

/** Contact channels for the ID card and vCard, from `settingsPublic/site`. */
export async function getCardContact(): Promise<CardContact> {
  const settings = await getPublicSettings();
  if (!settings) return {};
  return {
    email: settings.contact.email,
    phone: settings.contact.phone,
    whatsapp: settings.contact.whatsapp,
    instagram: settings.social.instagram,
    facebook: settings.social.facebook,
    linkedin: settings.social.linkedin,
  };
}
