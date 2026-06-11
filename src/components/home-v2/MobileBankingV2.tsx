"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Smartphone, Globe, Banknote, Building2, Fingerprint, Bell, QrCode, Wifi } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}

const features: Feature[] = [
  { icon: Fingerprint, title: "Biometric Login", desc: "Fingerprint & Face ID authentication", color: "#7C4DFF" },
  { icon: QrCode, title: "QR Payments", desc: "Scan-to-pay anywhere instantly", color: "#00BCD4" },
  { icon: Bell, title: "Real-time Alerts", desc: "Instant push notifications", color: "#FF6D00" },
  { icon: Wifi, title: "No Internet Option", desc: "USSD *150*84# on any phone", color: "#00C853" },
];

const channels = [
  { icon: Smartphone, title: "CoopPesa Mobile App", desc: "Full banking on Android & iOS", href: "/digital-banking#coopesa", color: "#00C853" },
  { icon: Globe, title: "CoopNet Internet Banking", desc: "24/7 browser-based access", href: "/digital-banking#coopnet", color: "#00BCD4" },
  { icon: Banknote, title: "USSD *150*84#", desc: "Works on every phone", href: "/digital-banking#ussd", color: "#7C4DFF" },
  { icon: Building2, title: "CoopWakala Agency", desc: "100+ agent points nationwide", href: "/digital-banking#coopwakala", color: "#FF6D00" },
];

export default function MobileBankingV2() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-br from-[#FAFBFD] via-white to-[#F0FFF4]/50 py-24 lg:py-28"
    >
      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#00C853]/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#7C4DFF]/[0.03] blur-[80px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1440px] px-6 sm:px-12">
        <div className="lg:flex lg:items-center lg:gap-20">

          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-14 lg:mb-0 lg:flex-1"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[#00C853]/8 border border-[#00C853]/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#00C853] mb-6">
              <Smartphone className="h-3 w-3" />
              Digital Banking
            </span>
            <h2 className="text-[36px] font-extrabold text-[#1A1A2E] leading-tight sm:text-[42px]">
              More power at your{" "}
              <span className="bg-gradient-to-r from-[#00C853] to-[#00BCD4] bg-clip-text text-transparent">fingertips</span>
            </h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-[#64748B]">
              A simple, secure and convenient way to access your accounts and cards using your smartphone.
            </p>

            {/* Feature cards */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                    className="group rounded-2xl border border-[#F1F5F9] bg-white p-4 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl mb-3"
                      style={{ backgroundColor: `${f.color}10` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: f.color }} />
                    </div>
                    <h4 className="text-[13px] font-bold text-[#1A1A2E]">{f.title}</h4>
                    <p className="mt-1 text-[11px] text-[#94A3B8]">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Download buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="https://apps.apple.com/tz/app/coopesa/id6755827543" target="_blank" rel="noopener"
                className="inline-flex items-center gap-3 rounded-2xl bg-[#1A1A2E] px-6 py-3.5 transition-all hover:bg-[#2D2D44] hover:shadow-[0_8px_30px_rgba(26,26,46,0.2)]"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="white"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/50 leading-none">Download on the</span>
                  <span className="text-[14px] font-semibold text-white leading-tight">App Store</span>
                </div>
              </Link>

              <Link
                href="https://play.google.com/store/apps/details?id=tz.co.coopbank.coopesa&hl=en" target="_blank" rel="noopener"
                className="inline-flex items-center gap-3 rounded-2xl bg-[#1A1A2E] px-6 py-3.5 transition-all hover:bg-[#2D2D44] hover:shadow-[0_8px_30px_rgba(26,26,46,0.2)]"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0">
                  <path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 01-.61-.92V2.734c0-.382.218-.72.61-.92z" fill="#4285F4"/>
                  <path d="M17.324 8.676l-3.53 3.53L17.323 15.736l4.09-2.36c.46-.266.46-.936 0-1.203l-4.09-2.36-.001-.137z" fill="#FBBC04"/>
                  <path d="M3.61 1.814L13.793 12l3.53-3.324L5.824.814C5.084.38 4.244.474 3.61 1.027v.787z" fill="#34A853"/>
                  <path d="M13.794 12L3.61 22.186c.634.553 1.474.647 2.214.213l11.5-6.663L13.794 12z" fill="#EA4335"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/50 leading-none">GET IT ON</span>
                  <span className="text-[14px] font-semibold text-white leading-tight">Google Play</span>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Right — Phone mockup + channel cards */}
          <div className="lg:flex-1 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mb-12"
            >
              {/* Phone */}
              <div className="relative mx-auto w-[260px] h-[520px] rounded-[40px] border-[8px] border-[#1A1A2E] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.12)] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#1A1A2E] rounded-b-2xl z-10" />

                {/* Green header */}
                <div className="bg-gradient-to-br from-[#00C853] to-[#1A8A3A] pt-11 pb-5 px-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-[3px]">
                      <span className="block w-4 h-[2px] bg-white/80 rounded" />
                      <span className="block w-3 h-[2px] bg-white/80 rounded" />
                      <span className="block w-2 h-[2px] bg-white/80 rounded" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full border-2 border-white/70" />
                    </div>
                  </div>
                  <p className="text-[17px] font-bold text-white">Habari! Julieth!</p>
                  <p className="text-[10px] text-white/60 mt-1">Akaunti namba</p>
                  <p className="text-[13px] font-semibold text-white mt-0.5">00 ****** 130</p>
                </div>

                {/* Balance card */}
                <div className="mx-4 -mt-2 rounded-2xl bg-gradient-to-r from-[#1A1A2E] to-[#2D2D44] p-4 shadow-lg">
                  <p className="text-[9px] text-white/50">Salio lako ni:</p>
                  <p className="text-[18px] font-bold text-white mt-1">TZS ******</p>
                  <div className="mt-3 flex gap-2">
                    <div className="rounded-lg bg-[#00C853]/15 px-3 py-1.5">
                      <p className="text-[8px] font-bold text-[#00C853]">Tuma pesa</p>
                    </div>
                    <div className="rounded-lg bg-white/10 px-3 py-1.5">
                      <p className="text-[8px] font-bold text-white/70">Taarifa</p>
                    </div>
                  </div>
                </div>

                {/* Services grid */}
                <div className="px-4 mt-4">
                  <p className="text-[9px] text-[#00C853] font-bold mb-3 uppercase tracking-wider">Huduma</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Serikali", color: "#00C853" },
                      { label: "LUKU", color: "#FF6D00" },
                      { label: "Hamisha", color: "#00BCD4" },
                      { label: "Airtime", color: "#7C4DFF" },
                      { label: "Mikopo", color: "#00C853" },
                      { label: "Bili", color: "#FF6D00" },
                    ].map((svc) => (
                      <div key={svc.label} className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: `${svc.color}10` }}
                        >
                          <div className="w-4 h-4 rounded-lg" style={{ backgroundColor: svc.color, opacity: 0.4 }} />
                        </div>
                        <span className="text-[7px] text-[#64748B] text-center font-medium">{svc.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Soft glow behind phone */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#00C853]/[0.06] to-transparent blur-3xl rounded-full scale-110 pointer-events-none" />
            </motion.div>

            {/* Channel cards */}
            <div className="w-full grid gap-3 grid-cols-2">
              {channels.map((ch, i) => {
                const Icon = ch.icon;
                return (
                  <motion.div
                    key={ch.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                  >
                    <Link
                      href={ch.href}
                      className="group flex items-start gap-3 rounded-2xl border border-[#F1F5F9] bg-white p-4 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
                    >
                      <div
                        className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${ch.color}10` }}
                      >
                        <Icon className="h-4.5 w-4.5" style={{ color: ch.color }} />
                      </div>
                      <div>
                        <h3 className="text-[12px] font-bold text-[#1A1A2E] group-hover:text-[#00C853] transition-colors">
                          {ch.title}
                        </h3>
                        <p className="mt-0.5 text-[10px] text-[#94A3B8]">{ch.desc}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
