"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeInSection } from "./TreasuryFadeIn";

const ALL_SERVICES = [
  {
    slug: "foreign-exchange",
    href: "/treasury/foreign-exchange",
    title: "Foreign Exchange",
    desc: "Spot FX, Forwards, FX Swaps and Daily Rates.",
  },
  {
    slug: "fixed-deposits",
    href: "/treasury/fixed-deposits",
    title: "Fixed Deposits",
    desc: "Competitive interest rates on flexible-tenor deposits.",
  },
  {
    slug: "government-securities",
    href: "/treasury/government-securities",
    title: "Government Securities",
    desc: "Treasury Bills and Treasury Bonds via the Bank of Tanzania.",
  },
];

export function OtherTreasuryServices({
  current,
}: {
  current: "foreign-exchange" | "fixed-deposits" | "government-securities";
}) {
  const others = ALL_SERVICES.filter((s) => s.slug !== current);

  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <FadeInSection className="text-center mb-12">
          <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#1A8A3A] mb-3">
            Other Treasury Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] leading-tight">
            Explore our full Treasury offering
          </h2>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {others.map((s, i) => (
            <FadeInSection key={s.slug} delay={i * 0.1}>
              <Link
                href={s.href}
                className="group block bg-[#f4f6f9] hover:bg-[#1A56A0] border border-transparent hover:border-[#1A56A0] rounded-2xl p-7 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-[#1A56A0] group-hover:text-white mb-3 transition-colors">
                  {s.title}
                </h3>
                <p className="text-[#4A5568] group-hover:text-white/80 text-sm leading-relaxed mb-5 transition-colors">
                  {s.desc}
                </p>
                <span className="inline-flex items-center gap-2 text-[#1A8A3A] group-hover:text-white text-sm font-semibold group-hover:gap-3 transition-all">
                  View page
                  <ArrowRight size={16} />
                </span>
              </Link>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
