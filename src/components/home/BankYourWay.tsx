"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Smartphone,
  Monitor,
  MapPin,
  CreditCard,
  Users,
  Landmark,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Channel {
  icon: LucideIcon;
  label: string;
  href: string;
}

const channels: Channel[] = [
  { icon: Smartphone, label: "CoopPesa Mobile", href: "/digital-banking#coopesa" },
  { icon: Monitor, label: "CoopNet Internet", href: "/digital-banking#coopnet" },
  { icon: Landmark, label: "Branch Banking", href: "/branches" },
  { icon: CreditCard, label: "ATM & Cards", href: "/branches#atm" },
  { icon: Users, label: "Agency Banking", href: "/digital-banking#coopwakala" },
  { icon: MapPin, label: "USSD *150*74#", href: "/digital-banking#ussd" },
];

export default function BankYourWay() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-xl text-center"
        >
          <h2 className="text-3xl font-bold text-[#1A56A0] sm:text-4xl">
            Banking Made Simple
          </h2>
          <p className="mt-3 text-[15px] text-[#4A5568]">
            Access your accounts anytime, anywhere through our channels
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-6 sm:grid-cols-6 max-w-4xl mx-auto">
          {channels.map((channel, i) => {
            const Icon = channel.icon;
            return (
              <motion.div
                key={channel.label}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  href={channel.href}
                  className="group flex flex-col items-center gap-3 py-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A56A0]/5 border border-[#1A56A0]/10 transition-all duration-300 group-hover:bg-[#1A8A3A]/10 group-hover:border-[#1A8A3A]/30 group-hover:-translate-y-1 group-hover:shadow-lg">
                    <Icon
                      className="h-7 w-7 text-[#1A56A0] group-hover:text-[#1A8A3A] transition-colors duration-300"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-[#1A56A0]/70 group-hover:text-[#1A8A3A] transition-colors text-center leading-tight">
                    {channel.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
