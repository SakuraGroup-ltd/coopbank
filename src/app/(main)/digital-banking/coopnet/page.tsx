"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Monitor,
  ArrowLeftRight,
  Receipt,
  FileDown,
  Users,
  CalendarClock,
  Clock,
  Globe,
  ShieldCheck,
  Lock,
  Eye,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  TABS DATA                                                          */
/* ------------------------------------------------------------------ */

const tabs = ["Benefits", "Features", "How To Apply", "Online Security"] as const;
type TabKey = (typeof tabs)[number];

const benefits = [
  "Convenient -- banking from home or office",
  "Available 24 hours a day",
  "User-friendly interface",
  "SMS and email transaction notifications",
  "Easy account management saving time and energy",
  "Multi-account view across all your CoopBank accounts",
];

const features = [
  { icon: Monitor, title: "Account Management", desc: "View balances, manage beneficiaries, and control all linked accounts from one dashboard." },
  { icon: ArrowLeftRight, title: "Fund Transfers", desc: "Transfer funds between your accounts, to other CoopBank accounts, or to other banks." },
  { icon: Receipt, title: "Bill Payments", desc: "Pay LUKU, DAWASA, school fees and other utility bills directly from your account." },
  { icon: FileDown, title: "Statement Downloads", desc: "Download account statements in PDF or CSV format for any date range." },
  { icon: Clock, title: "Scheduled Payments", desc: "Schedule future-dated payments to ensure bills are paid on time." },
];

const steps = [
  "Visit any CoopBank branch with your ID",
  "Request internet banking activation",
  "Receive login credentials via SMS",
  "Log in at coopnet.coopbank.co.tz",
  "Set your preferred password",
];

const securityTips = [
  { icon: Lock, title: "Never Share Credentials", desc: "Never share your login details with anyone, including bank staff. CoopBank will never ask for your password." },
  { icon: LogOut, title: "Always Log Out", desc: "Always log out after each session, especially on shared or public computers." },
  { icon: ShieldCheck, title: "Use Strong Passwords", desc: "Create passwords with a mix of uppercase, lowercase, numbers, and special characters." },
  { icon: Eye, title: "Check for HTTPS", desc: "Always verify that the URL begins with https:// and shows a padlock icon before entering credentials." },
  { icon: AlertTriangle, title: "Report Suspicious Activity", desc: "Report any suspicious activity immediately by calling our 24/7 helpline or visiting your nearest branch." },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function CoopNetPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("Benefits");

  return (
    <>
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/images/pattern-bg.jpg')",
            backgroundSize: "1200px",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="absolute inset-0 bg-[#1A56A0]/[0.99] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-sm text-white/50 mb-8"
          >
            <Link href="/" className="hover:text-white transition-colors font-medium">Home</Link>
            <ChevronRight size={14} className="text-white/30" />
            <Link href="/digital-banking" className="hover:text-white transition-colors font-medium">Digital Banking</Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white font-semibold">CoopNet</span>
          </motion.nav>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
              + Internet Banking
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center"
          >
            CoopNet Internet Banking
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-center"
          >
            Enjoy the convenience of banking on your own terms, wherever and whenever. Get real-time balances, view and download your account activity.
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PERSONAL / CORPORATE BANKING CARDS                           */}
      {/* ============================================================ */}
      <section className="bg-[#f4f6f9] py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }} className="relative rounded-2xl bg-white border border-gray-100 p-8 shadow-sm overflow-hidden cursor-pointer transition-colors hover:border-[#1A8A3A]/20">
              <div className="absolute -bottom-4 -right-4 opacity-[0.06]">
                <Monitor size={120} className="text-[#1A56A0]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-extrabold text-[#1A56A0] mb-3">Personal Internet Banking</h3>
                <p className="text-[#4A5568] text-sm leading-relaxed mb-6">Manage your personal accounts, pay bills, transfer funds and download statements from the comfort of your home or office.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://coopnet.coopbank.co.tz" target="_blank" rel="noopener" className="inline-flex items-center px-6 py-2.5 rounded-lg bg-[#1A8A3A] hover:bg-[#14692D] text-white font-semibold text-sm transition-colors">Login</a>
                  <a href="#" className="inline-flex items-center px-6 py-2.5 rounded-lg border-2 border-[#1A8A3A] text-[#1A8A3A] hover:bg-[#1A8A3A] hover:text-white font-semibold text-sm transition-colors">Sign Up</a>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }} className="relative rounded-2xl bg-white border border-gray-100 p-8 shadow-sm overflow-hidden cursor-pointer transition-colors hover:border-[#1A8A3A]/20">
              <div className="absolute -bottom-4 -right-4 opacity-[0.06]">
                <Globe size={120} className="text-[#1A56A0]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-extrabold text-[#1A56A0] mb-3">Corporate Internet Banking</h3>
                <p className="text-[#4A5568] text-sm leading-relaxed mb-6">Streamline your business banking with multi-user access, bulk payments, payroll processing and detailed financial reporting.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://coopnet.coopbank.co.tz" target="_blank" rel="noopener" className="inline-flex items-center px-6 py-2.5 rounded-lg bg-[#1A8A3A] hover:bg-[#14692D] text-white font-semibold text-sm transition-colors">Login</a>
                  <a href="#" className="inline-flex items-center px-6 py-2.5 rounded-lg border-2 border-[#1A8A3A] text-[#1A8A3A] hover:bg-[#1A8A3A] hover:text-white font-semibold text-sm transition-colors">Sign Up</a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TABBED SECTION                                               */}
      {/* ============================================================ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* Left -- Fixed image */}
            <div className="lg:sticky lg:top-32">
              <div className="relative w-full aspect-[4/4] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/products/coopnet-lady.jpg"
                  alt="CoopNet Internet Banking"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Right -- Tabs + content */}
            <div>
              {/* Tab bar */}
              <div className="flex gap-6 border-b border-gray-200 mb-10 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative pb-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                      activeTab === tab ? "text-[#1A8A3A]" : "text-[#4A5568] hover:text-[#1A56A0]"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="coopnet-tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1A8A3A] rounded-full"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Benefits Tab */}
              {activeTab === "Benefits" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-2xl font-extrabold text-[#1A56A0] mb-6">Why Choose CoopNet?</h3>
                  <div className="space-y-0 divide-y divide-gray-100">
                    {benefits.map((item) => (
                      <div key={item} className="flex items-start gap-3 py-4">
                        <Check size={18} className="text-[#1A8A3A] mt-0.5 shrink-0" />
                        <span className="text-[#4A5568] text-sm leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Features Tab */}
              {activeTab === "Features" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-2xl font-extrabold text-[#1A56A0] mb-6">What You Can Do</h3>
                  <div className="space-y-0 divide-y divide-gray-100">
                    {features.map((f) => {
                      const Icon = f.icon;
                      return (
                        <div key={f.title} className="flex items-start gap-4 py-4 group">
                          <Icon size={20} className="text-[#1A8A3A] mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-[#1A56A0] text-sm">{f.title}</p>
                            <p className="text-[#4A5568] text-xs mt-0.5">{f.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

          {/* How To Apply Tab */}
          {activeTab === "How To Apply" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-2xl font-extrabold text-[#1A56A0] mb-6">Get Started in 5 Steps</h3>
              <div className="space-y-0 divide-y divide-gray-100">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4 py-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A8A3A] flex items-center justify-center text-white font-bold text-xs">
                      {i + 1}
                    </span>
                    <p className="text-[#1A56A0] font-semibold text-sm pt-1.5">{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Online Security Tab */}
          {activeTab === "Online Security" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-2xl font-extrabold text-[#1A56A0] mb-2">Stay Safe Online</h3>
              <p className="text-[#4A5568] text-sm mb-6">Follow these guidelines to protect your account.</p>
              <div className="space-y-0 divide-y divide-gray-100">
                {securityTips.map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <div key={tip.title} className="flex items-start gap-3 py-4">
                      <Icon size={18} className="text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-[#1A56A0] text-sm">{tip.title}</p>
                        <p className="text-[#4A5568] text-xs mt-0.5">{tip.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

            </div>
          </div>
        </div>
      </section>

    </>
  );
}
