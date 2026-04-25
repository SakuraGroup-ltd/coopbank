"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

const rates = [
  { currency: "USD/TZS", flag: "🇺🇸", buy: 2635.00, sell: 2655.00, trend: "up" },
  { currency: "GBP/TZS", flag: "🇬🇧", buy: 3345.00, sell: 3378.00, trend: "down" },
  { currency: "EUR/TZS", flag: "🇪🇺", buy: 2872.50, sell: 2898.00, trend: "up" },
];

function fmt(n: number) {
  return n.toLocaleString("en", { minimumFractionDigits: n < 10 ? 2 : 0, maximumFractionDigits: 2 });
}

function TickerItem({ r }: { r: typeof rates[0] }) {
  return (
    <div className="flex items-center gap-4 px-6 shrink-0">
      <span className="text-lg">{r.flag}</span>
      <span className="text-sm font-bold text-[#1A56A0]">{r.currency}</span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold text-[#00C853] uppercase">Buy</span>
          <span className="text-sm font-bold text-[#1A56A0]">{fmt(r.buy)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">Sell</span>
          <span className="text-sm font-bold text-gray-500">{fmt(r.sell)}</span>
        </div>
        {r.trend === "up" ? (
          <TrendingUp size={14} className="text-[#00C853]" />
        ) : (
          <TrendingDown size={14} className="text-[#FF5252]" />
        )}
      </div>
      <div className="h-4 w-px bg-gray-200" />
    </div>
  );
}

export default function ForexTicker() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-[#f4f6f9] overflow-hidden">
      {/* Marquee ticker */}
      <div className="relative mx-auto max-w-[1200px] px-6 sm:px-12 py-4 overflow-hidden rounded-xl">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#f4f6f9] to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#f4f6f9] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {/* First set */}
          <div className="flex shrink-0">
            {rates.map((r, i) => <TickerItem key={`a-${i}`} r={r} />)}
          </div>
          {/* Duplicate for seamless loop */}
          <div className="flex shrink-0">
            {rates.map((r, i) => <TickerItem key={`b-${i}`} r={r} />)}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
}
