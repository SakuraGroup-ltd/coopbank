"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Smartphone, Banknote, CreditCard, ArrowRight,
  QrCode, Globe, ShoppingCart, Zap,
  Tractor, Car, Store, Briefcase, Users, PiggyBank,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ServiceItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
}

interface Tab {
  id: string;
  label: string;
  items: ServiceItem[];
}

const tabs: Tab[] = [
  {
    id: "cards",
    label: "Cards & Payments",
    items: [
      { icon: CreditCard, title: "Visa Debit Card", desc: "Linked to your CoopBank account", href: "/cards#visa-debit" },
      { icon: CreditCard, title: "Visa Prepaid Card", desc: "Load & spend anywhere", href: "/cards#visa-prepaid" },
      { icon: QrCode, title: "TAN-QR Pay", desc: "Lipa Namba all networks", href: "/cards#qr-pay" },
      { icon: Globe, title: "Online Shopping", desc: "Secure e-commerce payments", href: "/cards#online" },
      { icon: ShoppingCart, title: "Bill Payments", desc: "LUKU, DAWASA, school fees & more", href: "/cards#bill-pay" },
    ],
  },
  {
    id: "loans",
    label: "Loans",
    items: [
      { icon: Tractor, title: "Agri-Business Loans", desc: "TSH 100K-50M, 8-12% rate", href: "/loan-products#agri-business" },
      { icon: PiggyBank, title: "Salaried Loans", desc: "Fast payroll-linked loans", href: "/loan-products#salaried" },
      { icon: Smartphone, title: "Digital Loans", desc: "Instant via CoopPesa app", href: "/loan-products#digital" },
      { icon: Briefcase, title: "SME Loans", desc: "Working capital & asset finance", href: "/loan-products#sme" },
      { icon: Car, title: "Asset Financing", desc: "Up to 80% asset value", href: "/loan-products#asset-financing" },
      { icon: Store, title: "Business Loans", desc: "Corporate & large enterprise", href: "/loan-products#business" },
    ],
  },
];

export default function ServicesGrid() {
  const [activeTab, setActiveTab] = useState("cards");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <section id="services" ref={ref} className="bg-[#F2F4F8] py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12">
        {/* Tabs — underline style */}
        <div className="mb-10 flex items-center justify-center gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-4 text-[13px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-[#1A56A0]"
                  : "text-[#4A5568]/50 hover:text-[#4A5568]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.span
                  layoutId="services-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#1A8A3A]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {currentTab.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  <Link
                    href={item.href}
                    className="group flex items-start gap-4 rounded-xl bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-1"
                  >
                    <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1A8A3A]/10">
                      <Icon className="h-5 w-5 text-[#1A8A3A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-[#1A56A0] group-hover:text-[#1A8A3A] transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#4A5568]">
                        {item.desc}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 mt-1 text-[#1A56A0]/20 group-hover:text-[#1A8A3A] transition-colors" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
