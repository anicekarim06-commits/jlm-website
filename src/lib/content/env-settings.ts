/**
 * Public settings for no-database mode, read from environment variables
 * (set in Vercel → Project → Settings → Environment Variables). Contact
 * details and bank details must never be committed (CLAUDE.md), so in this
 * mode they live in the deployment's environment, not in content/seed.
 */
export type PublicSettings = {
  contact: { email: string; phone?: string; whatsapp?: string };
  social: Record<string, string | undefined>;
  /** Absent until BANK_RIB is set: the site then never shows a bank block. */
  bank?: {
    holder: string;
    bankName: string;
    rib: string;
    iban?: string;
    swift?: string;
  };
  donationsEnabled: boolean;
  joinOpen: boolean;
};

type Env = Record<string, string | undefined>;

const value = (env: Env, key: string) => {
  const v = env[key]?.trim();
  return v ? v : undefined;
};

export function settingsFromEnv(env: Env): PublicSettings {
  const rib = value(env, "BANK_RIB");
  return {
    contact: {
      email: value(env, "CONTACT_EMAIL") ?? "",
      phone: value(env, "CONTACT_PHONE"),
      whatsapp: value(env, "CONTACT_WHATSAPP"),
    },
    social: {
      instagram: value(env, "SOCIAL_INSTAGRAM"),
      facebook: value(env, "SOCIAL_FACEBOOK"),
      linkedin: value(env, "SOCIAL_LINKEDIN"),
    },
    bank: rib
      ? {
          holder: value(env, "BANK_HOLDER") ?? "",
          bankName: value(env, "BANK_NAME") ?? "",
          rib,
          iban: value(env, "BANK_IBAN"),
          swift: value(env, "BANK_SWIFT"),
        }
      : undefined,
    donationsEnabled: value(env, "DONATIONS_ENABLED") === "true",
    joinOpen: value(env, "JOIN_OPEN") !== "false",
  };
}
