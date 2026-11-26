export function ProgressBar({
  receivedMAD,
  goalMAD,
  label,
}: {
  receivedMAD: number;
  goalMAD: number;
  /** Accessible name, e.g. "Progression de la collecte" (WCAG 4.1.2). */
  label: string;
}) {
  const percent =
    goalMAD > 0 ? Math.min(100, Math.round((receivedMAD / goalMAD) * 100)) : 0;

  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        aria-valuetext={`${receivedMAD} / ${goalMAD} MAD (${percent}%)`}
        className="h-3 w-full overflow-hidden rounded-full bg-black/10"
      >
        {/* `inline-size` + logical `inset-inline-start` (not left/width) so the
            filled portion grows from the correct edge in RTL (master plan 7.4). */}
        <div
          className="bg-primary h-full rounded-full transition-[inline-size] duration-300"
          style={{ inlineSize: `${percent}%` }}
        />
      </div>
      <p className="text-muted mt-2 text-sm">
        <bdi dir="ltr">{new Intl.NumberFormat().format(receivedMAD)}</bdi> /{" "}
        <bdi dir="ltr">{new Intl.NumberFormat().format(goalMAD)}</bdi> MAD (
        {percent}%)
      </p>
    </div>
  );
}
