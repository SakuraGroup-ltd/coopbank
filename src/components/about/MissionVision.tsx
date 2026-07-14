"use client";

import { Target, Eye, TrendingUp } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { defaultMissionVision } from "./about-defaults";

export default function MissionVision({
  heading = defaultMissionVision.heading,
  missionTitle = defaultMissionVision.missionTitle,
  missionText = defaultMissionVision.missionText,
  visionTitle = defaultMissionVision.visionTitle,
  visionText = defaultMissionVision.visionText,
  purposeLabel = defaultMissionVision.purposeLabel,
  purposeText = defaultMissionVision.purposeText,
}: {
  heading?: string;
  missionTitle?: string;
  missionText?: string;
  visionTitle?: string;
  visionText?: string;
  purposeLabel?: string;
  purposeText?: string;
}) {
  return (
    <FadeIn className="mb-14" id="mission-vision">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-8">
        {heading}
      </h2>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Mission */}
        <div className="rounded-2xl border border-gray-100 bg-[#f4f6f9] p-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A56A0]/10 mb-5">
            <Target size={24} className="text-[#1A56A0]" />
          </span>
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-3">
            {missionTitle}
          </h3>
          <p className="text-[#4A5568] leading-relaxed">
            {missionText}
          </p>
        </div>

        {/* Vision */}
        <div className="rounded-2xl border border-gray-100 bg-[#f4f6f9] p-8">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A8A3A]/10 mb-5">
            <Eye size={24} className="text-[#1A8A3A]" />
          </span>
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-3">
            {visionTitle}
          </h3>
          <p className="text-[#4A5568] leading-relaxed">
            {visionText}
          </p>
        </div>
      </div>

      {/* Bank Purpose banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1A56A0] to-[#1A8A3A] p-6 flex items-center gap-5">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 flex-shrink-0">
          <TrendingUp size={22} className="text-white" />
        </span>
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">{purposeLabel}</p>
          <p className="text-white font-semibold text-base leading-relaxed">{purposeText}</p>
        </div>
      </div>
    </FadeIn>
  );
}
