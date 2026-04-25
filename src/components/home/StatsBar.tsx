"use client";

import { motion } from "framer-motion";

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: "30+", label: "Years of Service" },
  { value: "8+", label: "Branches" },
  { value: "50K+", label: "Digital Users" },
  { value: "100+", label: "Agents" },
];

interface StatsBarProps {
  variant?: "hero" | "standalone";
}

export default function StatsBar({ variant = "hero" }: StatsBarProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={
        isHero
          ? "absolute bottom-0 left-0 right-0 z-10"
          : "w-full"
      }
    >
      <div
        className={
          isHero
            ? "glass border-t border-white/10"
            : "bg-navy rounded-2xl"
        }
      >
        <div className="mx-auto max-w-[var(--container-max)] px-6 py-6 sm:px-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium tracking-wide text-white/60 uppercase">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
