"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Heart, Smartphone, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Reason {
  icon: LucideIcon;
  title: string;
  description: string;
}

const reasons: Reason[] = [
  {
    icon: Shield,
    title: "Security & Trust",
    description:
      "Your deposits are protected by the Deposit Insurance Board of Tanzania, ensuring peace of mind with every shilling.",
  },
  {
    icon: Heart,
    title: "Community Focus",
    description:
      "As a cooperative bank, our profits go back into serving communities and fostering sustainable development.",
  },
  {
    icon: Smartphone,
    title: "Digital Innovation",
    description:
      "From CoopPesa mobile banking to CoopNet internet banking, we bring modern financial tools to your fingertips.",
  },
  {
    icon: MapPin,
    title: "Wide Coverage",
    description:
      "With branches, agents, and digital channels across Tanzania, banking is always within reach.",
  },
];

export default function WhyChoose() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-navy-dark py-[var(--section-padding)]">
      <div className="mx-auto max-w-[var(--container-max)] px-6 sm:px-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Why Choose Cooperative Bank Tanzania Plc.?
          </h2>
          <p className="mt-4 text-white/50">
            Built on trust, driven by community, powered by innovation
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="text-center"
              >
                <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green/15">
                  <Icon className="h-7 w-7 text-green-accent" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
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
