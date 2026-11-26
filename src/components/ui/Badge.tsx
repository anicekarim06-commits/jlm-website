import { cn } from "@/lib/utils/cn";

type PoleTone = "solidarity" | "environment" | "entrepreneurship";
type StatusTone = "live" | "beta" | "in-development" | "prototype";

// Text is always the body colour on a light tint: coloured text on a tint
// of the same colour measured 2.4–3.1:1, below WCAG AA's 4.5:1 for small
// text (axe, 26 Nov). The colour lives in the tint and a dot instead, and
// the label text carries the meaning, so nothing relies on colour alone.
const poleClasses: Record<PoleTone, { bg: string; dot: string }> = {
  solidarity: { bg: "bg-pole-solidarity/15", dot: "bg-pole-solidarity" },
  environment: { bg: "bg-pole-environment/15", dot: "bg-pole-environment" },
  entrepreneurship: {
    bg: "bg-pole-entrepreneurship/15",
    dot: "bg-pole-entrepreneurship",
  },
};

const statusClasses: Record<StatusTone, { bg: string; dot: string }> = {
  live: { bg: "bg-success/15", dot: "bg-success" },
  beta: { bg: "bg-warning/15", dot: "bg-warning" },
  "in-development": { bg: "bg-muted/15", dot: "bg-muted" },
  prototype: { bg: "bg-primary/15", dot: "bg-primary" },
};

function BadgeShell({
  bg,
  dot,
  children,
}: {
  bg: string;
  dot: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "text-text inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium",
        bg,
      )}
    >
      <span aria-hidden="true" className={cn("size-2 rounded-full", dot)} />
      {children}
    </span>
  );
}

export function PoleBadge({
  tone,
  children,
}: {
  tone: PoleTone;
  children: React.ReactNode;
}) {
  return <BadgeShell {...poleClasses[tone]}>{children}</BadgeShell>;
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: StatusTone;
  children: React.ReactNode;
}) {
  return <BadgeShell {...statusClasses[tone]}>{children}</BadgeShell>;
}
