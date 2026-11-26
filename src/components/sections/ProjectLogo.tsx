import Image from "next/image";
import { isImageSrc } from "@/lib/content/image-src";
import { cn } from "@/lib/utils/cn";

/**
 * A project's logo on a white tile. Decorative (`alt=""`): the project
 * name is always rendered as text next to it. Renders nothing when the
 * project has no usable logo yet.
 */
export function ProjectLogo({
  src,
  size = 56,
  className,
}: {
  src: string | undefined;
  size?: number;
  className?: string;
}) {
  if (!isImageSrc(src)) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-1.5",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
