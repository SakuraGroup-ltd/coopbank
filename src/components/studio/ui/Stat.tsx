import { cn } from "./cn";
import type { ReactNode } from "react";

// A single KPI tile — large number, small label, optional trend chip.
// Used by the dashboard's top row. Kept presentational so the dashboard
// page can compose with real data without state.
export function Stat({
  label,
  value,
  hint,
  trend,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: { label: string; tone?: "up" | "down" | "flat" };
  icon?: ReactNode;
  className?: string;
}) {
  const trendColor =
    trend?.tone === "up"
      ? "text-emerald-600"
      : trend?.tone === "down"
        ? "text-rose-600"
        : "text-studio-ink-3";

  return (
    <div
      className={cn(
        "rounded-2xl border border-studio-border bg-studio-panel p-5",
        "shadow-[0_1px_2px_rgba(15,15,15,0.04)] flex flex-col gap-3",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-studio-ink-3">
          {label}
        </p>
        {icon && <span className="text-studio-ink-3">{icon}</span>}
      </div>
      <p className="text-3xl font-semibold tracking-tight text-studio-ink">{value}</p>
      <div className="flex items-baseline justify-between gap-2 min-h-[18px]">
        {hint && <span className="text-xs text-studio-ink-3">{hint}</span>}
        {trend && (
          <span className={cn("text-xs font-medium", trendColor)}>{trend.label}</span>
        )}
      </div>
    </div>
  );
}
