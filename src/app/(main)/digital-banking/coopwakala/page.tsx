"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  Banknote,
  ArrowDownToLine,
  Receipt,
  Wallet,
  UserPlus,
  ArrowLeftRight,
  MapPin,
  ClipboardCheck,
  Building2,
  FileText,
  ShieldCheck,
  Wifi,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const services = [
  { icon: Banknote, title: "Cash Deposits", desc: "Deposit money into your CoopBank account through any authorized agent near you." },
  { icon: ArrowDownToLine, title: "Cash Withdrawals", desc: "Withdraw cash conveniently without visiting a branch. Available at all agent locations." },
  { icon: Receipt, title: "Bill Payments", desc: "Pay LUKU, DAWASA, school fees and other utility bills through your nearest agent." },
  { icon: Wallet, title: "Balance Inquiry", desc: "Check your account balance quickly and securely at any CoopWakala agent." },
  { icon: UserPlus, title: "Account Opening", desc: "Open a new CoopBank account with the help of an agent -- no branch visit needed." },
  { icon: ArrowLeftRight, title: "Money Transfers", desc: "Send money to other CoopBank accounts or to other banks through an agent." },
];

const agentRequirements = [
  { icon: Building2, title: "Established Business", desc: "A registered business operating for at least 12 months with a permanent location." },
  { icon: FileText, title: "Business License", desc: "Valid business registration certificate and TIN from the Tanzania Revenue Authority." },
  { icon: ShieldCheck, title: "Good Character", desc: "Clean criminal record and no history of fraud or financial misconduct." },
  { icon: Wallet, title: "Working Capital", desc: "Minimum float capital of TSH 500,000 to ensure smooth daily operations." },
  { icon: Wifi, title: "Network Coverage", desc: "Location with reliable mobile network coverage to process transactions." },
  { icon: ClipboardCheck, title: "Training Commitment", desc: "Willingness to complete CoopBank agent training and comply with operating procedures." },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

function AgentApplicationForm() {
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", region: "", district: "",
    ward: "", street: "", businessType: "", businessName: "", comments: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/wakala-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-16 px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A8A3A]/10 mb-6">
          <CheckCircle2 size={32} className="text-[#1A8A3A]" />
        </div>
        <h3 className="text-2xl font-extrabold text-[#1A1A2E] mb-3">Application Received</h3>
        <p className="text-[#4A5568] max-w-md mx-auto leading-relaxed">
          Thank you for your interest in becoming a CoopWakala agent. Our team will review your application and contact you within 3 business days.
        </p>
      </div>
    );
  }

  const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#1A1A2E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 focus:border-[#1A56A0] transition";
  const labelClass = "block text-sm font-semibold text-[#1A1A2E] mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Details */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Full Name / Business Name <span className="text-red-500">*</span></label>
          <input className={inputClass} placeholder="e.g. Amina Salehe or Salehe Traders" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
          <input className={inputClass} placeholder="+255 7XX XXX XXX" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
          <input className={inputClass} placeholder="your@email.com" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Type of Business <span className="text-red-500">*</span></label>
          <select className={inputClass} value={form.businessType} onChange={(e) => set("businessType", e.target.value)} required>
            <option value="">Select type...</option>
            <option>General Shop / Duka</option>
            <option>Pharmacy</option>
            <option>Hardware Store</option>
            <option>Mobile Money Agent</option>
            <option>Supermarket / Minimart</option>
            <option>Petrol Station</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      {/* Business Location */}
      <div>
        <p className={labelClass}>Business Location <span className="text-red-500">*</span></p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-[#4A5568] mb-1">Region</label>
            <input className={inputClass} placeholder="e.g. Dodoma" value={form.region} onChange={(e) => set("region", e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-[#4A5568] mb-1">District</label>
            <input className={inputClass} placeholder="e.g. Dodoma Urban" value={form.district} onChange={(e) => set("district", e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-[#4A5568] mb-1">Ward</label>
            <input className={inputClass} placeholder="e.g. Makole" value={form.ward} onChange={(e) => set("ward", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-[#4A5568] mb-1">Street</label>
            <input className={inputClass} placeholder="e.g. Uhuru Street" value={form.street} onChange={(e) => set("street", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Optional fields */}
      <div>
        <label className={labelClass}>Business Name <span className="text-gray-400 font-normal text-xs">(if applicable)</span></label>
        <input className={inputClass} placeholder="Registered business name" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Additional Comments</label>
        <textarea className={`${inputClass} resize-none`} rows={3} placeholder="Any additional information about your business or application..." value={form.comments} onChange={(e) => set("comments", e.target.value)} />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          Something went wrong. Please try again or call +255 27 275 4470.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#1A8A3A] hover:bg-[#14692D] disabled:opacity-60 text-white font-semibold text-sm transition-colors duration-300"
      >
        {status === "loading" ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><ArrowRight size={16} /> Submit Application</>}
      </button>
    </form>
  );
}

export default function CoopWakalaPage() {
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
            <span className="text-white font-semibold">CoopWakala</span>
          </motion.nav>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
              + Agency Banking
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center"
          >
            Banking in Your Neighbourhood
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-center"
          >
            Access banking services through authorized CoopWakala agents across Tanzania.
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SERVICES GRID                                                */}
      {/* ============================================================ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-4">Available Services</h2>
            <p className="text-[#4A5568] text-base max-w-xl mx-auto">All the banking services you need, right in your neighbourhood.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="rounded-2xl bg-[#f4f6f9] border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1A56A0]/10 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-[#1A56A0]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A56A0] mb-2">{service.title}</h3>
                  <p className="text-[#4A5568] text-sm leading-relaxed">{service.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FIND AN AGENT                                                */}
      {/* ============================================================ */}
      <section className="bg-[#f4f6f9] py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#1A8A3A]/10 flex items-center justify-center mx-auto mb-6">
              <MapPin size={28} className="text-[#1A8A3A]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-4">Find a CoopWakala Agent</h2>
            <p className="text-[#4A5568] text-base leading-relaxed max-w-2xl mx-auto mb-8">
              CoopWakala agents are located across Tanzania in urban and rural areas alike. Visit your nearest agent to deposit, withdraw, pay bills and more -- no branch visit required. Look for the CoopWakala signage at shops and kiosks near you.
            </p>
            <Link
              href="/digital-banking/coopwakala/agents"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#1A8A3A] hover:bg-[#14692D] text-white font-semibold text-sm transition-colors duration-300"
            >
              <MapPin size={16} />
              Find Nearest Agent
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BECOME AN AGENT                                              */}
      {/* ============================================================ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-4">Become a CoopWakala Agent</h2>
            <p className="text-[#4A5568] text-base max-w-2xl mx-auto">
              Earn additional income by offering banking services to your community. Here is what you need to get started.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
            {agentRequirements.map((req, i) => {
              const Icon = req.icon;
              return (
                <motion.div
                  key={req.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="rounded-2xl border border-gray-100 bg-[#f4f6f9] p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1A56A0]/10 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-[#1A56A0]" />
                  </div>
                  <h4 className="text-lg font-bold text-[#1A56A0] mb-2">{req.title}</h4>
                  <p className="text-[#4A5568] text-sm leading-relaxed">{req.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Online Application Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-gray-100 bg-[#f4f6f9] p-8 sm:p-10"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-extrabold text-[#1A56A0] mb-2">Apply Online</h3>
              <p className="text-[#4A5568] text-sm leading-relaxed">
                Fill in your details below and our team will reach out within 3 business days to guide you through the next steps.
              </p>
            </div>
            <AgentApplicationForm />
          </motion.div>
        </div>
      </section>

    </>
  );
}
