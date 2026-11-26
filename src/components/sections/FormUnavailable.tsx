import { getTranslations } from "next-intl/server";
import { getPublicSettings } from "@/lib/content/settings";
import { isConfigured } from "@/lib/id-card/contact";

/** Replaces a form when it has nowhere to deliver messages. */
export async function FormUnavailable() {
  const t = await getTranslations("common");
  const settings = await getPublicSettings();
  const email = settings?.contact.email;
  return (
    <p className="bg-surface rounded-2xl p-5">
      {t("formUnavailable")}{" "}
      {isConfigured(email) && (
        <a
          href={`mailto:${email}`}
          className="text-primary font-medium underline"
        >
          <bdi dir="ltr">{email}</bdi>
        </a>
      )}
    </p>
  );
}
