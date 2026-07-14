"use client";

import { MapPin, TrendingUp } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { defaultBranchNetwork } from "./about-defaults";

export default function BranchNetwork({
  heading = defaultBranchNetwork.heading,
  intro = defaultBranchNetwork.intro,
  branches = defaultBranchNetwork.branches,
  comingSoonText = defaultBranchNetwork.comingSoonText,
}: {
  heading?: string;
  intro?: string;
  branches?: { name: string }[];
  comingSoonText?: string;
}) {
  if (!branches.length) branches = defaultBranchNetwork.branches;
  return (
    <FadeIn className="mb-14" id="branch-network">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-3">
        {heading}
      </h2>
      <p className="text-[#4A5568] mb-8">
        {intro}
      </p>
      {/* Active branch location boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {branches.map((branch, i) => (
          <FadeIn key={branch.name} delay={i * 0.08}>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#1A8A3A]/20 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#1A8A3A]/40 transition-all text-center">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#1A8A3A]/10">
                <MapPin size={20} className="text-[#1A8A3A]" />
              </span>
              <span className="text-sm font-bold text-[#1A1A2E]">{branch.name}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#1A8A3A]">Open</span>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Coming soon */}
      <div className="rounded-2xl border border-dashed border-[#1A56A0]/30 bg-[#f4f6f9] px-7 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#1A56A0]/10 flex-shrink-0">
          <TrendingUp size={18} className="text-[#1A56A0]" />
        </span>
        <p className="text-sm text-[#4A5568] leading-relaxed">
          <span className="font-semibold text-[#1A1A2E]">Coming soon — </span>
          {comingSoonText === defaultBranchNetwork.comingSoonText ? (
            <>
              We are launching new branches in <span className="font-semibold text-[#1A56A0]">Kagera</span>, <span className="font-semibold text-[#1A56A0]">Mbeya</span>, <span className="font-semibold text-[#1A56A0]">Mwanza</span>, and <span className="font-semibold text-[#1A56A0]">Dar es Salaam</span> between Q3 2026 and Q2 2027, with more locations planned as part of our continued national growth strategy.
            </>
          ) : (
            comingSoonText
          )}
        </p>
      </div>
    </FadeIn>
  );
}
