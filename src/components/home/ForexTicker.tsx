"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
// Local shape so the ticker is independent of @/lib/sheets. Matches what
// app/(main)/page.tsx passes in after reading from Payload.
export type ForexRate = {
  currency_code: string;
  currency_name: string;
  flag_emoji: string;
  buy_rate: string;
  sell_rate: string;
  trend: string;
  updated_date: string;
  active: string;
};

function fmt(n: number) {
  return n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TickerItem({ r }: { r: ForexRate }) {
  const buy  = parseFloat(r.buy_rate)  || 0;
  const sell = parseFloat(r.sell_rate) || 0;
  const trend = r.trend?.toLowerCase();
  return (
    <div className="flex items-center gap-4 px-6 shrink-0">
      <span className="text-lg">{r.flag_emoji}</span>
      <span className="text-sm font-bold text-[#1A56A0]">{r.currency_code}/TZS</span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold text-[#00C853] uppercase">Buy</span>
          <span className="text-sm font-bold text-[#1A56A0]">{fmt(buy)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">Sell</span>
          <span className="text-sm font-bold text-gray-500">{fmt(sell)}</span>
        </div>
        {trend === "up"   ? <TrendingUp  size={14} className="text-[#00C853]" /> :
         trend === "down" ? <TrendingDown size={14} className="text-[#FF5252]" /> :
                            <Minus        size={14} className="text-gray-400"  />}
      </div>
      <div className="h-4 w-px bg-gray-200" />
    </div>
  );
}

// Fallback rates shown when sheet is unavailable
const FALLBACK: ForexRate[] = [
  { currency_code: "USD", currency_name: "US Dollar",      flag_emoji: "🇺🇸", buy_rate: "2635", sell_rate: "2655", trend: "up",      updated_date: "", active: "TRUE" },
  { currency_code: "GBP", currency_name: "British Pound",  flag_emoji: "🇬🇧", buy_rate: "3345", sell_rate: "3378", trend: "down",    updated_date: "", active: "TRUE" },
  { currency_code: "EUR", currency_name: "Euro",            flag_emoji: "🇪🇺", buy_rate: "2872", sell_rate: "2898", trend: "up",      updated_date: "", active: "TRUE" },
];

export default function ForexTicker({ rates }: { rates: ForexRate[] }) {
  const display = rates.length > 0 ? rates : FALLBACK;

  return (
    <section className="bg-[#f4f6f9] overflow-hidden">
      <div className="relative mx-auto max-w-[1200px] px-6 sm:px-12 py-4 overflow-hidden rounded-xl">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#f4f6f9] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#f4f6f9] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          <div className="flex shrink-0">
            {display.map((r, i) => <TickerItem key={`a-${i}`} r={r} />)}
          </div>
          <div className="flex shrink-0">
            {display.map((r, i) => <TickerItem key={`b-${i}`} r={r} />)}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 40s linear infinite; }
      `}</style>
    </section>
  );
}
