"use client";

import { useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { Shield, Heart, Smartphone, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";

function AnimatedCounter({ target, suffix = "", isInView }: { target: number; suffix?: string; isInView: boolean }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, { duration: 2, ease: "easeOut" });
      return controls.stop;
    }
  }, [isInView, count, target]);

  return <motion.span>{rounded}</motion.span>;
}

interface Reason {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  stat: { value: number; suffix: string; label: string };
}

const reasons: Reason[] = [
  {
    icon: Shield,
    title: "Security & Trust",
    description: "Your deposits are protected by the Deposit Insurance Board of Tanzania.",
    color: "#00C853",
    stat: { value: 99, suffix: "%", label: "Uptime" },
  },
  {
    icon: Heart,
    title: "Community Focus",
    description: "As a cooperative bank, our profits serve communities and sustainable development.",
    color: "#FF6D00",
    stat: { value: 8, suffix: "+", label: "Regions" },
  },
  {
    icon: Smartphone,
    title: "Digital Innovation",
    description: "CoopPesa mobile banking and CoopNet internet banking at your fingertips.",
    color: "#7C4DFF",
    stat: { value: 24, suffix: "/7", label: "Access" },
  },
  {
    icon: MapPin,
    title: "Wide Coverage",
    description: "Branches, agents, and digital channels across Tanzania within reach.",
    color: "#00BCD4",
    stat: { value: 100, suffix: "+", label: "Agents" },
  },
];

export default function WhyChooseV2() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-[#1A1A2E] py-24 lg:py-28 overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#00C853]/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-[#7C4DFF]/[0.04] blur-[80px] pointer-events-none" />

      <div className="mx-auto max-w-[1440px] px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-[36px] font-extrabold text-white sm:text-[42px]">
            Why Cooperative Bank?
          </h2>
          <p className="mt-4 text-[16px] text-white/40 max-w-lg mx-auto">
            Built on trust, driven by community, powered by innovation
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-2xl border border-white/5 bg-white/[0.03] p-7 transition-all hover:bg-white/[0.06] hover:border-white/10"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl mb-5"
                  style={{ backgroundColor: `${reason.color}15` }}
                >
                  <Icon className="h-6 w-6" style={{ color: reason.color }} />
                </div>

                {/* Animated stat */}
                <div className="mb-4">
                  <p className="text-[28px] font-extrabold text-white">
                    <AnimatedCounter target={reason.stat.value} suffix={reason.stat.suffix} isInView={isInView} />
                  </p>
                  <p className="text-[11px] font-semibold text-white/25 uppercase tracking-wider">{reason.stat.label}</p>
                </div>

                <h3 className="text-[16px] font-bold text-white mb-2">
                  {reason.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-white/35">
                  {reason.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
