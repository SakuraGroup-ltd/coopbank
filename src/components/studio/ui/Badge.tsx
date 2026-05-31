import { cn } from "./cn";
import type { ComponentProps } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "navy";

const tones: Record<Tone, string> = {
  neutral: "bg-studio-soft text-studio-ink-2 border-studio-border",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  danger: "bg-rose-50 text-rose-700 border-rose-100",
  navy: "bg-cb-navy/8 text-cb-navy border-cb-navy/10",
};

export function Badge({
  tone = "neutral",
  className,
  ...rest
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5",
        "text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
