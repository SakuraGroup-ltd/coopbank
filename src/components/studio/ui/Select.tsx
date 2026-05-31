import { cn } from "./cn";
import type { ComponentProps } from "react";

export function Select({
  className,
  children,
  ...rest
}: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-9 w-full pl-3 pr-8 rounded-lg border border-studio-border bg-studio-panel",
          "text-sm text-studio-ink appearance-none",
          "focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none",
          "disabled:opacity-50 disabled:bg-studio-soft",
          "transition-colors duration-150 cursor-pointer",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-studio-ink-3"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
