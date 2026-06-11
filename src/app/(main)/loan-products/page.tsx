"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Download,
  Calculator,
  Tractor,
  Car,
  Store,
  Building,
  Users,
  Wallet,
  Truck,
  PiggyBank,
  Smartphone,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  TYPES & DATA                                                       */
/* ------------------------------------------------------------------ */

interface LoanProduct {
  id: number;
  slug: string;
  name: string;
  tag: string;
  category: "personal" | "sme" | "agri";
  icon: typeof Tractor;
  longDesc: string;
  image: string;
  features: string[];
  requirements: string[];
  loanDetails: string[];
}

const categories = [
  { id: "all", label: "All Loans" },
  { id: "personal", label: "Personal" },
  { id: "sme", label: "SME & Business" },
  { id: "agri", label: "Agriculture" },
] as const;

const loanProducts: LoanProduct[] = [
  {
    id: 1,
    slug: "agri-business",
    name: "Agri-Business Loans",
    tag: "Agriculture",
    category: "agri" as const,
    icon: Tractor,
    longDesc:
      "Our Agri-Business Loans empower Tanzanian farmers and agribusinesses with the capital they need to grow. Whether you are financing seasonal crops, investing in irrigation systems, or purchasing farm equipment, this product offers flexible repayment aligned with harvest cycles. Group lending options allow farming cooperatives to access larger amounts collectively, while grace periods ensure you only start repaying when your yields come in.",
    image: "/images/products/kilimo-tija.jpg",
    features: [
      "Seasonal crop financing",
      "Equipment and irrigation",
      "Grace period available",
      "Group lending option",
    ],
    requirements: [
      "Valid ID",
      "Proof of agricultural activity",
      "Land ownership or lease agreement",
      "Business plan for commercial farming",
    ],
    loanDetails: [
      "Amount: TSH 100,000 to 50,000,000",
      "Tenure: Up to 3 years",
      "Interest: 8-12% floating",
      "Processing: 7-14 days",
    ],
  },
  {
    id: 2,
    slug: "asset-financing",
    name: "Asset Financing",
    tag: "Asset Finance",
    category: "sme" as const,
    icon: Car,
    longDesc:
      "Turn your business ambitions into reality with our Asset Financing facility. We finance up to 80% of the asset value for vehicles, machinery, and equipment -- allowing you to acquire what you need while preserving your working capital. With flexible repayment terms of up to 3 years and a straightforward application process, you can upgrade your operations without the burden of a lump-sum purchase.",
    image: "/images/products/coopwakala.jpg",
    features: [
      "Up to 80% asset value financing",
      "Vehicles and machinery",
      "Equipment financing",
      "Flexible repayment",
    ],
    requirements: [
      "Valid ID",
      "Proof of income",
      "Asset quotation or proforma invoice",
      "20% down payment",
    ],
    loanDetails: [
      "Amount: TSH 200,000 to 100,000,000",
      "Tenure: Up to 3 years",
      "Interest: 18% floating",
      "Processing: 10-21 days",
    ],
  },
  {
    id: 3,
    slug: "mse-loans",
    name: "MSE Loans",
    tag: "Small Business",
    category: "sme" as const,
    icon: Store,
    longDesc:
      "The MSE Loan is designed for micro and small enterprises that need quick capital without the complexity of traditional lending. With no collateral required and processing in as little as 3 days, this product helps small business owners restock inventory, cover operational costs, or seize market opportunities. Available for both groups and individuals with flexible repayment schedules that match your cash flow.",
    image: "/images/products/mama-africa.jpg",
    features: [
      "Quick disbursement",
      "No collateral required",
      "Group or individual",
      "Flexible repayment schedule",
    ],
    requirements: [
      "Valid ID",
      "Business permit or license",
      "6 months business operation",
      "Group guarantee or personal guarantee",
    ],
    loanDetails: [
      "Amount: TSH 50,000 to 5,000,000",
      "Tenure: Up to 12 months",
      "Interest: 18% flat",
      "Processing: 3-5 days",
    ],
  },
  {
    id: 4,
    slug: "sme-loans",
    name: "SME Loans",
    tag: "Medium Enterprise",
    category: "sme" as const,
    icon: Building,
    longDesc:
      "Our SME Loan facility provides established businesses with the substantial financing needed for growth and expansion. Whether you need working capital to manage cash flow, trade financing to import goods, or an overdraft facility for operational flexibility, this product is structured to support your business at every stage. Benefit from dedicated business advisory support and customized repayment plans that align with your revenue cycles.",
    image: "/images/products/sme-loans.jpg",
    features: [
      "Working capital and expansion",
      "Trade financing",
      "Overdraft facility",
      "Business advisory support",
    ],
    requirements: [
      "Valid ID",
      "Business registration",
      "2 years audited financials",
      "Collateral (property or fixed assets)",
      "Business plan",
    ],
    loanDetails: [
      "Amount: TSH 5,000,000 to 200,000,000",
      "Tenure: Up to 5 years",
      "Interest: 16-18% floating",
      "Processing: 14-21 days",
    ],
  },
  {
    id: 5,
    slug: "bunge-loans",
    name: "Bunge Loans",
    tag: "Group Lending",
    category: "sme" as const,
    icon: Users,
    longDesc:
      "Bunge Loans harness the power of group solidarity to provide accessible financing for community savings groups and cooperatives. Each member can access individual loans backed by joint group guarantee, eliminating the need for personal collateral. With progressive loan amounts that increase as your group builds a repayment track record, plus free financial literacy training, Bunge Loans help communities grow together.",
    image: "/images/products/group.jpg",
    features: [
      "Group solidarity lending",
      "No individual collateral",
      "Financial literacy training",
      "Progressive loan amounts",
    ],
    requirements: [
      "Registered group (minimum 5 members)",
      "Group constitution",
      "3 months savings history",
      "Joint group guarantee",
    ],
    loanDetails: [
      "Amount: TSH 100,000 to 10,000,000 per member",
      "Tenure: Up to 12 months",
      "Interest: 18% flat",
      "Processing: 5-7 days",
    ],
  },
  {
    id: 6,
    slug: "salaried-loans",
    name: "Salaried Loans",
    tag: "Personal",
    category: "personal" as const,
    icon: Wallet,
    longDesc:
      "Our Salaried Loan is the fastest way for employed individuals to access credit. With payroll-linked repayment deducted directly from your salary, you enjoy hassle-free servicing and competitive interest rates. Government employees benefit from preferential pricing, and loans up to TSH 10M require no collateral. A top-up facility lets you access additional funds before your current loan is fully repaid.",
    image: "/images/products/coopesa-oldman.jpg",
    features: [
      "Fast payroll-linked repayment",
      "No collateral up to TSH 10M",
      "Competitive rates for government employees",
      "Top-up facility available",
    ],
    requirements: [
      "Valid ID",
      "Employment confirmation letter",
      "3 months payslips",
      "Salary domiciliation with CoopBank",
    ],
    loanDetails: [
      "Amount: TSH 500,000 to 50,000,000",
      "Tenure: Up to 5 years",
      "Interest: 18% floating",
      "Processing: 3-7 days",
    ],
  },
  {
    id: 7,
    slug: "bajaji-loans",
    name: "Bajaji Loans",
    tag: "Transport",
    category: "personal" as const,
    icon: Truck,
    longDesc:
      "The Bajaji Loan is purpose-built for Tanzania's transport entrepreneurs. Whether you are purchasing a bajaji (three-wheeler) or a bodaboda (motorcycle), we finance up to 80% of the vehicle value with flexible daily or weekly repayment options that match your income pattern. Insurance is included in the package, and our straightforward process gets you on the road quickly so you can start earning immediately.",
    image: "/images/products/coopwakala.jpg",
    features: [
      "Finance for bajaji and bodaboda",
      "Up to 80% vehicle value",
      "Flexible daily or weekly repayment",
      "Insurance included",
    ],
    requirements: [
      "Valid ID",
      "Driving permit",
      "Route permit or TIN",
      "20% down payment",
      "Guarantor",
    ],
    loanDetails: [
      "Amount: TSH 2,000,000 to 15,000,000",
      "Tenure: Up to 3 years",
      "Interest: 18% floating",
      "Processing: 7-14 days",
    ],
  },
  {
    id: 8,
    slug: "investment-account-loans",
    name: "Investment Account Loans",
    tag: "Investment",
    category: "personal" as const,
    icon: PiggyBank,
    longDesc:
      "Unlock the value of your savings without breaking your deposit. Our Investment Account Loan lets you borrow up to 90% of your fixed deposit or investment account balance at preferential rates. With rapid approval in as little as one day and no additional collateral required, this is the smartest way to access liquidity while your savings continue to earn interest.",
    image: "/images/products/fixed-deposit.jpg",
    features: [
      "Leverage your savings as collateral",
      "Quick approval",
      "No additional collateral required",
      "Competitive rates",
    ],
    requirements: [
      "Active CoopBank investment or fixed deposit account",
      "Minimum 3 months deposit history",
    ],
    loanDetails: [
      "Amount: Up to 90% of deposit value",
      "Tenure: Up to 12 months",
      "Interest: Deposit rate + 3%",
      "Processing: 1-3 days",
    ],
  },
  {
    id: 9,
    slug: "digital-loans",
    name: "Digital Loans",
    tag: "Digital",
    category: "personal" as const,
    icon: Smartphone,
    longDesc:
      "Get instant credit right from your phone with CoopBank Digital Loans via the CoopPesa app. No paperwork, no branch visits, no waiting -- just open the app and apply. Approval is instant based on your transaction history and repayment record. With 24/7 availability and automatic repayment, this is modern banking at its most convenient. Perfect for emergencies or short-term cash needs.",
    image: "/images/products/coopesa.jpg",
    features: [
      "Instant approval via CoopPesa app",
      "No paperwork required",
      "24/7 availability",
      "Auto-debit repayment",
    ],
    requirements: [
      "Active CoopPesa mobile banking",
      "3 months transaction history",
      "Good repayment record",
    ],
    loanDetails: [
      "Amount: TSH 50,000 to 5,000,000",
      "Tenure: 30 days",
      "Interest: 9% per month",
      "Processing: Instant",
    ],
  },
  {
    id: 10,
    slug: "business-loans",
    name: "Business Loans",
    tag: "Corporate",
    category: "sme" as const,
    icon: Briefcase,
    longDesc:
      "Our Business Loan facility caters to large-scale corporate financing needs. From project financing and trade finance to letters of credit, we provide the capital infrastructure that major enterprises require. Each corporate client is assigned a dedicated relationship manager who works with you to structure the optimal financing package. With tenures of up to 7 years and negotiable interest rates, we build solutions that match your business scale.",
    image: "/images/products/coopnet-lady.jpg",
    features: [
      "Large-scale corporate financing",
      "Project financing",
      "Trade finance and LCs",
      "Dedicated relationship manager",
    ],
    requirements: [
      "Company registration",
      "3 years audited financial statements",
      "Feasibility study",
      "Collateral (property or assets)",
      "Board resolution",
    ],
    loanDetails: [
      "Amount: TSH 100,000,000 to 500,000,000",
      "Tenure: Up to 7 years",
      "Interest: Negotiable",
      "Processing: 21-30 days",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  REUSABLE ANIMATED SECTION WRAPPER                                  */
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
/*  ACCORDION PANEL                                                    */
/* ------------------------------------------------------------------ */

function AccordionPanel({
  title,
  items,
  isOpen,
  onToggle,
}: {
  title: string;
  items: string[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left focus:outline-none group/acc"
      >
        <span
          className={`text-sm font-bold tracking-wide uppercase transition-colors duration-200 ${
            isOpen ? "text-[#1A8A3A]" : "text-[#1A56A0]"
          }`}
        >
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`transition-colors duration-200 ${
            isOpen ? "text-[#1A8A3A]" : "text-[#1A56A0]/50"
          }`}
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="pb-5 space-y-3">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1A8A3A]/10 flex items-center justify-center mt-0.5">
                    <Check size={12} className="text-[#1A8A3A]" />
                  </span>
                  <span className="text-[#4A5568] text-sm leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PRODUCT DETAIL SECTION                                             */
/* ------------------------------------------------------------------ */

function ProductDetailSection({
  product,
  index,
}: {
  product: LoanProduct;
  index: number;
}) {
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const isEven = index % 2 === 1;
  const bgColor = index % 2 === 0 ? "bg-white" : "bg-[#f4f6f9]";

  const togglePanel = (panel: string) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

  const textContent = (
    <FadeInSection className="flex flex-col justify-center" delay={0.1}>
      {/* Loan name */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-5 leading-tight">
        {product.name}
      </h2>

      {/* Description */}
      <p className="text-[#4A5568] text-base leading-relaxed mb-8">
        {product.longDesc}
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="#"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1A8A3A] hover:bg-[#14692D] text-white font-semibold text-sm transition-colors duration-300"
        >
          <ArrowRight size={16} />
          Apply Now
        </Link>
        <Link
          href={`/loan-products/calculator?product=${product.slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-[#1A56A0] text-[#1A56A0] hover:bg-[#1A56A0] hover:text-white font-semibold text-sm transition-colors duration-300"
        >
          <Calculator size={16} />
          Calculate Repayment
        </Link>
      </div>

      {/* Accordion panels */}
      <div className="border-t border-gray-200">
        <AccordionPanel
          title="Features & Benefits"
          items={product.features}
          isOpen={openPanel === "features"}
          onToggle={() => togglePanel("features")}
        />
        <AccordionPanel
          title="Requirements"
          items={product.requirements}
          isOpen={openPanel === "requirements"}
          onToggle={() => togglePanel("requirements")}
        />
        <AccordionPanel
          title="Loan Details"
          items={product.loanDetails}
          isOpen={openPanel === "details"}
          onToggle={() => togglePanel("details")}
        />
      </div>
    </FadeInSection>
  );

  const imageContent = (
    <FadeInSection className="flex items-center justify-center" delay={0.2}>
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </FadeInSection>
  );

  return (
    <section
      id={product.slug}
      className={`${bgColor} py-20 sm:py-24 lg:py-28 scroll-mt-20`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {isEven ? (
            <>
              {imageContent}
              {textContent}
            </>
          ) : (
            <>
              {textContent}
              {imageContent}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function LoanProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredLoans = activeCategory === "all"
    ? loanProducts
    : loanProducts.filter((l) => l.category === activeCategory);

  return (
    <>
      {/* ============================================================ */}
      {/*  HERO BANNER                                                 */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20">
        {/* Pattern background */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: "1200px", backgroundRepeat: "repeat" }} />
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
            <span className="text-white font-semibold">
              Loan Products
            </span>
          </motion.nav>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
              + Loan Products
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center"
          >
            Financing That Works for You
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-center"
          >
            From agriculture to digital loans -- flexible financing solutions
            with competitive rates designed for every Tanzanian business and individual.
          </motion.p>


        </div>
      </section>

      {/* ============================================================ */}
      {/*  CATEGORY FILTER                                              */}
      {/* ============================================================ */}
      <section className="bg-white py-6 border-b border-gray-100 sticky top-[88px] z-30 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-center gap-2 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-[#1A56A0] text-white shadow-md"
                  : "bg-[#f4f6f9] text-[#4A5568] hover:text-[#1A56A0] hover:bg-gray-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <Link
            href="/loan-products/calculator"
            className="ml-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#1A8A3A] text-white hover:bg-[#14692D] transition-colors inline-flex items-center gap-2"
          >
            <Calculator size={14} />
            Calculator
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PRODUCT DETAIL SECTIONS                                     */}
      {/* ============================================================ */}
      <AnimatePresence mode="wait">
        <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {filteredLoans.map((product, i) => (
            <ProductDetailSection key={product.id} product={product} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
