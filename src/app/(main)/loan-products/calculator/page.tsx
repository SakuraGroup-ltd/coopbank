"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Calculator, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  TYPES & DATA                                                       */
/* ------------------------------------------------------------------ */

interface LoanProductData {
  name: string;
  rate: number;
  minAmount: number;
  maxAmount: number;
  maxTenure: number;
}

const loanProducts: LoanProductData[] = [
  { name: "Agri-Business Loans", rate: 12, minAmount: 100000, maxAmount: 50000000, maxTenure: 36 },
  { name: "Asset Financing", rate: 18, minAmount: 200000, maxAmount: 100000000, maxTenure: 36 },
  { name: "MSE Loans", rate: 18, minAmount: 50000, maxAmount: 5000000, maxTenure: 12 },
  { name: "SME Loans", rate: 18, minAmount: 5000000, maxAmount: 200000000, maxTenure: 60 },
  { name: "Bunge Loans", rate: 18, minAmount: 100000, maxAmount: 10000000, maxTenure: 12 },
  { name: "Salaried Loans", rate: 18, minAmount: 500000, maxAmount: 50000000, maxTenure: 60 },
  { name: "Bajaji Loans", rate: 18, minAmount: 2000000, maxAmount: 15000000, maxTenure: 36 },
  { name: "Investment Account Loans", rate: 10, minAmount: 100000, maxAmount: 100000000, maxTenure: 12 },
  { name: "Digital Loans", rate: 108, minAmount: 50000, maxAmount: 5000000, maxTenure: 1 },
  { name: "Business Loans", rate: 16, minAmount: 100000000, maxAmount: 500000000, maxTenure: 84 },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function formatTSH(value: number): string {
  return new Intl.NumberFormat("en-TZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function formatTSHDecimal(value: number): string {
  return new Intl.NumberFormat("en-TZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

interface AmortizationRow {
  month: number;
  openingBalance: number;
  emi: number;
  principal: number;
  interest: number;
  closingBalance: number;
}

function calculateEMI(principal: number, annualRate: number, months: number): number {
  if (months <= 0 || principal <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

function buildAmortization(
  principal: number,
  annualRate: number,
  months: number
): AmortizationRow[] {
  const emi = calculateEMI(principal, annualRate, months);
  if (emi <= 0) return [];
  const r = annualRate / 12 / 100;
  const rows: AmortizationRow[] = [];
  let balance = principal;

  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    const principalPart = emi - interest;
    const closing = Math.max(balance - principalPart, 0);
    rows.push({
      month: m,
      openingBalance: balance,
      emi,
      principal: principalPart,
      interest,
      closingBalance: closing,
    });
    balance = closing;
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/*  ANIMATED SECTION WRAPPER                                           */
/* ------------------------------------------------------------------ */

function FadeInSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  DONUT CHART (CSS only)                                             */
/* ------------------------------------------------------------------ */

function DonutChart({
  principal,
  interest,
}: {
  principal: number;
  interest: number;
}) {
  const total = principal + interest;
  if (total === 0) return null;
  const principalPct = (principal / total) * 100;
  const interestPct = (interest / total) * 100;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-44 h-44">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `conic-gradient(
              #1A8A3A 0% ${principalPct}%,
              #1A56A0 ${principalPct}% 100%
            )`,
          }}
        />
        {/* inner white circle to make donut */}
        <div className="absolute inset-0 m-auto w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-xs text-[#4A5568] font-medium">Total</span>
          <span className="text-sm font-bold text-[#1A56A0]">
            {formatTSH(total)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#1A8A3A]" />
          <span className="text-[#4A5568]">
            Principal ({principalPct.toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#1A56A0]" />
          <span className="text-[#4A5568]">
            Interest ({interestPct.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export default function LoanCalculatorPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [amount, setAmount] = useState(loanProducts[0].minAmount);
  const [rate, setRate] = useState(loanProducts[0].rate);
  const [tenure, setTenure] = useState(Math.min(12, loanProducts[0].maxTenure));
  const [showSchedule, setShowSchedule] = useState(false);

  const product = loanProducts[selectedIndex];

  // When product changes, reset inputs to product defaults
  useEffect(() => {
    const p = loanProducts[selectedIndex];
    setAmount(p.minAmount);
    setRate(p.rate);
    setTenure(Math.min(12, p.maxTenure));
    setShowSchedule(false);
  }, [selectedIndex]);

  // Calculations
  const emi = useMemo(() => calculateEMI(amount, rate, tenure), [amount, rate, tenure]);
  const totalRepayment = emi * tenure;
  const totalInterest = totalRepayment - amount;
  const effectiveMonthlyRate = rate / 12;

  const amortization = useMemo(
    () => buildAmortization(amount, rate, tenure),
    [amount, rate, tenure]
  );

  // Input style
  const inputClass =
    "w-full px-4 py-3 bg-[#f4f6f9] border border-gray-200 rounded-xl text-sm focus:border-[#1A8A3A] focus:outline-none transition-colors duration-200";

  return (
    <>
      {/* ============================================================ */}
      {/*  HERO BANNER                                                 */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20">
        {/* Pattern background */}
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
            <Link
              href="/"
              className="hover:text-white transition-colors font-medium"
            >
              Home
            </Link>
            <ChevronRight size={14} className="text-white/30" />
            <Link
              href="/loan-products"
              className="hover:text-white transition-colors font-medium"
            >
              Loan Products
            </Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white font-semibold">Calculator</span>
          </motion.nav>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
              + Loan Calculator
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center"
          >
            Calculate Your Loan
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-center"
          >
            Get an instant estimate of your monthly repayments. All calculations
            use the reducing balance method.
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CALCULATOR BODY                                             */}
      {/* ============================================================ */}
      <section className="bg-[#f4f6f9] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <FadeInSection>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* ---------------------------------------------------- */}
              {/*  LEFT: INPUTS (3 cols)                                */}
              {/* ---------------------------------------------------- */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[#1A8A3A]/10 flex items-center justify-center">
                    <Calculator size={20} className="text-[#1A8A3A]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1A56A0]">
                    Loan Parameters
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Product selector */}
                  <div>
                    <label className="block text-sm font-semibold text-[#1A56A0] mb-2">
                      Loan Product
                    </label>
                    <select
                      value={selectedIndex}
                      onChange={(e) => setSelectedIndex(Number(e.target.value))}
                      className={inputClass}
                    >
                      {loanProducts.map((p, i) => (
                        <option key={p.name} value={i}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-[#4A5568]">
                      Rate: {product.rate}% p.a. -- Range: TSH{" "}
                      {formatTSH(product.minAmount)} to TSH{" "}
                      {formatTSH(product.maxAmount)} -- Max tenure:{" "}
                      {product.maxTenure} months
                    </p>
                  </div>

                  {/* Loan amount */}
                  <div>
                    <label className="block text-sm font-semibold text-[#1A56A0] mb-2">
                      Loan Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#4A5568]">
                        TSH
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatTSH(amount)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, "");
                          const num = Number(raw);
                          if (!isNaN(num)) {
                            setAmount(
                              Math.min(
                                Math.max(num, 0),
                                product.maxAmount
                              )
                            );
                          }
                        }}
                        className={`${inputClass} pl-14`}
                      />
                    </div>
                    <input
                      type="range"
                      min={product.minAmount}
                      max={product.maxAmount}
                      step={product.minAmount < 1000000 ? 10000 : 100000}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full mt-3 accent-[#1A8A3A] h-2 rounded-full cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-[#4A5568] mt-1">
                      <span>TSH {formatTSH(product.minAmount)}</span>
                      <span>TSH {formatTSH(product.maxAmount)}</span>
                    </div>
                  </div>

                  {/* Interest rate */}
                  <div>
                    <label className="block text-sm font-semibold text-[#1A56A0] mb-2">
                      Interest Rate (% per annum)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={200}
                        step={0.5}
                        value={rate}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!isNaN(v) && v >= 0) setRate(v);
                        }}
                        className={`${inputClass} pr-10`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#4A5568]">
                        %
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-[#4A5568]">
                      Pre-filled from product. You may adjust to compare
                      scenarios.
                    </p>
                  </div>

                  {/* Tenure */}
                  <div>
                    <label className="block text-sm font-semibold text-[#1A56A0] mb-2">
                      Loan Tenure (Months)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={product.maxTenure}
                      value={tenure}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= 1)
                          setTenure(Math.min(v, product.maxTenure));
                      }}
                      className={inputClass}
                    />
                    <input
                      type="range"
                      min={1}
                      max={product.maxTenure}
                      value={tenure}
                      onChange={(e) => setTenure(Number(e.target.value))}
                      className="w-full mt-3 accent-[#1A8A3A] h-2 rounded-full cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-[#4A5568] mt-1">
                      <span>1 month</span>
                      <span>{product.maxTenure} months</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/*  RIGHT: RESULTS (2 cols)                              */}
              {/* ---------------------------------------------------- */}
              <div className="lg:col-span-2 space-y-6">
                {/* Monthly repayment highlight */}
                <div className="bg-[#f0faf3] rounded-2xl border border-[#1A8A3A]/10 p-6 sm:p-8 text-center">
                  <p className="text-sm font-semibold text-[#4A5568] mb-2">
                    Monthly Repayment (EMI)
                  </p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#1A8A3A] mb-1">
                    TSH {formatTSHDecimal(emi)}
                  </p>
                  <p className="text-xs text-[#4A5568]">
                    Reducing balance method
                  </p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-1">
                      Total Repayment
                    </p>
                    <p className="text-lg font-bold text-[#1A56A0]">
                      TSH {formatTSHDecimal(totalRepayment)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-1">
                      Total Interest
                    </p>
                    <p className="text-lg font-bold text-[#1A56A0]">
                      TSH {formatTSHDecimal(totalInterest)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:col-span-2 lg:col-span-1">
                    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide mb-1">
                      Effective Monthly Rate
                    </p>
                    <p className="text-lg font-bold text-[#1A56A0]">
                      {effectiveMonthlyRate.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Donut chart */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <p className="text-sm font-semibold text-[#1A56A0] mb-4 text-center">
                    Principal vs Interest
                  </p>
                  <DonutChart principal={amount} interest={totalInterest} />
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* ============================================================ */}
          {/*  AMORTIZATION SCHEDULE                                       */}
          {/* ============================================================ */}
          <FadeInSection delay={0.1}>
            <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setShowSchedule((prev) => !prev)}
                className="w-full flex items-center justify-between px-6 sm:px-8 py-5 text-left focus:outline-none group"
              >
                <div className="flex items-center gap-3">
                  <Calculator size={18} className="text-[#1A8A3A]" />
                  <span className="text-base font-bold text-[#1A56A0]">
                    Amortization Schedule
                  </span>
                  <span className="text-xs text-[#4A5568] font-medium">
                    ({tenure} months)
                  </span>
                </div>
                <motion.span
                  animate={{ rotate: showSchedule ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[#1A56A0]/50 group-hover:text-[#1A8A3A] transition-colors"
                >
                  <ChevronDown size={20} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {showSchedule && (
                  <motion.div
                    key="schedule"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#1A56A0] text-white text-xs uppercase tracking-wider">
                            <th className="px-4 sm:px-6 py-3 text-left font-semibold">
                              Month
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-right font-semibold">
                              Opening Balance
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-right font-semibold">
                              EMI
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-right font-semibold">
                              Principal
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-right font-semibold">
                              Interest
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-right font-semibold">
                              Closing Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {amortization.map((row) => (
                            <tr
                              key={row.month}
                              className={`border-t border-gray-100 ${
                                row.month % 2 === 0
                                  ? "bg-[#f4f6f9]"
                                  : "bg-white"
                              }`}
                            >
                              <td className="px-4 sm:px-6 py-3 text-left font-medium text-[#1A56A0]">
                                {row.month}
                              </td>
                              <td className="px-4 sm:px-6 py-3 text-right text-[#4A5568]">
                                {formatTSH(row.openingBalance)}
                              </td>
                              <td className="px-4 sm:px-6 py-3 text-right font-semibold text-[#1A56A0]">
                                {formatTSH(row.emi)}
                              </td>
                              <td className="px-4 sm:px-6 py-3 text-right text-[#1A8A3A]">
                                {formatTSH(row.principal)}
                              </td>
                              <td className="px-4 sm:px-6 py-3 text-right text-[#4A5568]">
                                {formatTSH(row.interest)}
                              </td>
                              <td className="px-4 sm:px-6 py-3 text-right text-[#4A5568]">
                                {formatTSH(row.closingBalance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeInSection>

          {/* Disclaimer */}
          <FadeInSection delay={0.15}>
            <p className="mt-8 text-xs text-[#4A5568] text-center leading-relaxed max-w-3xl mx-auto">
              This calculator provides estimates for informational purposes only.
              Actual loan terms, interest rates, and repayment amounts may vary
              based on your credit profile and prevailing market conditions.
              Please visit your nearest CoopBank branch or contact us for a
              personalized quotation.
            </p>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
