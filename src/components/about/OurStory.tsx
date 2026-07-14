"use client";

import { FadeIn } from "./FadeIn";
import { defaultStory } from "./about-defaults";

export default function OurStory({
  heading = defaultStory.heading,
  paragraphs = defaultStory.paragraphs,
}: {
  heading?: string;
  paragraphs?: { text: string }[];
}) {
  if (!paragraphs.length) paragraphs = defaultStory.paragraphs;
  return (
    <FadeIn className="mb-14" id="our-story">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-5">
        {heading}
      </h2>
      <div className="prose prose-lg max-w-none text-[#4A5568] leading-relaxed space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i}>{p.text}</p>
        ))}
      </div>
    </FadeIn>
  );
}
