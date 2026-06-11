"use client";

// Public-facing FX rate shape. Names mirror the legacy Sheet columns so the
// rest of this file barely changes. Now fed from Payload via /studio/forex.
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
import { TreasuryHero } from "@/components/treasury/TreasuryHero";
import { FadeInSection } from "@/components/treasury/TreasuryFadeIn";
import { BenefitsList } from "@/components/treasury/BenefitsList";
import { TreasuryDeskContact } from "@/components/treasury/TreasuryDeskContact";
import { OtherTreasuryServices } from "@/components/treasury/OtherTreasuryServices";
import { TrendingUp, TrendingDown, MinusIcon, Clock, ShieldCheck, Globe2 } from "lucide-react";

const FORWARD_BENEFITS = [
  "Protects against adverse exchange rate fluctuations by locking in a rate in advance",
  "Enhances financial planning and budgeting through predictable future cash flows",
  "Supports better management of import, export and other foreign currency obligations",
  "Flexible delivery dates tailored to specific customer business requirements",
  "Provides greater certainty in managing international trade and investment transactions",
];

const SWAP_BENEFITS = [
  "Enhances liquidity management with flexibility across short-term and long-term funding",
  "Assists customers in managing foreign currency exposures effectively",
  "Helps hedge portfolios against interest rate and exchange rate risks",
  "Supports efficient utilization of cash flows across different currencies",
  "Flexible tenors and settlement structures tailored to customer business needs",
];

function TrendIndicator({ trend }: { trend: string }) {
  if (trend === "up")
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
        <TrendingUp size={14} />
        Up
      </span>
    );
  if (trend === "down")
    return (
      <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold">
        <TrendingDown size={14} />
        Down
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-semibold">
      <MinusIcon size={14} />
      Flat
    </span>
  );
}

export default function ForeignExchangeClient({ rates }: { rates: ForexRate[] }) {
  const updatedDate = rates[0]?.updated_date ?? "—";

  return (
    <>
      <TreasuryHero
        crumb="Foreign Exchange"
        badge="Treasury — Foreign Exchange"
        title="Competitive FX, with no surprises"
        subtitle="Spot, Forwards and Swaps for retail, corporate and cooperative customers — plus daily exchange rates updated by our Treasury Desk."
      />

      {/* ============================================================ */}
      {/*  SPOT FX                                                     */}
      {/* ============================================================ */}
      <section id="spot-fx" className="bg-white py-20 sm:py-24 lg:py-28 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeInSection>
              <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#1A8A3A] mb-3">
                Spot Foreign Exchange
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-5 leading-tight">
                Buy and sell major currencies at competitive rates
              </h2>
              <p className="text-[#4A5568] text-base leading-relaxed mb-6">
                CoopBank Tanzania provides efficient and competitive Spot Foreign Exchange
                services for cooperative, retail and corporate customers. We buy and sell
                major international currencies at competitive market rates with{" "}
                <strong className="text-[#1A56A0]">no commission charges</strong>.
              </p>
              <p className="text-[#4A5568] text-base leading-relaxed">
                With our growing branch network across the country, we also facilitate
                cash foreign exchange transactions for walk-in customers (non-account
                holders) conveniently and at{" "}
                <strong className="text-[#1A56A0]">zero additional cost</strong> at any of
                our branches nationwide.
              </p>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f4f6f9] rounded-2xl p-6">
                  <ShieldCheck className="text-[#1A8A3A] mb-3" size={24} />
                  <p className="text-sm font-bold text-[#1A56A0] mb-1">No commission</p>
                  <p className="text-xs text-[#4A5568] leading-relaxed">
                    Transparent pricing, only the published spread.
                  </p>
                </div>
                <div className="bg-[#f4f6f9] rounded-2xl p-6">
                  <Globe2 className="text-[#1A8A3A] mb-3" size={24} />
                  <p className="text-sm font-bold text-[#1A56A0] mb-1">Major currencies</p>
                  <p className="text-xs text-[#4A5568] leading-relaxed">
                    USD, EUR, GBP, ZAR, KES and more.
                  </p>
                </div>
                <div className="bg-[#f4f6f9] rounded-2xl p-6">
                  <Clock className="text-[#1A8A3A] mb-3" size={24} />
                  <p className="text-sm font-bold text-[#1A56A0] mb-1">Walk-in cash FX</p>
                  <p className="text-xs text-[#4A5568] leading-relaxed">
                    Non-account holders served at any branch.
                  </p>
                </div>
                <div className="bg-[#f4f6f9] rounded-2xl p-6">
                  <ShieldCheck className="text-[#1A8A3A] mb-3" size={24} />
                  <p className="text-sm font-bold text-[#1A56A0] mb-1">Nationwide branches</p>
                  <p className="text-xs text-[#4A5568] leading-relaxed">
                    Same competitive rate at every branch.
                  </p>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DAILY RATES                                                 */}
      {/* ============================================================ */}
      <section id="rates" className="bg-[#f4f6f9] py-20 sm:py-24 lg:py-28 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <FadeInSection className="mb-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#1A8A3A] mb-3">
                  Daily Exchange Rates
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] leading-tight">
                  Today&apos;s rates against TZS
                </h2>
              </div>
              <p className="text-sm text-[#4A5568]">
                Updated <strong className="text-[#1A56A0]">{updatedDate}</strong> by our
                Treasury Desk. Rates are indicative; final pricing confirmed at execution.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {rates.length === 0 ? (
                <div className="px-6 py-16 text-center text-gray-400 text-sm">
                  Live rates are temporarily unavailable. Please contact our Treasury Desk
                  below for current pricing.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F0F4FA] border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Currency
                        </th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Buy (TZS)
                        </th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Sell (TZS)
                        </th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rates.map((r) => (
                        <tr key={r.currency_code} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{r.flag_emoji}</span>
                              <div>
                                <p className="font-bold text-sm text-[#1A1A2E]">{r.currency_code}</p>
                                <p className="text-xs text-gray-500">{r.currency_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-mono font-semibold text-sm text-[#1A1A2E]">
                              {Number(r.buy_rate).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-mono text-sm text-[#1A1A2E]">
                              {Number(r.sell_rate).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <TrendIndicator trend={r.trend} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FORWARD FX                                                  */}
      {/* ============================================================ */}
      <section id="forward-fx" className="bg-white py-20 sm:py-24 lg:py-28 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <FadeInSection className="mb-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-3xl">
                <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#1A8A3A] mb-3">
                  Foreign Currencies Forward Contracts
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-5 leading-tight">
                  Lock in tomorrow&apos;s rate today
                </h2>
                <p className="text-[#4A5568] text-base leading-relaxed mb-3">
                  Forward Foreign Exchange Contracts enable customers to buy or sell one
                  currency against another at a future date — beyond two business days from
                  the transaction date — at a pre-agreed exchange rate.
                </p>
                <p className="text-[#4A5568] text-base leading-relaxed">
                  Our Treasury team offers flexible forward FX solutions with contract
                  tenors of up to 12 months, helping customers manage foreign exchange
                  exposure and market volatility.
                </p>
              </div>
              <span className="inline-block bg-[#1A8A3A]/10 text-[#1A8A3A] text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap">
                Tenors up to 12 months
              </span>
            </div>
          </FadeInSection>

          <BenefitsList items={FORWARD_BENEFITS} />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FX SWAPS                                                    */}
      {/* ============================================================ */}
      <section id="fx-swaps" className="bg-[#f4f6f9] py-20 sm:py-24 lg:py-28 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <FadeInSection className="mb-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-3xl">
                <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#1A8A3A] mb-3">
                  Foreign Exchange Swaps
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-5 leading-tight">
                  Flexible currency exchange with a return leg
                </h2>
                <p className="text-[#4A5568] text-base leading-relaxed mb-3">
                  FX Swaps allow customers to exchange one currency for another at an
                  agreed rate on a specified value date, with an agreement to reverse the
                  transaction at a future date using a pre-determined rate.
                </p>
                <p className="text-[#4A5568] text-base leading-relaxed">
                  Our Treasury team offers flexible FX Swap solutions for periods of up to
                  12 months, enabling corporate customers to manage liquidity and optimize
                  foreign currency cash flows efficiently.
                </p>
              </div>
              <span className="inline-block bg-[#1A8A3A]/10 text-[#1A8A3A] text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap">
                Tenors up to 12 months
              </span>
            </div>
          </FadeInSection>

          <BenefitsList items={SWAP_BENEFITS} />
        </div>
      </section>

      <OtherTreasuryServices current="foreign-exchange" />
      <TreasuryDeskContact />
    </>
  );
}
