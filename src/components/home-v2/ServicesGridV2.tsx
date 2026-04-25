"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Banknote,
  PiggyBank,
  CreditCard,
  ArrowRight,
  Wallet,
  Building2,
  Landmark,
  ShieldCheck,
  QrCode,
  Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ServiceItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
  color: string;
}

interface Tab {
  id: string;
  label: string;
  items: ServiceItem[];
}

const tabs: Tab[] = [
  {
    id: "accounts",
    label: "Accounts & Deposits",
    items: [
      { icon: PiggyBank, title: "Mama Africa Account", desc: "Everyday savings for all Tanzanians", href: "/personal-banking#mama-africa", color: "#00C853" },
      { icon: Wallet, title: "Baba Fedha Account", desc: "Family financial planning", href: "/personal-banking#baba-fedha", color: "#7C4DFF" },
      { icon: Landmark, title: "Kilimo Tija Account", desc: "Agricultural savings account", href: "/personal-banking#kilimo-tija", color: "#00BCD4" },
      { icon: Building2, title: "Current Account", desc: "Unlimited daily transactions", href: "/personal-banking#current-account", color: "#FF6D00" },
      { icon: ShieldCheck, title: "Fixed Deposit", desc: "Up to 10% p.a. interest", href: "/personal-banking#fixed-deposit", color: "#00C853" },
      { icon: PiggyBank, title: "Msomi Account", desc: "No monthly fees", href: "/personal-banking#msomi", color: "#7C4DFF" },
    ],
  },
  {
    id: "cards",
    label: "Cards & Payments",
    items: [
      { icon: CreditCard, title: "Visa Debit Card", desc: "Linked to your CoopBank account", href: "/cards#visa-debit", color: "#7C4DFF" },
      { icon: CreditCard, title: "Visa Prepaid Card", desc: "Load & spend anywhere", href: "/cards#visa-prepaid", color: "#00BCD4" },
      { icon: QrCode, title: "QR Pay", desc: "Scan-to-pay at merchant points", href: "/cards#qr-pay", color: "#00C853" },
      { icon: Globe, title: "Online Shopping", desc: "Secure e-commerce payments", href: "/cards#online", color: "#FF6D00" },
      { icon: Banknote, title: "Bill Payments", desc: "Utilities, school fees & more", href: "/cards#bill-pay", color: "#00C853" },
    ],
  },
  {
    id: "loans",
    label: "Loans",
    items: [
      { icon: Banknote, title: "Agri-Business Loans", desc: "TSH 100K–50M, 8–12% rate", href: "/loan-products#agri-business", color: "#00C853" },
      { icon: Banknote, title: "Salaried Loans", desc: "Fast payroll-linked loans", href: "/loan-products#salaried", color: "#FF6D00" },
      { icon: Smartphone, title: "Digital Loans", desc: "Instant via CoopEsa app", href: "/loan-products#digital", color: "#00BCD4" },
      { icon: Banknote, title: "SME Loans", desc: "Working capital & asset finance", href: "/loan-products#sme", color: "#7C4DFF" },
      { icon: Banknote, title: "Asset Financing", desc: "Up to 80% asset value", href: "/loan-products#asset-financing", color: "#00C853" },
      { icon: Banknote, title: "Business Loans", desc: "Corporate & large enterprise", href: "/loan-products#business", color: "#FF6D00" },
    ],
  },
];

export default function ServicesGridV2() {
  const [activeTab, setActiveTab] = useState("accounts");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <section
      id="services"
      ref={ref}
      className="bg-white py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-[36px] font-extrabold text-[#1A1A2E] sm:text-[42px]">
            How can we help you?
          </h2>
          <p className="mt-3 text-[16px] text-[#94A3B8]">
            Explore our range of banking products tailored for every Tanzanian.
          </p>
        </motion.div>

        {/* Toggle tabs — pill style */}
        <div className="mb-12 flex items-center justify-center">
          <div className="inline-flex rounded-2xl bg-[#F8FAFC] p-1.5 border border-[#F1F5F9]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-xl px-6 py-3 text-[13px] font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-white shadow-md"
                    : "text-[#64748B] hover:text-[#1A1A2E]"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab-v2"
                    className="absolute inset-0 rounded-xl bg-[#1A1A2E]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
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
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Link
                    href={item.href}
                    className="group flex items-start gap-4 rounded-2xl border border-[#F1F5F9] bg-white p-6 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-transparent"
                  >
                    <div
                      className="shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${item.color}10` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-[#1A1A2E] group-hover:text-[#00C853] transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#94A3B8]">
                        {item.desc}
                      </p>
                    </div>
                    <div className="shrink-0 mt-1 h-8 w-8 rounded-full bg-[#F8FAFC] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-[#00C853]/10">
                      <ArrowRight className="h-3.5 w-3.5 text-[#00C853]" />
                    </div>
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
