import { cn } from "./cn";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-cb-green hover:bg-cb-green-deep text-white border-cb-green hover:border-cb-green-deep",
  secondary:
    "bg-studio-panel hover:bg-studio-soft text-studio-ink border-studio-border",
  ghost:
    "bg-transparent hover:bg-studio-soft text-studio-ink-2 hover:text-studio-ink border-transparent",
  dark:
    "bg-studio-ink hover:bg-cb-navy-deep text-white border-studio-ink hover:border-cb-navy-deep",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...rest
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-lg border font-medium",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-cb-navy/20 focus:ring-offset-2 focus:ring-offset-studio-bg",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  );
}
