"use client";

import { FadeIn } from "@/components/about/FadeIn";
import { defaultContactMap } from "./contact-defaults";

// Only Google Maps embeds may render — an editor-saved URL becomes an iframe
// src, so anything else is a phishing/XSS vector and is dropped.
function safeMapUrl(url?: string): string {
  const u = (url || "").trim();
  return /^https:\/\/www\.google\.com\/maps\/embed/.test(u) ? u : "";
}

export default function ContactMap(props: Partial<typeof defaultContactMap> = {}) {
  const c = { ...defaultContactMap, ...props };
  const src = safeMapUrl(c.embedUrl);
  if (!src) return null;
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-6">{c.heading}</h2>
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <iframe
              src={src}
              className="w-full h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="CoopBank head office map"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
