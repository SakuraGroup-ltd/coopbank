"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeInSection } from "./TreasuryFadeIn";

const ALL_SERVICES = [
  {
    slug: "foreign-exchange",
    href: "/treasury/foreign-exchange",
    title: "Foreign Exchange",
    desc: "Spot, Forwards, Swaps and Daily Rates",
  },
  {
    slug: "fixed-deposits",
    href: "/treasury/fixed-deposits",
    title: "Fixed Deposits",
    desc: "Competitive rates on flexible tenors",
  },
  {
    slug: "government-securities",
    href: "/treasury/government-securities",
    title: "Government Securities",
    desc: "T-Bills and T-Bonds via Bank of Tanzania",
  },
];

export function OtherTreasuryServices({
  current,
}: {
  current: "foreign-exchange" | "fixed-deposits" | "government-securities";
}) {
  const others = ALL_SERVICES.filter((s) => s.slug !== current);

  return (
    <section className="bg-white py-12 sm:py-14">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 lg:gap-12 items-center">
          <FadeInSection>
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A8A3A] mb-2">
              Other Treasury Services
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A56A0] leading-tight">
              Continue exploring
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {others.map((s, i) => (
              <FadeInSection key={s.slug} delay={i * 0.05}>
                <Link
                  href={s.href}
                  className="group flex items-center justify-between gap-4 bg-white hover:bg-[#f4f6f9] border border-gray-200 hover:border-[#1A8A3A]/40 rounded-xl px-5 py-4 transition-colors"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#1A56A0] transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-[11px] text-[#4A5568] mt-0.5 transition-colors">
                      {s.desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-[#1A8A3A] shrink-0 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
