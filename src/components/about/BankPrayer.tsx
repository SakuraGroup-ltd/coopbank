"use client";

import { FadeIn } from "./FadeIn";
import { defaultPrayer } from "./about-defaults";

export default function BankPrayer({
  heading = defaultPrayer.heading,
  paragraphs = defaultPrayer.paragraphs,
  amen = defaultPrayer.amen,
}: {
  heading?: string;
  paragraphs?: { text: string }[];
  amen?: string;
}) {
  if (!paragraphs.length) paragraphs = defaultPrayer.paragraphs;
  return (
    <FadeIn className="mb-14" id="bank-prayer">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-5">{heading}</h2>
      <div
        className="rounded-2xl border border-[#1A56A0]/20 bg-[#f4f6f9] px-8 py-10 text-center space-y-5"
        style={{ fontVariant: "small-caps" }}
      >
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[#2D3748] leading-relaxed font-medium">
            {p.text.split("\n").map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        ))}
        <p className="text-2xl font-extrabold text-[#1A56A0] tracking-widest mt-4">{amen}</p>
      </div>
    </FadeIn>
  );
}
