"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";

// Bottom-right slide-in announcement card. Client-only concerns: remembering a
// dismissal (localStorage, keyed to the announcement so a future one re-shows),
// the entrance animation, and reduced-motion. Content and the date window are
// decided server-side; this component only shows what it's handed.

const STORAGE_KEY = "coopbank-announcement-dismissed";

type Props = {
  dismissKey: string;
  imageUrl: string;
  imageAlt: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
};

export default function AnnouncementCardClient({
  dismissKey,
  imageUrl,
  imageAlt,
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: Props) {
  // Start hidden; reveal only after we've confirmed it isn't dismissed, so the
  // card never flashes for someone who already closed it.
  const [state, setState] = useState<"hidden" | "entering" | "shown" | "leaving">("hidden");

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === dismissKey;
    } catch {
      dismissed = false; // privacy mode: treat as not dismissed
    }
    if (dismissed) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion → appear immediately, no slide. Otherwise slide in after a
    // beat. Both paths defer setState out of the effect body via the timer.
    const t = setTimeout(
      () => {
        if (prefersReduced) {
          setState("shown");
          return;
        }
        setState("entering");
        requestAnimationFrame(() => setState("shown"));
      },
      prefersReduced ? 0 : 1200,
    );
    return () => clearTimeout(t);
  }, [dismissKey]);

  if (state === "hidden") return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, dismissKey);
    } catch {
      /* privacy mode: dismissal just won't persist */
    }
    setState("leaving");
    setTimeout(() => setState("hidden"), 300);
  }

  const offscreen = state === "entering" || state === "leaving";

  return (
    <div
      role="region"
      aria-label={title}
      className={`fixed bottom-6 right-6 z-40 w-[calc(100vw-2rem)] max-w-[360px] transform-gpu transition-all duration-300 ease-out ${
        offscreen ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl shadow-black/20">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[#0F3D7A] backdrop-blur transition-colors hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-3 p-3">
          <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#f3f3fe]">
            <Image src={imageUrl} alt={imageAlt} fill sizes="80px" className="object-cover" />
          </div>

          <div className="min-w-0 flex-1 pr-5">
            {eyebrow && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1A56A0]">
                {eyebrow}
              </p>
            )}
            <p className="mt-0.5 text-sm font-bold leading-snug text-[#0F3D7A]">{title}</p>
            {subtitle && <p className="mt-1 text-xs leading-snug text-[#555]">{subtitle}</p>}
          </div>
        </div>

        <div className="px-3 pb-3">
          <Link
            href={ctaHref}
            className="flex w-full items-center justify-center rounded-lg bg-[#1A56A0] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0F3D7A]"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
