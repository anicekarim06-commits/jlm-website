import Image from "next/image";
import { JLM_LOGO_SRC } from "@/lib/content/image-src";

/**
 * The official JLM logo (round badge). Decorative: the organisation name is
 * always rendered as real text next to it.
 */
export function IdCardMark({ size = "md" }: { size?: "md" | "lg" }) {
  const px = size === "lg" ? 96 : 64;
  return (
    <Image
      src={JLM_LOGO_SRC}
      alt=""
      width={px}
      height={px}
      sizes={`${px}px`}
      className="shrink-0"
      priority
    />
  );
}
