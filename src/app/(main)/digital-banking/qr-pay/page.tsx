"use client";

import { motion } from "framer-motion";
import {
  ChevronRight,
  Smartphone,
  QrCode,
  ScanLine,
  ShieldCheck,
  MapPin,
  Network,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const steps = [
  { icon: Smartphone, label: "Open CoopPesa App", desc: "Launch the CoopPesa mobile banking app on your phone." },
  { icon: QrCode, label: "Tap \"QR Pay\"", desc: "Select the QR Pay option from the main menu." },
  { icon: ScanLine, label: "Scan Merchant QR Code", desc: "Point your camera at the merchant's QR code." },
  { icon: ShieldCheck, label: "Confirm with PIN", desc: "Verify the amount and confirm with your transaction PIN." },
];

const zigzagSections = [
  {
    icon: MapPin,
    title: "Pay Anywhere",
    desc: "Use TAN-QR / Lipa Namba at thousands of merchants across Tanzania -- from supermarkets and restaurants to pharmacies and fuel stations. Simply scan the QR code at the point of sale and your payment is processed instantly. No cash, no change, no hassle.",
    image: "/images/products/coopesa.jpg",
  },
  {
    icon: Network,
    title: "All Networks Supported",
    desc: "TAN-QR works seamlessly across all mobile money networks in Tanzania including M-Pesa, Tigo Pesa, Airtel Money, and Halotel. Whether you are paying from your CoopBank account or mobile wallet, the experience is the same -- fast and reliable.",
    image: "/images/products/fixed-deposit.jpg",
  },
  {
    icon: Zap,
    title: "Instant Confirmation",
    desc: "Receive real-time confirmation via SMS the moment your payment goes through. Both you and the merchant get instant receipts, ensuring transparency and trust in every transaction. No more waiting or uncertainty.",
    image: "/images/products/group.jpg",
  },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function QrPayPage() {
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
            <span className="text-white font-semibold">QR Pay</span>
          </motion.nav>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
              + QR Payments
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center"
          >
            Scan. Pay. Done.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-center"
          >
            TAN-QR / Lipa Namba -- scan to pay at any merchant nationwide. Works across all mobile money networks.
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                 */}
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
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-4">How It Works</h2>
            <p className="text-[#4A5568] text-base max-w-xl mx-auto">Pay in seconds with just four simple steps.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="relative mx-auto mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#1A56A0]/10 flex items-center justify-center mx-auto">
                      <Icon size={28} className="text-[#1A56A0]" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#1A8A3A] flex items-center justify-center text-white font-bold text-xs">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1A56A0] mb-2">{step.label}</h3>
                  <p className="text-[#4A5568] text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  ZIGZAG SECTIONS                                              */}
      {/* ============================================================ */}
      {zigzagSections.map((section, i) => {
        const Icon = section.icon;
        const isEven = i % 2 === 1;
        const bgColor = i % 2 === 0 ? "bg-[#f4f6f9]" : "bg-white";

        const textContent = (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1A8A3A]/10 flex items-center justify-center mb-5">
              <Icon size={24} className="text-[#1A8A3A]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1A56A0] mb-4">{section.title}</h3>
            <p className="text-[#4A5568] text-base leading-relaxed">{section.desc}</p>
          </motion.div>
        );

        const imageContent = (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg"
          >
            <Image
              src={section.image}
              alt={section.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        );

        return (
          <section key={section.title} className={`${bgColor} py-20 sm:py-24`}>
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {isEven ? (
                  <>
                    {imageContent}
                    {textContent}
                  </>
                ) : (
                  <>
                    {textContent}
                    {imageContent}
                  </>
                )}
              </div>
            </div>
          </section>
        );
      })}

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
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Download CoopPesa Today</h2>
                <p className="mt-3 text-base text-white/50">Available on Android and iOS</p>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <a href="https://play.google.com/store/apps/details?id=tz.co.coopbank.coopesa&hl=en" target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20">Google Play</a>
                  <a href="https://apps.apple.com/tz/app/coopesa/id6755827543" target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20">App Store</a>
                </div>
              </div>
              <div className="hidden sm:block flex-shrink-0">
                <img src="/images/coopesa-mockup.png" alt="CoopPesa Mobile App" className="h-[320px] w-auto drop-shadow-2xl" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
