"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

// Presentational grid for the Board / Management pages. Data comes from the
// server (leadership-team collection, with a hardcoded fallback), so this stays
// a pure client component just for the scroll animations.

export type Person = { name: string; title: string; image?: string };

function initials(name: string): string {
  const parts = name.replace(/^(Dr|Prof|Mr|Mrs|Ms|Adv|CPA|Lt|Col|Eng)\.?\s+/gi, "").trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProfileCard({
  person,
  index,
  featured,
}: {
  person: Person;
  index: number;
  featured: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
      className={`group relative rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
        featured ? "border-2 border-[#1A8A3A]/20 ring-2 ring-[#1A8A3A]/10" : "border border-gray-200"
      }`}
    >
      <div className="relative w-full aspect-square bg-gradient-to-b from-[#1A56A0]/5 to-[#1A56A0]/10 overflow-hidden">
        {person.image ? (
          <Image
            src={person.image}
            alt={person.name}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-[#1A56A0]/40">
            {initials(person.name)}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="px-3 py-3 text-center">
        <h3 className="text-sm font-bold text-[#1A1A2E] leading-tight mb-0.5">{person.name}</h3>
        <p className={`text-xs font-semibold ${featured ? "text-[#1A8A3A]" : "text-[#1A56A0]/70"}`}>
          {person.title}
        </p>
      </div>

      {featured && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#1A8A3A] to-[#1A56A0]" />
      )}
    </motion.div>
  );
}

export function LeadershipGrid({
  intro,
  people,
  highlightCount = 0,
}: {
  intro: string;
  people: Person[];
  highlightCount?: number;
}) {
  return (
    <>
      <FadeIn className="mb-10">
        <p className="text-[#4A5568] leading-relaxed text-lg max-w-2xl">{intro}</p>
      </FadeIn>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {people.map((person, i) => (
          <ProfileCard key={`${person.name}-${i}`} person={person} index={i} featured={i < highlightCount} />
        ))}
      </div>
    </>
  );
}
