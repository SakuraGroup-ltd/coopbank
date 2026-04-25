"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  UserPlus,
  Wallet,
  Smartphone,
  ArrowLeftRight,
  Receipt,
  FileText,
  Lock,
  Landmark,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const ussdServices = [
  { icon: UserPlus, title: "Open Account", code: "*150*84*1#", desc: "Create a new account directly from your phone without visiting a branch." },
  { icon: Wallet, title: "Check Balance", code: "*150*84*2#", desc: "View your account balance instantly, anytime, anywhere." },
  { icon: Smartphone, title: "Buy Airtime", code: "*150*84*3#", desc: "Top up airtime for any network -- Vodacom, Tigo, Airtel, Halotel." },
  { icon: ArrowLeftRight, title: "Transfer Money", code: "*150*84*4#", desc: "Send money to any bank account across Tanzania." },
  { icon: Receipt, title: "Pay Bills", code: "*150*84*5#", desc: "Pay LUKU, DAWASA, school fees and government services." },
  { icon: FileText, title: "Mini Statement", code: "*150*84*6#", desc: "View your last 5 transactions for a quick financial overview." },
  { icon: Lock, title: "Change PIN", code: "*150*84*7#", desc: "Update your security PIN to keep your account safe." },
  { icon: Landmark, title: "Loan Services", code: "*150*84*8#", desc: "Check loan eligibility and apply for instant mobile loans." },
];

const faqs = [
  {
    q: "What is USSD banking?",
    a: "USSD banking allows you to access banking services by dialling *150*84# from your mobile phone. It works on all phones including feature phones and does not require an internet connection.",
  },
  {
    q: "Do I need internet to use USSD banking?",
    a: "No. USSD banking works without internet. All you need is a mobile phone with an active SIM card registered with your CoopBank account.",
  },
  {
    q: "Is there a charge for USSD transactions?",
    a: "Standard transaction fees apply depending on the service. Balance inquiries and mini statements have minimal charges. Check with your branch for the full tariff guide.",
  },
  {
    q: "What should I do if I forget my USSD PIN?",
    a: "Visit your nearest CoopBank branch with a valid ID to reset your PIN. For security, PIN resets cannot be done over the phone.",
  },
  {
    q: "Can I send money to other banks via USSD?",
    a: "Yes. You can transfer funds to any bank account in Tanzania using the *150*84*4# menu. You will need the recipient's bank name and account number.",
  },
  {
    q: "Is USSD banking secure?",
    a: "Yes. Every transaction requires your personal PIN. Sessions time out automatically after inactivity, and you receive SMS confirmation for every transaction.",
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ ITEM                                                           */
/* ------------------------------------------------------------------ */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left focus:outline-none"
      >
        <span className={`text-base font-semibold transition-colors duration-200 ${open ? "text-[#1A8A3A]" : "text-[#1A56A0]"}`}>
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`flex-shrink-0 ml-4 transition-colors duration-200 ${open ? "text-[#1A8A3A]" : "text-[#1A56A0]/50"}`}
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[#4A5568] text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function UssdPage() {
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
            <span className="text-white font-semibold">USSD Banking</span>
          </motion.nav>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
              + USSD Banking
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 text-center font-mono"
          >
            *150*84#
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-center"
          >
            No internet required. Works on every mobile device including feature phones.
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  USSD SERVICES GRID                                           */}
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
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-4">Banking at Your Fingertips</h2>
            <p className="text-[#4A5568] text-base max-w-xl mx-auto">Dial *150*84# and access a full range of banking services from any phone.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ussdServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="rounded-2xl bg-white border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1A56A0]/10 flex items-center justify-center">
                      <Icon size={22} className="text-[#1A56A0]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-[#1A56A0] mb-1">{service.title}</h3>
                      <p className="font-mono text-[#1A8A3A] font-bold text-sm mb-2">{service.code}</p>
                      <p className="text-[#4A5568] text-sm leading-relaxed">{service.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FAQ SECTION                                                  */}
      {/* ============================================================ */}
      <section className="bg-[#f4f6f9] py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-4">Frequently Asked Questions</h2>
            <p className="text-[#4A5568] text-base">Common questions about USSD banking</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl border border-gray-100 px-6 sm:px-8 divide-y-0"
          >
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BOTTOM CTA                                                   */}
      {/* ============================================================ */}
      <section className="bg-white pt-20 sm:pt-24 pb-0 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12 pb-20 sm:pb-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl bg-[#1A56A0] px-8 py-16 sm:px-16 overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none rounded-3xl" style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: "1200px", backgroundRepeat: "repeat" }} />
            <div className="absolute inset-0 bg-[#1A56A0]/[0.99] pointer-events-none rounded-3xl" />
            <div className="relative z-10 flex items-center justify-between gap-8">
              <div className="max-w-md">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Download CoopEsa Today</h2>
                <p className="mt-3 text-base text-white/50">Available on Android and iOS</p>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <a href="https://play.google.com/store/apps/details?id=tz.co.coopbank.coopesa&hl=en" target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20">Google Play</a>
                  <a href="https://apps.apple.com/tz/app/coopesa/id6755827543" target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20">App Store</a>
                </div>
              </div>
              <div className="hidden sm:block flex-shrink-0">
                <img src="/images/coopesa-mockup.png" alt="CoopEsa Mobile App" className="h-[320px] w-auto drop-shadow-2xl" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
