/* eslint-disable @next/next/no-img-element */
import { cn } from "./cn";

export function Avatar({
  name,
  src,
  size = 32,
  className,
}: {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full overflow-hidden",
        "bg-cb-navy text-white font-semibold border border-studio-border",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {src ? (
        <img src={src} alt={name || ""} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}
