import "server-only";
import { getTranslations } from "next-intl/server";
import type { PlatformLinkLabels } from "@/components/sections/PlatformLink";

/** Server-side labels for <PlatformLink> (keeps the formatter off the client). */
export async function getPlatformLinkLabels(): Promise<PlatformLinkLabels> {
  const t = await getTranslations("platforms");
  return {
    open: t("openPlatform"),
    status: {
      live: t("statusLive"),
      beta: t("statusBeta"),
      "in-development": t("statusInDevelopment"),
      prototype: t("statusPrototype"),
    },
  };
}
