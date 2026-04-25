"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

interface ForexRate {
  currency: string;
  flag: string;
  name: string;
  buy: number;
  sell: number;
  trend: "up" | "down";
}

const rates: ForexRate[] = [
  { currency: "USD", flag: "🇺🇸", name: "US Dollar", buy: 2635.00, sell: 2655.00, trend: "up" },
  { currency: "EUR", flag: "🇪🇺", name: "Euro", buy: 2872.50, sell: 2898.00, trend: "up" },
  { currency: "GBP", flag: "🇬🇧", name: "British Pound", buy: 3345.00, sell: 3378.00, trend: "down" },
];

export default function ForexTickerV2() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollContainer.current;
    if (!el) return;
    let animationId: number;
    let paused = false;
    const speed = 0.4;

    const step = () => {
      if (!paused && el) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      }
      animationId = requestAnimationFrame(step);
    };
    animationId = requestAnimationFrame(step);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause);
    el.addEventListener("touchend", resume);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollContainer.current) return;
    scrollContainer.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const displayRates = [...rates, ...rates];
  const fmt = (v: number) => v.toLocaleString("en", { minimumFractionDigits: v < 10 ? 2 : 0, maximumFractionDigits: 2 });

  return (
    <section ref={ref} className="relative bg-[#FAFBFD] py-20 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#00C853] mb-2">
              Foreign Exchange
            </p>
            <h2 className="text-3xl font-extrabold text-[#1A1A2E] sm:text-4xl">
              Today&apos;s exchange rates
            </h2>
          </div>
          <Link
            href="#"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#1A1A2E] transition-all hover:border-[#00C853]/30 hover:shadow-md"
          >
            View all rates
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        <div className="relative">
          {/* Edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#FAFBFD] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#FAFBFD] to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollContainer}
            className="flex gap-4 overflow-x-auto no-scrollbar px-2 py-2"
            style={{ scrollBehavior: "auto" }}
          >
            {displayRates.map((rate, i) => {
              const TrendIcon = rate.trend === "up" ? TrendingUp : TrendingDown;
              return (
                <motion.div
                  key={`${rate.currency}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: Math.min(i, 11) * 0.04 }}
                  className="shrink-0 w-[160px] rounded-2xl border border-[#F1F5F9] bg-white p-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[28px] leading-none">{rate.flag}</span>
                    <TrendIcon
                      className={`h-4 w-4 ${rate.trend === "up" ? "text-[#00C853]" : "text-[#EF4444]"}`}
                    />
                  </div>
                  <p className="text-[15px] font-extrabold text-[#1A1A2E]">{rate.currency}</p>
                  <p className="text-[10px] text-[#94A3B8] mb-3">{rate.name}</p>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#00C853] uppercase">Buy</span>
                      <span className="text-[13px] font-bold text-[#1A1A2E]">{fmt(rate.buy)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Sell</span>
                      <span className="text-[13px] font-bold text-[#64748B]">{fmt(rate.sell)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Scroll buttons */}
          <div className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="h-10 w-10 rounded-full border border-[#E2E8F0] bg-white shadow-sm flex items-center justify-center text-[#1A1A2E] hover:shadow-md hover:border-[#00C853]/30 transition-all"
              aria-label="Scroll left"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
          </div>
          <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
            <button
              type="button"
              onClick={() => scroll("right")}
              className="h-10 w-10 rounded-full border border-[#E2E8F0] bg-white shadow-sm flex items-center justify-center text-[#1A1A2E] hover:shadow-md hover:border-[#00C853]/30 transition-all"
              aria-label="Scroll right"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
