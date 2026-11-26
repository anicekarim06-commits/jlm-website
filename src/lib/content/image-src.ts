/**
 * True when an image field holds something renderable: a site path
 * (`/images/...`) or an absolute http(s) URL. Seed and admin data may still
 * hold `TODO(board): …` placeholders, which must never reach an <img>.
 */
export function isImageSrc(value: string | undefined | null): value is string {
  if (!value) return false;
  const v = value.trim();
  return v.startsWith("/") || /^https?:\/\//i.test(v);
}

/** The official JLM logo (from JLM's annual-report site), in /public. */
export const JLM_LOGO_SRC = "/images/brand/jlm-logo.webp";
export const JLM_LOGO_PNG = "/images/brand/jlm-logo.png";
