"use client";

import Link from "next/link";
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
}

const links: QuickLink[] = [
  { icon: PiggyBank, label: "Savings & Current", href: "/personal-banking" },
  { icon: CreditCard, label: "Debit Cards", href: "/cards" },
  { icon: Banknote, label: "Personal Loans", href: "/loan-products#salaried" },
  { icon: Tractor, label: "Agri Loans", href: "/loan-products#agri-business" },
  { icon: Smartphone, label: "Mobile Banking", href: "/digital-banking#coopesa" },
  { icon: Store, label: "Agency Banking", href: "/digital-banking#coopwakala" },
  { icon: Globe, label: "Treasury & Forex", href: "/treasury/foreign-exchange" },
  { icon: Calculator, label: "Loan Calculator", href: "/loan-products#calculator" },
  { icon: MapPin, label: "Branches & ATMs", href: "/branches" },
];

export default function QuickLinks() {
  return (
    <section className="relative bg-white border-b border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <h2 className="text-center text-xl font-bold text-[#1A56A0] pt-6 mb-1">Banking Made Simple</h2>
        <div className="flex items-center justify-center overflow-x-auto no-scrollbar py-6 gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="group flex flex-col items-center gap-2.5 shrink-0 px-4 sm:px-5 py-2 min-w-[100px]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#1A56A0]/10 bg-[#F2F4F8] transition-all duration-300 group-hover:border-[#1A8A3A]/30 group-hover:bg-[#1A8A3A]/10 group-hover:-translate-y-1 group-hover:shadow-md">
                  <Icon className="h-5 w-5 text-[#1A56A0] group-hover:text-[#1A8A3A] transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-semibold text-[#1A56A0]/60 group-hover:text-[#1A8A3A] transition-colors text-center leading-tight">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
