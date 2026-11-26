"use client";

import { cn } from "@/lib/utils/cn";

const PRESETS = [100, 290, 500, 1000];

export function AmountPicker({
  value,
  onChange,
  customLabel,
}: {
  value: number | null;
  onChange: (amount: number) => void;
  customLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => onChange(preset)}
          className={cn(
            "min-h-11 rounded-md border px-4 font-medium",
            value === preset
              ? "border-primary bg-primary text-primary-contrast"
              : "border-black/10",
          )}
        >
          <bdi dir="ltr">{preset}</bdi> MAD
        </button>
      ))}
      <input
        type="number"
        min={1}
        inputMode="numeric"
        placeholder={customLabel}
        value={value && !PRESETS.includes(value) ? value : ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-h-11 w-32 rounded-md border border-black/10 px-3"
        aria-label={customLabel}
      />
    </div>
  );
}
