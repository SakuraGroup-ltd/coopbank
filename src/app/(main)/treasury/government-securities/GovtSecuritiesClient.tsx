"use client";

import type { Auction } from "@/lib/sheets";
import { TreasuryHero } from "@/components/treasury/TreasuryHero";
import { FadeInSection } from "@/components/treasury/TreasuryFadeIn";
import { TreasuryDeskContact } from "@/components/treasury/TreasuryDeskContact";
import { OtherTreasuryServices } from "@/components/treasury/OtherTreasuryServices";
import { Check, Landmark, FileText } from "lucide-react";

const PARTICIPATE_REQS = [
  "A CoopBank Tanzania account",
  "Duly completed bidding form",
];

const CDS_REQS = [
  "Completed CDS account opening form",
  "Copy of TIN certificate",
  "Copy of valid identification document",
  "One passport-size photograph",
];

function StatusPill({ status }: { status: string }) {
  const norm = (status || "").toLowerCase();
  if (norm === "upcoming")
    return (
      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700">
        Upcoming
      </span>
    );
  if (norm === "open")
    return (
      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700">
        Open
      </span>
    );
  if (norm === "closed")
    return (
      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-200 text-gray-600">
        Closed
      </span>
    );
  if (norm === "settled")
    return (
      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-700">
        Settled
      </span>
    );
  return (
    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
      {status || "—"}
    </span>
  );
}

function RequirementsList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-[#f4f6f9] rounded-2xl p-7">
      <h3 className="text-base font-bold text-[#1A56A0] mb-5">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1A8A3A]/10 flex items-center justify-center mt-0.5">
              <Check size={12} className="text-[#1A8A3A]" />
            </span>
            <span className="text-[#4A5568] text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GovtSecuritiesClient({ auctions }: { auctions: Auction[] }) {
  return (
    <>
      <TreasuryHero
        crumb="Government Securities"
        badge="Treasury — Government Securities"
        title="Invest in T-Bills and T-Bonds"
        subtitle="Access Government Securities investment opportunities issued by the Bank of Tanzania, through CoopBank — a licensed Central Depository Participant."
      />

      {/* ============================================================ */}
      {/*  OVERVIEW                                                    */}
      {/* ============================================================ */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeInSection>
              <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#1A8A3A] mb-3">
                Primary &amp; Secondary Markets
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-5 leading-tight">
                Government-backed returns, accessibly priced
              </h2>
              <p className="text-[#4A5568] text-base leading-relaxed mb-5">
                At CoopBank Tanzania, we provide customers with access to Government
                Securities investment opportunities through Treasury Bills and Treasury
                Bonds issued by the Bank of Tanzania.
              </p>
              <p className="text-[#4A5568] text-base leading-relaxed">
                As a licensed{" "}
                <strong className="text-[#1A56A0]">
                  Central Depository Participant (CDP)
                </strong>
                , we assist both individual and corporate customers to participate in
                primary and secondary market investments conveniently and efficiently.
              </p>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#1A56A0] rounded-2xl p-7 text-white">
                  <Landmark className="text-[#00C853] mb-4" size={28} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00C853] mb-2">
                    Primary Market
                  </p>
                  <h3 className="text-xl font-bold mb-2">Participate in BOT auctions</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    We support customers in participating in Treasury Bills and Treasury
                    Bonds auctions conducted by the Bank of Tanzania.
                  </p>
                </div>
                <div className="bg-[#f4f6f9] rounded-2xl p-7">
                  <FileText className="text-[#1A8A3A] mb-4" size={28} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1A8A3A] mb-2">
                    Secondary Market
                  </p>
                  <h3 className="text-xl font-bold text-[#1A56A0] mb-2">
                    Buy and sell after issuance
                  </h3>
                  <p className="text-[#4A5568] text-sm leading-relaxed">
                    Access liquidity on existing T-Bills and T-Bonds through CoopBank&apos;s
                    Treasury Desk between auction dates.
                  </p>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  REQUIREMENTS                                                */}
      {/* ============================================================ */}
      <section className="bg-[#f4f6f9] py-20 sm:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <FadeInSection className="mb-10">
            <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#1A8A3A] mb-3">
              Requirements
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] leading-tight">
              What you&apos;ll need to get started
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeInSection delay={0.05}>
              <RequirementsList title="To Participate in Auctions" items={PARTICIPATE_REQS} />
            </FadeInSection>
            <FadeInSection delay={0.15}>
              <RequirementsList title="To Open a CDS Account" items={CDS_REQS} />
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  AUCTION CALENDAR                                            */}
      {/* ============================================================ */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <FadeInSection className="mb-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#1A8A3A] mb-3">
                  Q2 2025/26 Auction Calendar
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] leading-tight">
                  Government Securities auctions
                </h2>
              </div>
              <p className="text-sm text-[#4A5568] max-w-md">
                Source: Bank of Tanzania. Dates are indicative — confirm with the Treasury
                Desk before bidding.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {auctions.length === 0 ? (
                <div className="px-6 py-16 text-center text-gray-400 text-sm">
                  The auction calendar will be published shortly. Contact our Treasury Desk
                  for details.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F0F4FA] border-b border-gray-100">
                      <tr>
                        <th className="px-5 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Instrument
                        </th>
                        <th className="px-5 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Tenor
                        </th>
                        <th className="px-5 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Announcement
                        </th>
                        <th className="px-5 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Auction
                        </th>
                        <th className="px-5 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Value Date
                        </th>
                        <th className="px-5 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Maturity
                        </th>
                        <th className="px-5 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auctions.map((a, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-sm text-[#1A1A2E]">
                              {a.instrument}
                            </p>
                            {a.notes && (
                              <p className="text-[11px] text-gray-500 mt-0.5">{a.notes}</p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-[#1A56A0]">
                              {a.tenor}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-mono text-gray-600">
                              {a.announcement_date || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-mono font-semibold text-[#1A1A2E]">
                              {a.auction_date || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-mono text-gray-600">
                              {a.value_date || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-mono text-gray-600">
                              {a.maturity_date || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusPill status={a.status} />
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

      <OtherTreasuryServices current="government-securities" />
      <TreasuryDeskContact />
    </>
  );
}
