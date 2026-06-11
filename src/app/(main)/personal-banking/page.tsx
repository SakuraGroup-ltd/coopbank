"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  TYPES & DATA                                                       */
/* ------------------------------------------------------------------ */

type CategoryType =
  | "SAVINGS"
  | "FIXED"
  | "GROUP"
  | "CURRENT";

const categoryColors: Record<CategoryType, string> = {
  SAVINGS: "bg-[#1A8A3A]/15 text-[#1A8A3A] border border-[#1A8A3A]/20",
  FIXED: "bg-blue-500/15 text-blue-700 border border-blue-500/20",
  GROUP: "bg-purple-500/15 text-purple-700 border border-purple-500/20",
  CURRENT: "bg-amber-500/15 text-amber-700 border border-amber-500/20",
};

interface AccountProduct {
  id: number;
  slug: string;
  category: CategoryType;
  name: string;
  shortDesc: string;
  longDesc: string;
  image: string;
  features: string[];
  requirements: string[];
  channels: string[];
}

const accounts: AccountProduct[] = [
  /* ══════════════════════════════════════════════════════════════════ */
  /*  SAVINGS ACCOUNTS                                                 */
  /* ══════════════════════════════════════════════════════════════════ */
  {
    id: 1,
    slug: "jasiri",
    category: "SAVINGS",
    name: "Jasiri Account",
    shortDesc: "Youth empowerment (18-35)",
    longDesc: "Youth empowerment account for Tanzanians aged 18-35. Access business mentorship, entrepreneurship training, and preferential loan rates to kickstart your future.",
    image: "/images/products/jasiri.jpg",
    features: [
      "For youth aged 18-35",
      "Zero account opening balance",
      "Business mentorship access",
      "Entrepreneurship training programs",
      "Preferential loan rates",
      "Free CoopPesa mobile banking",
    ],
    requirements: [
      "Valid ID (NIDA, passport, voter ID)",
      "Proof of age (18-35 years)",
      "Passport photo",
    ],
    channels: [
      "CoopPesa Mobile App",
      "All CoopBank branches",
      "Agent Banking (CoopWakala)",
      "USSD *150*84#",
    ],
  },
  {
    id: 2,
    slug: "normal-savings",
    category: "SAVINGS",
    name: "Normal Savings Account",
    shortDesc:
      "Everyday savings -- Normal/Akiba Account. Open access savings for all Tanzanians.",
    longDesc:
      "The Normal Savings Account is designed for every Tanzanian. Whether you are saving for daily needs or building a financial cushion, this account gives you easy access to your funds while earning competitive interest rates. With a low opening balance and free mobile banking, getting started has never been easier.",
    image: "/images/products/mama-africa.jpg",
    features: [
      "Open to all Tanzanians",
      "Low opening balance (TSH 10,000)",
      "Competitive interest rates",
      "Free CoopPesa mobile banking",
      "Free SMS notifications",
      "Passbook provided",
    ],
    requirements: [
      "Valid ID (NIDA, passport, voter ID)",
      "Passport photo",
      "Minimum opening balance TSH 10,000",
    ],
    channels: [
      "CoopPesa Mobile App",
      "Internet Banking (CoopNet)",
      "USSD *150*84#",
      "All CoopBank branches",
      "Agent Banking (CoopWakala)",
    ],
  },
  {
    id: 3,
    slug: "mafao",
    category: "SAVINGS",
    name: "Mafao Account",
    shortDesc: "Retirement and benefits savings for a secure future.",
    longDesc: "The Mafao Account helps you plan for retirement and long-term financial security. Set aside funds from your benefits, pensions, or regular income to build a comfortable future for you and your family.",
    image: "/images/products/fixed-deposit.jpg",
    features: [
      "Retirement savings planning",
      "Competitive interest rates",
      "Flexible deposit options",
      "Free financial advisory",
      "Access to loan facilities",
      "Free CoopPesa mobile banking",
      "Free SMS notifications",
    ],
    requirements: [
      "Valid ID (NIDA, passport, voter ID)",
      "Passport photo",
      "Proof of employment or pension",
      "Minimum opening balance TSH 10,000",
    ],
    channels: [
      "CoopPesa Mobile App",
      "Internet Banking (CoopNet)",
      "USSD *150*84#",
      "All CoopBank branches",
      "Agent Banking (CoopWakala)",
    ],
  },
  {
    id: 4,
    slug: "kilimo-tija",
    category: "SAVINGS",
    name: "Kilimo Tija Account",
    shortDesc:
      "Agricultural savings account -- interest tied to harvest cycles.",
    longDesc:
      "Kilimo Tija is specifically designed for Tanzanian farmers and agribusinesses. The account offers seasonal deposit flexibility that aligns with harvest cycles, ensuring your savings grow when your crops do. Access agricultural advisory support and agri-business loans to expand your farming operations.",
    image: "/images/products/kilimo-tija.jpg",
    features: [
      "Seasonal deposit flexibility",
      "Agricultural advisory support",
      "Access to agri-business loans",
      "Interest tied to harvest cycles",
      "Group farming account option",
    ],
    requirements: [
      "Valid ID",
      "Proof of agricultural activity",
      "Passport photo",
      "Minimum opening balance TSH 10,000",
    ],
    channels: [
      "CoopPesa Mobile App",
      "Agent Banking (CoopWakala)",
      "All branches",
      "USSD *150*84#",
    ],
  },
  {
    id: 5,
    slug: "msomi",
    category: "SAVINGS",
    name: "Msomi Account",
    shortDesc: "No monthly fees -- designed for students at all levels.",
    longDesc: "The Msomi Account is designed for students at all levels. No monthly fees, free Visa prepaid card, and financial literacy training to build smart money habits early.",
    image: "/images/products/wanafunzi.jpg",
    features: [
      "No monthly maintenance fees",
      "Free Visa prepaid card",
      "Financial literacy training",
      "Low opening balance (TSH 5,000)",
      "Free CoopPesa mobile banking",
      "School fees payment facility",
    ],
    requirements: [
      "Student ID or school enrollment letter",
      "Parent/guardian ID (for minors)",
      "Passport photo",
      "Minimum opening balance TSH 5,000",
    ],
    channels: [
      "CoopPesa Mobile App",
      "All CoopBank branches",
      "USSD *150*84#",
      "Agent Banking (CoopWakala)",
    ],
  },
  {
    id: 6,
    slug: "salary",
    category: "SAVINGS",
    name: "Salary Account",
    shortDesc: "Salary domiciliation with exclusive banking benefits.",
    longDesc: "The Salary Account is designed for employed individuals who want to receive their salary directly into their bank account. Enjoy exclusive benefits including preferential loan rates, free salary processing, and access to all digital banking channels.",
    image: "/images/products/jasiri.jpg",
    features: [
      "Direct salary deposit",
      "Preferential loan rates",
      "Free salary processing",
      "Free CoopPesa mobile banking",
      "Access to overdraft facility",
      "Free monthly statements",
      "Free SMS notifications",
    ],
    requirements: [
      "Valid ID (NIDA, passport, voter ID)",
      "Employment letter from employer",
      "Passport photo",
      "Minimum opening balance TSH 10,000",
    ],
    channels: [
      "CoopPesa Mobile App",
      "Internet Banking (CoopNet)",
      "USSD *150*84#",
      "All CoopBank branches",
      "Agent Banking (CoopWakala)",
    ],
  },
  {
    id: 7,
    slug: "staff",
    category: "SAVINGS",
    name: "Staff Account",
    shortDesc: "Exclusive account for CoopBank employees.",
    longDesc: "The Staff Account offers exclusive banking benefits for Cooperative Bank Tanzania employees. Enjoy preferential rates, special loan packages, and dedicated banking services designed for our team.",
    image: "/images/products/mama-africa.jpg",
    features: [
      "Exclusive staff interest rates",
      "Special staff loan packages",
      "Free banking services",
      "Salary domiciliation",
      "Dedicated staff banking support",
      "Free CoopPesa mobile banking",
      "Free SMS notifications",
    ],
    requirements: [
      "Valid CoopBank staff ID",
      "Employment confirmation letter",
      "Passport photo",
    ],
    channels: [
      "CoopPesa Mobile App",
      "Internet Banking (CoopNet)",
      "USSD *150*84#",
      "All CoopBank branches",
    ],
  },

  /* ══════════════════════════════════════════════════════════════════ */
  /*  FIXED ACCOUNTS                                                   */
  /* ══════════════════════════════════════════════════════════════════ */
  {
    id: 8,
    slug: "mtoto",
    category: "FIXED",
    name: "Mtoto Account",
    shortDesc: "Children's savings account -- build their future early.",
    longDesc: "The Mtoto Account helps parents and guardians save for their children's future. Start early, earn competitive interest, and teach your children the value of saving from a young age.",
    image: "/images/products/wanafunzi.jpg",
    features: [
      "For children under 18",
      "Low opening balance (TSH 5,000)",
      "Competitive interest rates",
      "Free financial literacy for kids",
      "Parent/guardian managed",
      "Free SMS notifications",
    ],
    requirements: [
      "Child's birth certificate",
      "Parent/guardian valid ID (NIDA, passport, voter ID)",
      "Passport photo of child and guardian",
      "Minimum opening balance TSH 5,000",
    ],
    channels: [
      "All CoopBank branches",
      "CoopPesa Mobile App",
      "USSD *150*84#",
      "Agent Banking (CoopWakala)",
    ],
  },
  {
    id: 9,
    slug: "mama-africa",
    category: "FIXED",
    name: "Mama Africa Account",
    shortDesc:
      "Everyday savings -- Open access savings for all Tanzanians.",
    longDesc:
      "The Mama Africa Account is our flagship savings product designed for every Tanzanian. Whether you are saving for daily needs or building a financial cushion, this account gives you easy access to your funds while earning competitive interest rates. With a low opening balance and free mobile banking, getting started has never been easier.",
    image: "/images/products/mama-africa.jpg",
    features: [
      "Open to all Tanzanians",
      "Low opening balance (TSH 10,000)",
      "Competitive interest rates",
      "Free CoopPesa mobile banking",
      "Free SMS notifications",
      "Passbook provided",
    ],
    requirements: [
      "Valid ID (NIDA, passport, voter ID)",
      "Passport photo",
      "Minimum opening balance TSH 10,000",
    ],
    channels: [
      "CoopPesa Mobile App",
      "Internet Banking (CoopNet)",
      "USSD *150*84#",
      "All CoopBank branches",
      "Agent Banking (CoopWakala)",
    ],
  },
  {
    id: 10,
    slug: "baba-fedha",
    category: "FIXED",
    name: "Baba Fedha Account",
    shortDesc:
      "Savings for household heads and family financial planning.",
    longDesc:
      "The Baba Fedha Account is tailored for household heads who want to take charge of their family's financial future. With competitive interest on savings, joint account options, and salary domiciliation benefits, this account empowers you to plan and grow your family wealth with confidence.",
    image: "/images/products/jasiri.jpg",
    features: [
      "Designed for family heads",
      "Competitive interest on savings",
      "Joint account option available",
      "Free mobile banking access",
      "Salary domiciliation benefits",
    ],
    requirements: [
      "Valid ID",
      "Proof of income/employment",
      "Passport photo",
      "Minimum opening balance TSH 50,000",
    ],
    channels: [
      "CoopPesa Mobile App",
      "Internet Banking",
      "All branches",
      "USSD *150*84#",
    ],
  },
  {
    id: 11,
    slug: "juhudi",
    category: "FIXED",
    name: "Juhudi Account",
    shortDesc: "Hard work rewarded -- savings for the industrious.",
    longDesc: "The Juhudi Account rewards hard-working Tanzanians with competitive interest rates and flexible savings options. Whether you are an entrepreneur, artisan, or professional, this account helps you grow your earnings.",
    image: "/images/products/kilimo-tija.jpg",
    features: [
      "Competitive interest rates",
      "Flexible deposit amounts",
      "Access to loan facilities",
      "Free CoopPesa mobile banking",
      "Reward incentives for consistent saving",
      "Free SMS notifications",
    ],
    requirements: [
      "Valid ID (NIDA, passport, voter ID)",
      "Passport photo",
      "Proof of income or business activity",
      "Minimum opening balance TSH 10,000",
    ],
    channels: [
      "CoopPesa Mobile App",
      "All CoopBank branches",
      "Agent Banking (CoopWakala)",
      "USSD *150*84#",
    ],
  },
  {
    id: 12,
    slug: "fixed-deposit",
    category: "FIXED",
    name: "Fixed Deposit Account",
    shortDesc:
      "Maximize savings with premium interest rates on fixed-term deposits. Up to 10% p.a.",
    longDesc:
      "Lock in your savings and earn premium interest rates of up to 10% per annum with our Fixed Deposit Account. Choose a flexible tenure from 3 to 12 months with guaranteed capital protection. You can also use your deposit as collateral for a loan facility, and enjoy hassle-free auto-renewal options.",
    image: "/images/products/fixed-deposit.jpg",
    features: [
      "Up to 10% p.a. interest",
      "Flexible tenure from 3 to 12 months",
      "Capital protection guaranteed",
      "Loan facility against deposit",
      "Auto-renewal option",
    ],
    requirements: [
      "Valid ID",
      "Passport photo",
      "Minimum deposit TSH 1,000,000",
      "Existing CoopBank account",
    ],
    channels: [
      "All CoopBank branches",
      "Internet Banking (CoopNet)",
    ],
  },

  /* ══════════════════════════════════════════════════════════════════ */
  /*  GROUP ACCOUNTS                                                   */
  /* ══════════════════════════════════════════════════════════════════ */
  {
    id: 13,
    slug: "group-savings",
    category: "GROUP",
    name: "Group Savings Account",
    shortDesc:
      "Collective savings -- Vikoba & Chamas. SACCOS and community group accounts.",
    longDesc:
      "Our Group Savings Account is built for SACCOs, Vikoba, Chamas, and other community savings groups. Manage your collective funds transparently with joint account controls, access group loans, and benefit from free financial training. A dedicated relationship manager ensures your group gets personalized support.",
    image: "/images/products/group.jpg",
    features: [
      "For SACCOs, Vikoba and Chamas",
      "Joint account management",
      "Group loan access",
      "Free group financial training",
      "Dedicated relationship manager",
    ],
    requirements: [
      "Group registration certificate",
      "List of group members with IDs",
      "Group constitution/bylaws",
      "Minutes of meeting authorizing account opening",
    ],
    channels: [
      "All CoopBank branches",
      "Dedicated group banking officers",
    ],
  },
  {
    id: 14,
    slug: "cooperative-savings",
    category: "GROUP",
    name: "Cooperative Savings Account",
    shortDesc: "Designed for registered cooperative societies and their members.",
    longDesc: "The Cooperative Savings Account is tailored for registered cooperative societies. Manage member contributions, access cooperative loans, and benefit from dedicated banking services designed for the cooperative movement.",
    image: "/images/products/group.jpg",
    features: [
      "For registered cooperative societies",
      "Member contribution management",
      "Access to cooperative loans",
      "Dedicated cooperative banking officer",
      "Competitive interest on deposits",
    ],
    requirements: [
      "Cooperative registration certificate",
      "List of officials with IDs",
      "Cooperative bylaws",
      "Resolution to open account",
      "Minimum opening balance TSH 50,000",
    ],
    channels: [
      "All CoopBank branches",
      "Internet Banking (CoopNet)",
      "Dedicated group banking officers",
    ],
  },
  {
    id: 15,
    slug: "group-current",
    category: "GROUP",
    name: "Group Current Account",
    shortDesc: "Transactional account for groups and organizations.",
    longDesc: "The Group Current Account provides unlimited daily transactions for groups, cooperatives, and organizations. Access cheque book facilities, standing orders, and dedicated support for your group's banking needs.",
    image: "/images/products/group.jpg",
    features: [
      "Unlimited daily transactions",
      "Cheque book facility",
      "Standing order and direct debit",
      "Joint signatory management",
      "Free internet banking",
    ],
    requirements: [
      "Group registration certificate",
      "List of authorized signatories with IDs",
      "Group constitution/bylaws",
      "Minutes of meeting authorizing account opening",
      "Minimum opening balance TSH 100,000",
    ],
    channels: [
      "All CoopBank branches",
      "Internet Banking (CoopNet)",
      "CoopPesa Mobile App",
      "Cheque facility",
    ],
  },

  /* ══════════════════════════════════════════════════════════════════ */
  /*  INDIVIDUAL CURRENT ACCOUNTS (all with TZS, USD, EUR, GBP)       */
  /* ══════════════════════════════════════════════════════════════════ */
  {
    id: 16,
    slug: "individual-current",
    category: "CURRENT",
    name: "Individual Current Account",
    shortDesc:
      "Unlimited transactions + cheque book. Available in TZS, USD, EUR, GBP.",
    longDesc:
      "The Individual Current Account is your go-to for day-to-day business and personal transactions. Enjoy unlimited daily transactions, a cheque book facility, and access to overdraft services. With standing order and direct debit options plus free internet banking, managing your finances is seamless and efficient. Available in TZS, USD, EUR, and GBP.",
    image: "/images/products/wanafunzi.jpg",
    features: [
      "Available in TZS, USD, EUR, and GBP",
      "Unlimited daily transactions",
      "Cheque book facility",
      "Overdraft facility available",
      "Standing order and direct debit",
      "Free internet banking",
    ],
    requirements: [
      "Valid ID",
      "Proof of business registration (for business)",
      "Passport photo",
      "Minimum opening balance TSH 100,000",
      "Two referees",
    ],
    channels: [
      "CoopPesa Mobile App",
      "Internet Banking (CoopNet)",
      "USSD *150*84#",
      "All branches",
      "Cheque facility",
    ],
  },
  {
    id: 17,
    slug: "jasiri-current",
    category: "CURRENT",
    name: "Jasiri Current Account",
    shortDesc: "Youth transactional account (18-35). Available in TZS, USD, EUR, GBP.",
    longDesc: "The Jasiri Current Account combines the youth empowerment benefits of the Jasiri brand with full transactional banking. Perfect for young entrepreneurs and professionals who need a full-featured current account. Available in TZS, USD, EUR, and GBP.",
    image: "/images/products/jasiri.jpg",
    features: [
      "Available in TZS, USD, EUR, and GBP",
      "For youth aged 18-35",
      "Unlimited daily transactions",
      "Cheque book facility",
      "Preferential business loan rates",
      "Free CoopPesa mobile banking",
    ],
    requirements: [
      "Valid ID (NIDA, passport, voter ID)",
      "Proof of age (18-35 years)",
      "Passport photo",
      "Minimum opening balance TSH 50,000",
      "Business registration (if applicable)",
    ],
    channels: [
      "CoopPesa Mobile App",
      "Internet Banking (CoopNet)",
      "All CoopBank branches",
      "USSD *150*84#",
      "Cheque facility",
    ],
  },
  {
    id: 18,
    slug: "enterprise-current",
    category: "CURRENT",
    name: "Enterprise Current Account",
    shortDesc: "For SMEs and growing businesses. Available in TZS, USD, EUR, GBP.",
    longDesc: "The Enterprise Current Account is designed for small and medium enterprises that need robust transactional banking. Manage your business finances with unlimited transactions, multiple currency options, and dedicated business support. Available in TZS, USD, EUR, and GBP.",
    image: "/images/products/kilimo-tija.jpg",
    features: [
      "Available in TZS, USD, EUR, and GBP",
      "Unlimited daily transactions",
      "Cheque book facility",
      "Overdraft and trade finance",
      "POS terminal eligibility",
      "Dedicated business relationship manager",
    ],
    requirements: [
      "Valid ID (NIDA, passport, voter ID)",
      "Business registration certificate",
      "TIN and VAT certificates",
      "Directors' IDs and passport photos",
      "Memorandum and Articles of Association",
      "Minimum opening balance TSH 200,000",
    ],
    channels: [
      "CoopPesa Mobile App",
      "Internet Banking (CoopNet)",
      "All CoopBank branches",
      "USSD *150*84#",
      "Cheque facility",
    ],
  },
  {
    id: 19,
    slug: "corporate-current",
    category: "CURRENT",
    name: "Corporate Current Account",
    shortDesc: "Full-service corporate banking. Available in TZS, USD, EUR, GBP.",
    longDesc: "The Corporate Current Account provides comprehensive banking services for large enterprises and corporations. Enjoy premium banking with multi-currency support, trade finance solutions, and a dedicated corporate banking team. Available in TZS, USD, EUR, and GBP.",
    image: "/images/products/fixed-deposit.jpg",
    features: [
      "Available in TZS, USD, EUR, and GBP",
      "Unlimited daily transactions",
      "Cheque book facility",
      "Trade finance and letters of credit",
      "Foreign exchange services",
      "Dedicated corporate banking team",
      "Payroll processing services",
    ],
    requirements: [
      "Certificate of incorporation",
      "TIN and VAT certificates",
      "Board resolution to open account",
      "Directors' IDs and passport photos",
      "Audited financial statements",
      "Minimum opening balance TSH 500,000",
    ],
    channels: [
      "Internet Banking (CoopNet)",
      "All CoopBank branches",
      "CoopPesa Mobile App",
      "Dedicated corporate banker",
      "Cheque facility",
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
/*  ACCOUNT CARD                                                       */
/* ------------------------------------------------------------------ */

function AccountCard({
  account,
  index,
}: {
  account: AccountProduct;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const handleScrollToDetail = () => {
    const el = document.getElementById(account.slug);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="p-6 sm:p-8">
        {/* Top row: number + category badge */}
        <div className="flex items-start justify-between mb-5">
          <span className="text-5xl font-black text-[#1A56A0]/8 leading-none select-none">
            {String(account.id).padStart(2, "0")}
          </span>
          <span
            className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${categoryColors[account.category]}`}
          >
            {account.category}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-xl font-bold text-[#1A56A0] mb-2">
          {account.name}
        </h3>

        {/* Description */}
        <p className="text-[#4A5568] text-sm leading-relaxed mb-6 line-clamp-2">
          {account.shortDesc}
        </p>

        {/* Scroll link */}
        <button
          onClick={handleScrollToDetail}
          className="inline-flex items-center gap-2 text-[#1A8A3A] text-sm font-semibold hover:gap-3 transition-all duration-300 group/link"
        >
          <span>View Full Details</span>
          <ChevronDown size={18} className="group-hover/link:translate-y-0.5 transition-transform" />
        </button>
      </div>
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
  account,
  index,
}: {
  account: AccountProduct;
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
      {/* Account name */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A56A0] mb-5 leading-tight">
        {account.name}
      </h2>

      {/* Description */}
      <p className="text-[#4A5568] text-base leading-relaxed mb-8">
        {account.longDesc}
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link
          href="https://play.google.com/store/apps/details?id=tz.co.coopbank.coopesa&hl=en" target="_blank" rel="noopener"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1A8A3A] hover:bg-[#14692D] text-white font-semibold text-sm transition-colors duration-300"
        >
          <ArrowRight size={16} />
          Open Account on CoopPesa
        </Link>
      </div>

      {/* Accordion panels */}
      <div className="border-t border-gray-200">
        <AccordionPanel
          title="Features & Benefits"
          items={account.features}
          isOpen={openPanel === "features"}
          onToggle={() => togglePanel("features")}
        />
        <AccordionPanel
          title="Requirements"
          items={account.requirements}
          isOpen={openPanel === "requirements"}
          onToggle={() => togglePanel("requirements")}
        />
        <AccordionPanel
          title="Available Channels"
          items={account.channels}
          isOpen={openPanel === "channels"}
          onToggle={() => togglePanel("channels")}
        />
      </div>
    </FadeInSection>
  );

  const imageContent = (
    <FadeInSection className="flex items-center justify-center" delay={0.2}>
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
        <Image
          src={account.image}
          alt={account.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </FadeInSection>
  );

  return (
    <section
      id={account.slug}
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

export default function PersonalBankingPage() {
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
              Personal Banking
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
              + Personal Banking
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center"
          >
            Banking Built Around You
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-center"
          >
            From savings to investments, everyday transactions to long-term wealth --
            discover accounts tailored for every Tanzanian.
          </motion.p>
        </div>
      </section>


      {/* ============================================================ */}
      {/*  PRODUCT DETAIL SECTIONS                                     */}
      {/* ============================================================ */}
      {accounts.map((account, i) => (
        <ProductDetailSection key={account.id} account={account} index={i} />
      ))}
    </>
  );
}
