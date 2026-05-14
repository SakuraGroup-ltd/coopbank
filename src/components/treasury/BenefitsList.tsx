"use client";

import { Check } from "lucide-react";
import { FadeInSection } from "./TreasuryFadeIn";

export function BenefitsList({
  title = "Benefits",
  items,
}: {
  title?: string;
  items: string[];
}) {
  return (
    <FadeInSection>
      <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#1A8A3A] mb-5">
        {title}
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1A8A3A]/10 flex items-center justify-center mt-0.5">
              <Check size={12} className="text-[#1A8A3A]" />
            </span>
            <span className="text-[#4A5568] text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </FadeInSection>
  );
}
