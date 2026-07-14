"use client";

import { FadeIn } from "./FadeIn";
import { iconOf } from "@/components/blocks/icon-map";
import { defaultCoreValues } from "./about-defaults";

export default function CoreValues({
  heading = defaultCoreValues.heading,
  values = defaultCoreValues.values,
}: {
  heading?: string;
  values?: { icon: string; title: string; description: string }[];
}) {
  if (!values.length) values = defaultCoreValues.values;
  return (
    <FadeIn id="core-values">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-8">
        {heading}
      </h2>
      <div className="grid sm:grid-cols-3 gap-5">
        {values.map((value, i) => {
          const Icon = iconOf(value.icon);
          return (
            <FadeIn key={value.title} delay={i * 0.08}>
              <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-[#f4f6f9] p-6 h-full">
                <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#1A8A3A]/10 flex items-center justify-center mt-0.5">
                  <Icon size={20} className="text-[#1A8A3A]" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#1A1A2E] mb-1">
                    {value.title}
                  </h3>
                  <p className="text-sm text-[#4A5568] leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </FadeIn>
  );
}
