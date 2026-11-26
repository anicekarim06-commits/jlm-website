import { describe, expect, it } from "vitest";
import { boundaryLabels } from "@/lib/i18n/boundary-labels";
import fr from "@/messages/fr.json";
import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

// boundary-labels.ts mirrors a few strings so loading/not-found can stay
// formatter-free; this keeps the copies identical to src/messages.
describe("boundary labels match src/messages", () => {
  for (const [locale, messages] of Object.entries({ fr, ar, en })) {
    it(locale, () => {
      const labels = boundaryLabels[locale as keyof typeof boundaryLabels];
      expect(labels.loading).toBe(messages.common.loading);
      expect(labels.notFound).toEqual({
        title: messages.notFound.title,
        body: messages.notFound.body,
        backHome: messages.notFound.backHome,
        seeProjects: messages.notFound.seeProjects,
      });
    });
  }
});
