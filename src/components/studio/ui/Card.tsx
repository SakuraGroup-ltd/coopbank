import { cn } from "./cn";
import type { ComponentProps } from "react";

export function Card({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-studio-border bg-studio-panel",
        "shadow-[0_1px_2px_rgba(15,15,15,0.04)]",
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cn("px-6 pt-6 pb-4", className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "text-base font-semibold text-studio-ink tracking-tight",
        className,
      )}
      {...rest}
    />
  );
}

export function CardDescription({ className, ...rest }: ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-studio-ink-3 mt-1", className)} {...rest} />
  );
}

export function CardContent({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cn("px-6 pb-6", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-studio-border flex items-center",
        className,
      )}
      {...rest}
    />
  );
}
