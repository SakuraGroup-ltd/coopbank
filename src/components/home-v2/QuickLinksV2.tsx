"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  PiggyBank,
  CreditCard,
  Banknote,
  Tractor,
  Smartphone,
  Users,
  MapPin,
  BarChart3,
  Globe,
  Calculator,
  Store,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface QuickLink {
  icon: LucideIcon;
  label: string;
  href: string;
  color: string;
}

const links: QuickLink[] = [
  { icon: PiggyBank, label: "Accounts", href: "/personal-banking", color: "#00C853" },
  { icon: CreditCard, label: "Cards", href: "/cards", color: "#7C4DFF" },
  { icon: Banknote, label: "Personal Loans", href: "/loan-products#salaried", color: "#FF6D00" },
  { icon: Tractor, label: "Agri Loans", href: "/loan-products#agri-business", color: "#00C853" },
  { icon: Smartphone, label: "Mobile Banking", href: "/digital-banking#coopesa", color: "#00BCD4" },
  { icon: Users, label: "SACCOS & Groups", href: "/personal-banking#group-accounts", color: "#7C4DFF" },
  { icon: Store, label: "Agency Banking", href: "/digital-banking#coopwakala", color: "#FF6D00" },
  { icon: Globe, label: "Treasury & Forex", href: "/treasury", color: "#00BCD4" },
  { icon: Calculator, label: "Loan Calculator", href: "/loan-products#calculator", color: "#00C853" },
  { icon: MapPin, label: "Branches & ATMs", href: "/branches", color: "#7C4DFF" },
  { icon: BarChart3, label: "Investors", href: "/investors", color: "#00BCD4" },
];

export default function QuickLinksV2() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="relative bg-white border-b border-[#F1F5F9]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="flex items-center justify-center overflow-x-auto no-scrollbar py-5 gap-1">
          {links.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <Link
                  href={link.href}
                  className="group flex flex-col items-center gap-2.5 shrink-0 px-4 sm:px-5 py-3 min-w-[90px] rounded-2xl transition-all hover:bg-[#F8FAFC]"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg"
                    style={{ backgroundColor: `${link.color}0D` }}
                  >
                    <Icon
                      className="h-5 w-5 transition-colors duration-300"
                      style={{ color: link.color }}
                      strokeWidth={1.8}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#64748B] group-hover:text-[#1A1A2E] transition-colors text-center whitespace-nowrap">
                    {link.label}
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
