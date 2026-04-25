"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroV2() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-[#FAFBFD] via-white to-[#F0FFF4]">
      {/* Soft mesh gradient accents */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#00C853]/[0.06] to-[#00BCD4]/[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#7C4DFF]/[0.03] blur-[80px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-[1440px] items-center px-6 sm:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">

          {/* Left — Copy */}
          <div className="pt-20 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#00C853]/8 border border-[#00C853]/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#00C853]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C853]" />
                </span>
                Ustawi kwa wote
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-7 text-[42px] font-extrabold leading-[1.08] tracking-tight text-[#1A1A2E] sm:text-[52px] lg:text-[58px]"
            >
              Empowering{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#00C853] to-[#00BCD4] bg-clip-text text-transparent">
                  communities
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#00C853] to-[#00BCD4] origin-left"
                />
              </span>{" "}
              through cooperative banking
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 max-w-lg text-[17px] leading-relaxed text-[#64748B]"
            >
              Accessible financial services for individuals, businesses, and
              communities across Tanzania. Open an account in minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a
                href="https://coopnet.coopbank.co.tz/Account/Register" target="_blank" rel="noopener"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-[#1A1A2E] px-8 py-4 text-[15px] font-bold text-white transition-all hover:bg-[#2D2D44] hover:shadow-[0_8px_30px_rgba(26,26,46,0.15)] hover:gap-3.5"
              >
                Open an Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-[#E2E8F0] bg-white px-8 py-4 text-[15px] font-bold text-[#1A1A2E] transition-all hover:border-[#00C853]/30 hover:shadow-[0_4px_20px_rgba(0,200,83,0.08)]"
              >
                Explore Services
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16 flex items-center gap-10"
            >
              {[
                { value: "8+", label: "Regions" },
                { value: "100+", label: "Agent Points" },
                { value: "24/7", label: "Digital Access" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-3">
                  {i > 0 && <div className="h-8 w-px bg-[#E2E8F0]" />}
                  <div className={i > 0 ? "pl-3" : ""}>
                    <p className="text-[22px] font-extrabold text-[#1A1A2E]">{stat.value}</p>
                    <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-[4/5] max-w-[480px] mx-auto rounded-[32px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.1)]">
              <Image
                src="/images/hero-farming.jpg"
                alt="Tanzanian farmer empowered by cooperative banking"
                fill
                priority
                className="object-cover"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/50 via-transparent to-transparent" />

              {/* Bottom text on image */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-white/60 text-[11px] font-semibold uppercase tracking-widest mb-1">Since 2014</p>
                <p className="text-white text-[20px] font-extrabold leading-tight">Cooperative Bank<br />Tanzania Plc.</p>
              </div>
            </div>

            {/* Decorative border accent */}
            <div className="absolute -inset-3 rounded-[40px] border-2 border-[#00C853]/10 -z-10" />
            <div className="absolute -inset-6 rounded-[48px] border border-[#00C853]/5 -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
