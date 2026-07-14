"use client";

import { FadeIn } from "./FadeIn";
import { defaultJourney, type Milestone } from "./about-defaults";

export default function JourneyTimeline({
  heading = defaultJourney.heading,
  intro = defaultJourney.intro,
  milestones = defaultJourney.milestones,
}: {
  heading?: string;
  intro?: string;
  milestones?: Milestone[];
}) {
  if (!milestones.length) milestones = defaultJourney.milestones;
  return (
    <FadeIn className="mb-14" id="our-journey">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-3">
        {heading}
      </h2>
      <p className="text-[#4A5568] mb-10">
        {intro}
      </p>

      {/* SVG curved path timeline */}
      <div className="relative">
        {/* Curved connector — visible on lg only */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
          preserveAspectRatio="none"
          viewBox="0 0 900 300"
          fill="none"
        >
          <path
            d="M60 250 C180 250, 180 50, 300 50 C420 50, 420 250, 540 250 C660 250, 660 50, 780 50"
            stroke="url(#timeline-grad)"
            strokeWidth="2.5"
            strokeDasharray="8 4"
            fill="none"
          />
          <defs>
            <linearGradient id="timeline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1A8A3A" />
              <stop offset="50%" stopColor="#1A56A0" />
              <stop offset="100%" stopColor="#1A8A3A" />
            </linearGradient>
          </defs>
        </svg>

        {/* Cards in alternating up/down positions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {milestones.map((item, i) => {
            const position = i % 2 === 0 ? "bottom" : "top";
            const color = item.color || (i % 2 === 0 ? "#1A8A3A" : "#1A56A0");
            return (
              <FadeIn key={item.year} delay={i * 0.15}>
                <div className={`flex flex-col items-center ${position === "top" ? "lg:pt-0 lg:pb-24" : "lg:pt-24 lg:pb-0"}`}>
                  {/* Year circle */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg mb-4"
                    style={{ backgroundColor: color, boxShadow: `0 0 0 6px ${color}18, 0 4px 15px ${color}30` }}
                  >
                    {item.year}
                  </div>

                  {/* Card */}
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow text-center w-full">
                    <h3 className="text-sm font-bold text-[#1A1A2E] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#4A5568] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}
