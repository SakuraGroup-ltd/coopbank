"use client";

import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import { TreasuryHero } from "@/components/treasury/TreasuryHero";
import { FadeInSection } from "@/components/treasury/TreasuryFadeIn";
import { BenefitsList } from "@/components/treasury/BenefitsList";
import { TreasuryDeskContact } from "@/components/treasury/TreasuryDeskContact";
import { OtherTreasuryServices } from "@/components/treasury/OtherTreasuryServices";

const FD_BENEFITS = [
  "Competitive interest rates on every tenor",
  "Flexible investment periods to match your goals",
  "Secure and reliable investment option",
  "Choice of periodic or maturity interest payments",
  "Suitable for both individual and corporate customers",
];

const CURRENCIES = [
  { code: "TZS", flag: "🇹🇿", name: "Tanzanian Shilling" },
  { code: "USD", flag: "🇺🇸", name: "US Dollar" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound" },
];

export default function FixedDepositsPage() {
  return (
    <>
      <TreasuryHero
        crumb="Fixed Deposits"
        badge="Treasury — Fixed Deposits"
        title="Grow your savings with guaranteed returns"
        subtitle="Lock in a competitive interest rate for a tenor that suits you, with capital protection and flexible interest-payment options."
      />

      {/* ============================================================ */}
      {/*  LEAD + CURRENCY CHIPS                                       */}
      {/* ============================================================ */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeInSection>
              <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#1A8A3A] mb-3">
                Fixed Deposit Account
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-5 leading-tight">
                Secure returns while preserving capital
              </h2>
              <p className="text-[#4A5568] text-base leading-relaxed mb-5">
                A Fixed Deposit Account is an investment product that allows clients to
                place funds with CoopBank for a specified period at a{" "}
                <strong className="text-[#1A56A0]">guaranteed interest rate</strong>. It is
                an ideal solution for individuals and businesses seeking secure returns
                while preserving capital.
              </p>
              <p className="text-[#4A5568] text-base leading-relaxed">
                Customers can choose to receive interest payments periodically or upon
                maturity, depending on their investment preferences and cash flow needs.
              </p>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <div className="bg-[#f4f6f9] rounded-3xl p-8 sm:p-10">
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#1A8A3A] mb-5">
                  Available Currencies
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {CURRENCIES.map((c) => (
                    <div
                      key={c.code}
                      className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100"
                    >
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <p className="font-bold text-sm text-[#1A56A0]">{c.code}</p>
                        <p className="text-[10px] text-gray-500">{c.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  Open a Fixed Deposit in any of the major currencies above. Speak to our
                  Treasury Desk for tailored quotes by tenor and amount.
                </p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BENEFITS                                                    */}
      {/* ============================================================ */}
      <section className="bg-[#f4f6f9] py-20 sm:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <FadeInSection className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-3 leading-tight">
              Why a CoopBank Fixed Deposit
            </h2>
            <p className="text-[#4A5568] text-base leading-relaxed max-w-2xl">
              Five reasons our customers choose us for fixed-tenor savings.
            </p>
          </FadeInSection>

          <BenefitsList items={FD_BENEFITS} />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                         */}
      {/* ============================================================ */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <FadeInSection>
            <div className="bg-[#1A56A0] rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: "url('/images/pattern-bg.jpg')",
                  backgroundSize: "800px",
                }}
              />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                  Ready to open a Fixed Deposit?
                </h2>
                <p className="text-white/70 text-base leading-relaxed mb-8 max-w-xl mx-auto">
                  Visit any CoopBank Tanzania branch for personalised assistance, or call
                  our customer service line.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href="tel:+255272754470"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1A8A3A] hover:bg-[#14692D] text-white font-semibold text-sm transition-colors"
                  >
                    <Phone size={16} />
                    +255 27 275 4470
                  </a>
                  <Link
                    href="/branches"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors border border-white/20"
                  >
                    Find a branch
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <OtherTreasuryServices current="fixed-deposits" />
      <TreasuryDeskContact />
    </>
  );
}
