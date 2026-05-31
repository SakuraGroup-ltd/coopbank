import { cn } from "./cn";
import type { ComponentProps, ForwardedRef } from "react";
import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  { className, ...rest }: ComponentProps<"input">,
  ref: ForwardedRef<HTMLInputElement>,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full px-3 rounded-lg border border-studio-border bg-studio-panel",
        "text-sm text-studio-ink placeholder:text-studio-ink-3",
        "focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none",
        "disabled:opacity-50 disabled:bg-studio-soft",
        "transition-colors duration-150",
        className,
      )}
      {...rest}
    />
  );
});
