"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { iconOf } from "@/components/blocks/icon-map";
import { safeHref, safeImg } from "@/lib/safe-href";
import { defaultAppPromo, type AppPromoContent } from "./home-defaults";

export default function MobileBanking(props: Partial<AppPromoContent> = {}) {
  const c: AppPromoContent = { ...defaultAppPromo, ...props };
  if (!c.features?.length) c.features = defaultAppPromo.features;

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative overflow-hidden py-10 lg:py-14">
      {/* Pattern image as base layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: "1200px", backgroundRepeat: "repeat" }}
      />
      {/* Blue overlay at 95% opacity on top */}
      <div className="absolute inset-0 bg-[#1A56A0]/[0.99] pointer-events-none" />
      {/* Background accents */}
      <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-[#1A8A3A]/8 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#00C853]/5 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-[1200px] px-6 sm:px-12">
        <div className="lg:flex lg:items-center lg:gap-16">

          {/* Left — Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-8 lg:mb-0 lg:flex-1"
          >
            <span className="inline-block rounded-full bg-[#00C853]/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#00C853] mb-5">
              {c.badge}
            </span>
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
              {c.heading}
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/60">
              {c.copy}
            </p>

            {/* Features grid */}
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-4">
              {c.features.map((f, i) => {
                const Icon = iconOf(f.icon);
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                    className="flex items-start gap-2 sm:gap-3"
                  >
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-[#00C853]/15">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#00C853]" />
                    </div>
                    <div>
                      <h3 className="text-[12px] sm:text-[13px] font-bold text-white">{f.title}</h3>
                      <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5 leading-relaxed hidden sm:block">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Download buttons + USSD inline */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={safeHref(c.appStoreUrl) || defaultAppPromo.appStoreUrl} target="_blank" rel="noopener"
                className="inline-flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 px-5 py-3 transition-all hover:bg-white/15"
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
                href={safeHref(c.playStoreUrl) || defaultAppPromo.playStoreUrl} target="_blank" rel="noopener"
                className="inline-flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 px-5 py-3 transition-all hover:bg-white/15"
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

              {/* USSD divider + code */}
              <div className="h-10 w-px bg-white/15 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[9px] text-white/50 leading-none uppercase">USSD</span>
                <span className="text-[20px] font-black text-white leading-tight tracking-tight" style={{ fontFamily: "'Gilroy', 'Inter', sans-serif" }}>{c.ussdCode}</span>
              </div>
            </div>
          </motion.div>

          {/* Right — Phone mockup */}
          <div className="lg:flex-1 flex flex-col items-center">
            {/* CoopPesa mockup image */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mb-6 lg:mb-10"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src={safeImg(c.mockupImage) || defaultAppPromo.mockupImage}
                  alt="CoopPesa Mobile Banking App"
                  width={300}
                  height={600}
                  className="relative z-10 drop-shadow-2xl max-h-[350px] lg:max-h-none w-auto"
                  priority
                />
              </motion.div>
              {/* Glow effect behind phone */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] lg:w-[400px] lg:h-[400px] bg-[#00C853]/8 blur-[80px] rounded-full pointer-events-none" />
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
