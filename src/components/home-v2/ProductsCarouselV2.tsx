"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, ArrowRight } from "lucide-react";

interface Product {
  name: string;
  category: string;
  features: string[];
  href: string;
}

const products: Product[] = [
  {
    name: "Mama Africa Account",
    category: "Savings",
    features: ["Zero minimum balance", "Free mobile banking access", "Tailored for women entrepreneurs"],
    href: "/personal-banking#mama-africa",
  },
  {
    name: "Kilimo Tija Account",
    category: "Agriculture",
    features: ["Seasonal deposit flexibility", "Agricultural advisory support", "Low-interest farming inputs"],
    href: "/personal-banking#kilimo-tija",
  },
  {
    name: "CoopEsa Mobile App",
    category: "Digital",
    features: ["Instant transfers & payments", "Bill payments & airtime top-up", "Real-time account notifications"],
    href: "/digital-banking#coopesa",
  },
  {
    name: "Agri-Business Loans",
    category: "Loans",
    features: ["Competitive interest rates", "Flexible repayment schedules", "Up to TZS 500M financing"],
    href: "/loan-products#agri-business",
  },
  {
    name: "Fixed Deposit",
    category: "Investment",
    features: ["High returns on deposits", "Flexible tenure from 3 months", "Capital protection guaranteed"],
    href: "/personal-banking#fixed-deposit",
  },
  {
    name: "Digital Loans",
    category: "Loans",
    features: ["Instant approval via mobile", "No collateral required", "Borrow up to TZS 5M"],
    href: "/loan-products#digital",
  },
];

const categoryConfig: Record<string, { bg: string; text: string; accent: string }> = {
  Savings: { bg: "bg-[#00C853]/8", text: "text-[#00C853]", accent: "#00C853" },
  Agriculture: { bg: "bg-[#00BCD4]/8", text: "text-[#00BCD4]", accent: "#00BCD4" },
  Digital: { bg: "bg-[#7C4DFF]/8", text: "text-[#7C4DFF]", accent: "#7C4DFF" },
  Loans: { bg: "bg-[#FF6D00]/8", text: "text-[#FF6D00]", accent: "#FF6D00" },
  Investment: { bg: "bg-[#1A1A2E]/5", text: "text-[#1A1A2E]", accent: "#1A1A2E" },
};

export default function ProductsCarouselV2() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === "left" ? -340 : 340, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="bg-gradient-to-b from-white to-[#FAFBFD] py-24 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <h2 className="text-[36px] font-extrabold text-[#1A1A2E] sm:text-[42px]">
              Featured Products
            </h2>
            <p className="mt-3 text-[16px] text-[#94A3B8]">
              Discover products designed for your financial goals
            </p>
          </div>

          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition-all hover:border-[#1A1A2E] hover:text-[#1A1A2E] hover:shadow-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition-all hover:border-[#1A1A2E] hover:text-[#1A1A2E] hover:shadow-md"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        <div
          ref={scrollRef}
          className="no-scrollbar -mx-2 flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-4"
        >
          {products.map((product, i) => {
            const config = categoryConfig[product.category] ?? { bg: "bg-gray-100", text: "text-gray-600", accent: "#64748B" };
            return (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group w-[310px] flex-shrink-0 snap-start rounded-2xl border border-[#F1F5F9] bg-white p-7 transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-transparent"
              >
                <span className={`inline-block rounded-full px-3.5 py-1.5 text-[11px] font-bold ${config.bg} ${config.text}`}>
                  {product.category}
                </span>

                <h3 className="mt-5 text-[18px] font-extrabold text-[#1A1A2E]">
                  {product.name}
                </h3>

                <ul className="mt-5 space-y-3">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <div className="mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${config.accent}10` }}>
                        <Check className="h-3 w-3" style={{ color: config.accent }} />
                      </div>
                      <span className="text-[14px] leading-snug text-[#64748B]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={product.href}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#F8FAFC] px-5 py-2.5 text-[13px] font-bold text-[#1A1A2E] transition-all group-hover:bg-[#1A1A2E] group-hover:text-white"
                >
                  Learn More
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
