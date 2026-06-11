"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Search,
  MapPin,
  Lock,
  Headphones,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface SubMenuItem { label: string; href: string; desc?: string }
interface MegaColumn { title: string; items: SubMenuItem[] }
interface NavItem {
  label: string;
  href: string;
  megaMenu?: MegaColumn[];
  cta?: { label: string; href: string; desc: string };
}

/* --- Segment tabs (Row 1) --- */
const segments = [
  { label: "Personal Banking", href: "/personal-banking" },
  { label: "Digital Banking", href: "/digital-banking" },
  { label: "Cards & Payments", href: "/cards" },
  { label: "Loan Products", href: "/loan-products" },
  { label: "Treasury", href: "/treasury/foreign-exchange" },
  { label: "Investors", href: "/investors" },
  { label: "About Us", href: "/about-us" },
];

/* --- Product nav (Row 2) with mega menus --- */
const accountsMenu: MegaColumn[] = [
  {
    title: "Savings Accounts",
    items: [
      { label: "Jasiri Account", href: "/personal-banking#jasiri", desc: "Youth empowerment (18–35)" },
      { label: "Normal Savings Account", href: "/personal-banking#normal-savings", desc: "Everyday savings for all" },
      { label: "Mafao Account", href: "/personal-banking#mafao", desc: "Retirement & benefits savings" },
      { label: "Kilimo Tija Account", href: "/personal-banking#kilimo-tija", desc: "Agricultural savings" },
      { label: "Msomi Account", href: "/personal-banking#msomi", desc: "Student account — no monthly fees" },
      { label: "Salary Account", href: "/personal-banking#salary", desc: "Salary domiciliation" },
      { label: "Staff Account", href: "/personal-banking#staff", desc: "For CoopBank employees" },
    ],
  },
  {
    title: "Fixed Accounts",
    items: [
      { label: "Mtoto Account", href: "/personal-banking#mtoto", desc: "Children's savings" },
      { label: "Mama Africa Account", href: "/personal-banking#mama-africa", desc: "Women's empowerment savings" },
      { label: "Baba Fedha Account", href: "/personal-banking#baba-fedha", desc: "Family financial planning" },
      { label: "Juhudi Account", href: "/personal-banking#juhudi", desc: "Hard work rewarded" },
      { label: "Fixed Deposit Account", href: "/personal-banking#fixed-deposit", desc: "Up to 10% p.a. interest" },
    ],
  },
  {
    title: "Group & Current Accounts",
    items: [
      { label: "Group Savings Account", href: "/personal-banking#group-savings", desc: "SACCOS, Vikoba & Chamas" },
      { label: "Cooperative Savings Account", href: "/personal-banking#cooperative-savings", desc: "For cooperative societies" },
      { label: "Group Current Account", href: "/personal-banking#group-current", desc: "Group transactional account" },
      { label: "Individual Current Account", href: "/personal-banking#individual-current", desc: "TZS, USD, EUR, GBP" },
      { label: "Jasiri Current Account", href: "/personal-banking#jasiri-current", desc: "TZS, USD, EUR, GBP" },
      { label: "Enterprise Current Account", href: "/personal-banking#enterprise-current", desc: "TZS, USD, EUR, GBP" },
      { label: "Corporate Current Account", href: "/personal-banking#corporate-current", desc: "TZS, USD, EUR, GBP" },
    ],
  },
];

const cardsMenu: MegaColumn[] = [
  {
    title: "Cards",
    items: [
      { label: "Visa Prepaid Card", href: "/cards#visa-prepaid", desc: "Load & spend anywhere" },
      { label: "Online Shopping", href: "/cards#online", desc: "Secure e-commerce payments" },
    ],
  },
  {
    title: "Payments",
    items: [
      { label: "QR Pay", href: "/cards#qr-pay", desc: "Scan-to-pay at merchants" },
      { label: "Bill Payments", href: "/cards#bill-pay", desc: "Utilities, fees & more" },
      { label: "Money Transfers", href: "/cards#transfers", desc: "Local & international" },
      { label: "Airtime & Bundles", href: "/cards#airtime", desc: "Top up any network" },
    ],
  },
  {
    title: "Security",
    items: [
      { label: "Card Controls", href: "/cards#controls", desc: "Freeze & manage via app" },
      { label: "Lost or Stolen", href: "/cards#report", desc: "Report & replace" },
    ],
  },
];

const loansMenu: MegaColumn[] = [
  {
    title: "Agriculture & Business",
    items: [
      { label: "Agri-Business Loans", href: "/loan-products#agri-business", desc: "TSH 100K–50M, 8–12%" },
      { label: "MSE Loans", href: "/loan-products#mse", desc: "Minimal collateral" },
      { label: "SME Loans", href: "/loan-products#sme", desc: "Working capital" },
      { label: "Business Loans", href: "/loan-products#business", desc: "Corporate finance" },
    ],
  },
  {
    title: "Personal",
    items: [
      { label: "Salaried Loans", href: "/loan-products#salaried", desc: "Payroll-linked" },
      { label: "Digital Loans", href: "/loan-products#digital", desc: "Instant via CoopPesa" },
      { label: "Investment Loans", href: "/loan-products#investment", desc: "Deposit as collateral" },
    ],
  },
  {
    title: "Specialized",
    items: [
      { label: "Asset Financing", href: "/loan-products#asset-financing", desc: "Up to 80% value" },
      { label: "Bunge Loans", href: "/loan-products#bunge", desc: "Group lending" },
      { label: "Bajaji Loans", href: "/loan-products#bajaji", desc: "Transport finance" },
    ],
  },
];

const forexMenu: MegaColumn[] = [
  {
    title: "Foreign Exchange",
    items: [
      { label: "Spot Foreign Exchange", href: "/treasury/foreign-exchange#spot-fx", desc: "Competitive market rates, no commission" },
      { label: "Forward FX Contracts", href: "/treasury/foreign-exchange#forward-fx", desc: "Lock future rates up to 12 months" },
      { label: "FX Swaps", href: "/treasury/foreign-exchange#fx-swaps", desc: "Flexible currency swaps" },
      { label: "Daily Exchange Rates", href: "/treasury/foreign-exchange#rates", desc: "Today's rates against TZS" },
    ],
  },
  {
    title: "Investments",
    items: [
      { label: "Fixed Deposits", href: "/treasury/fixed-deposits", desc: "Competitive rates, flexible tenors" },
      { label: "Government Securities", href: "/treasury/government-securities", desc: "T-Bills & T-Bonds via BOT" },
      { label: "Q2 Auction Calendar", href: "/treasury/government-securities#calendar", desc: "Upcoming BOT auctions" },
    ],
  },
  {
    title: "Treasury Desk",
    items: [
      { label: "Contact Our Dealers", href: "/treasury/foreign-exchange#contact", desc: "Hamis & Valentino" },
      { label: "Call: +255 766 722 201", href: "tel:+255766722201", desc: "Hamis C. Mwita" },
      { label: "Call: +255 756 401 135", href: "tel:+255756401135", desc: "Valentino I. Hungu" },
    ],
  },
];

const waysMenu: MegaColumn[] = [
  {
    title: "Digital Channels",
    items: [
      { label: "CoopPesa Mobile App", href: "/digital-banking#coopesa", desc: "Android & iOS" },
      { label: "CoopNet Internet Banking", href: "/digital-banking#coopnet", desc: "24/7 browser access" },
      { label: "USSD *150*84#", href: "/digital-banking#ussd", desc: "Every phone, no internet" },
      { label: "CoopWakala Agency", href: "/digital-banking#coopwakala", desc: "100+ agents" },
    ],
  },
  {
    title: "In Person",
    items: [
      { label: "Branch Locator", href: "/branches", desc: "8+ branches, 8 regions" },
      { label: "ATM Locations", href: "/branches#atm", desc: "Nearest ATM" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Contact Us", href: "/about-us#contact", desc: "+255 27 275 4470" },
      { label: "FAQs", href: "/faqs", desc: "Common questions" },
      { label: "Whistleblow", href: "/whistleblower", desc: "Report misconduct" },
    ],
  },
];

const productNav: NavItem[] = [
  { label: "Accounts", href: "/personal-banking", megaMenu: accountsMenu, cta: { label: "Download CoopPesa", href: "/digital-banking#download", desc: "Get the CoopPesa app on Android or iOS" } },
  { label: "Cards", href: "/cards", megaMenu: cardsMenu, cta: { label: "Apply for a Card", href: "/cards#apply", desc: "Get your Visa card today" } },
  { label: "Loans", href: "/loan-products", megaMenu: loansMenu, cta: { label: "Loan Calculator", href: "/loan-products#calculator", desc: "Estimate your repayments" } },
  { label: "Foreign Exchange", href: "/treasury/foreign-exchange", megaMenu: forexMenu, cta: { label: "Daily FX Rates", href: "/treasury/foreign-exchange#rates", desc: "View today's exchange rates" } },
  { label: "Ways of Banking", href: "/digital-banking", megaMenu: waysMenu, cta: { label: "Download CoopPesa", href: "/digital-banking#download", desc: "Get the app on Android or iOS" } },
];

/* ------------------------------------------------------------------ */
/*  Animations                                                         */
/* ------------------------------------------------------------------ */

const megaVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.18, ease: "easeIn" as const } },
};

const mobileVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: "easeOut" as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function NavbarV2() {
  const [activeSegment, setActiveSegment] = useState("Personal Banking");
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [lang, setLang] = useState<"EN" | "SW">("EN");
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setActiveMega(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setActiveMega(null); setMobileOpen(false); setSearchOpen(false); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const openMega = useCallback((label: string) => {
    if (closeTimeout.current) { clearTimeout(closeTimeout.current); closeTimeout.current = null; }
    setActiveMega(label);
  }, []);

  const scheduleMegaClose = useCallback(() => {
    closeTimeout.current = setTimeout(() => setActiveMega(null), 250);
  }, []);

  const cancelMegaClose = useCallback(() => {
    if (closeTimeout.current) { clearTimeout(closeTimeout.current); closeTimeout.current = null; }
  }, []);

  const activeNavItem = productNav.find((n) => n.label === activeMega);
  const activeMegaColumns = activeNavItem?.megaMenu ?? null;
  const activeCta = activeNavItem?.cta ?? null;

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50">

      {/* ================================================================ */}
      {/*  ROW 1 — Clean white: Logo + utilities + language + search        */}
      {/* ================================================================ */}
      <div className={`transition-all duration-300 border-b ${
        scrolled ? "bg-white/95 backdrop-blur-xl border-[#F1F5F9] shadow-[0_1px_20px_rgba(0,0,0,0.04)]" : "bg-white border-[#F1F5F9]"
      }`}>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex h-14 items-center justify-between">

            {/* Logo */}
            <Link href="/home-2" className="flex items-center shrink-0 mr-10">
              <Image src="/images/coopbank-logo.png" alt="CoopBank Tanzania" width={140} height={48} className="h-10 w-auto" priority />
            </Link>

            {/* Right — utilities + language + search */}
            <div className="flex items-center gap-1 ml-auto">
              <Link href="/about-us#contact" className="hidden md:flex items-center gap-1.5 px-3 py-1 text-[11px] text-[#94A3B8] hover:text-[#1A1A2E] transition-colors">
                <Headphones className="h-3 w-3" /> Customer Care
              </Link>
              <Link href="#" className="hidden md:flex items-center gap-1.5 px-3 py-1 text-[11px] text-[#94A3B8] hover:text-[#1A1A2E] transition-colors">
                <MapPin className="h-3 w-3" /> ATM & Branches
              </Link>
              <Link href="#" className="hidden md:flex items-center gap-1.5 px-3 py-1 text-[11px] text-[#94A3B8] hover:text-[#1A1A2E] transition-colors">
                <Zap className="h-3 w-3" /> Quick Services
              </Link>

              {/* Divider */}
              <div className="hidden md:block h-5 w-px bg-[#E2E8F0] mx-2" />

              {/* Language selector */}
              <button
                type="button"
                onClick={() => setLang(lang === "EN" ? "SW" : "EN")}
                className="hidden md:flex items-center gap-2 px-3 py-1 text-[11px] font-semibold text-[#64748B] hover:text-[#1A1A2E] transition-colors"
              >
                <span className="text-base">🇹🇿</span>
                {lang === "EN" ? "English" : "Kiswahili"}
              </button>

              {/* Search */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-xl hover:bg-[#F8FAFC] text-[#94A3B8] hover:text-[#1A1A2E] transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* CoopNet Login */}
              <Link
                href="https://coopnet.coopbank.co.tz"
                className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-[#1A1A2E] ml-2 px-5 py-2 text-[11px] font-bold text-white transition-all hover:bg-[#2D2D44] hover:shadow-md"
              >
                <Lock className="h-3 w-3" />
                Login to CoopNet
              </Link>

              {/* Mobile hamburger */}
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden p-1.5 ml-2 rounded text-[#1A1A2E]"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  ROW 2 — Charcoal: Segment tabs + product nav                    */}
      {/* ================================================================ */}
      <div className="hidden lg:block bg-[#1A1A2E]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex h-11 items-center justify-between">

            {/* Segment tabs */}
            <div className="flex items-center h-full overflow-x-auto no-scrollbar">
              {segments.map((seg) => (
                <Link
                  key={seg.label}
                  href={seg.href}
                  onClick={() => setActiveSegment(seg.label)}
                  className={`relative flex items-center h-full px-4 text-[11px] font-semibold tracking-wide whitespace-nowrap transition-colors ${
                    activeSegment === seg.label
                      ? "text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {seg.label}
                  {activeSegment === seg.label && (
                    <motion.span
                      layoutId="segment-indicator"
                      className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#00C853]"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Product links (right side of dark bar) */}
            <div className="flex items-center h-full gap-0">
              {productNav.map((item) => {
                const isActive = activeMega === item.label;
                return (
                  <div
                    key={item.label}
                    className="relative flex items-center h-full"
                    onMouseEnter={() => {}}
                    onMouseLeave={() => {}}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveMega(isActive ? null : item.label)}
                      className={`flex items-center gap-1 px-4 h-full text-[12px] font-semibold transition-colors duration-200 relative ${
                        isActive ? "text-[#00C853]" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {item.label}
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`} />
                      {isActive && (
                        <motion.span
                          layoutId="product-indicator"
                          className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#00C853]"
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bg-white border-b border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.06)] z-50"
            style={{ top: "calc(56px + 44px)" }}
          >
            <div className="mx-auto max-w-[1440px] px-10 py-5">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-[#94A3B8]" />
                <input type="text" placeholder="Search accounts, loans, branches, services..." className="flex-1 text-[15px] text-[#1A1A2E] placeholder:text-[#CBD5E1] outline-none bg-transparent" autoFocus />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-1 text-[#94A3B8] hover:text-[#1A1A2E]"><X className="h-4 w-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  Mega Menu                                                       */}
      {/* ================================================================ */}
      <AnimatePresence>
        {activeMega && activeMegaColumns && (
          <motion.div
            key={activeMega}
            variants={megaVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
            className="absolute inset-x-0 hidden lg:block bg-white border-b border-[#F1F5F9] shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
            style={{ top: "calc(56px + 44px)" }}
          >
            <div className="mx-auto max-w-[1440px] px-10 py-10">
              <div
                className="grid items-start gap-x-8"
                style={{ gridTemplateColumns: activeCta ? "1fr 1fr 1fr 260px" : "1fr 1fr 1fr" }}
              >
                {activeMegaColumns.map((col) => (
                  <div key={col.title}>
                    <h4 className="mb-4 pb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#94A3B8] border-b border-[#F1F5F9]">
                      {col.title}
                    </h4>
                    <ul className="space-y-0.5">
                      {col.items.map((item) => (
                        <li key={item.href + item.label}>
                          <Link
                            href={item.href}
                            onClick={() => setActiveMega(null)}
                            className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#F8FAFC]"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E2E8F0] group-hover:bg-[#00C853] transition-colors" />
                            <div>
                              <span className="block text-[13px] font-medium text-[#1A1A2E] group-hover:text-[#00C853] transition-colors">
                                {item.label}
                              </span>
                              {item.desc && (
                                <span className="block mt-0.5 text-[11px] text-[#94A3B8] group-hover:text-[#64748B] transition-colors">
                                  {item.desc}
                                </span>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {activeCta && (
                  <div className="flex flex-col justify-center h-full">
                    <div className="rounded-2xl bg-[#1A1A2E] p-6">
                      <p className="text-[14px] font-bold text-white mb-1.5">{activeCta.label}</p>
                      <p className="text-[11px] text-white/50 mb-5 leading-relaxed">{activeCta.desc}</p>
                      <Link
                        href={activeCta.href}
                        onClick={() => setActiveMega(null)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#00C853] px-5 py-2.5 text-[11px] font-bold text-white transition-all hover:bg-[#00E676] hover:gap-2.5 hover:shadow-md"
                      >
                        {activeCta.label} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 border-t border-[#F1F5F9] pt-5 flex items-center justify-between">
                <Link href={activeNavItem?.href ?? "/"} onClick={() => setActiveMega(null)} className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#00C853] hover:text-[#1A1A2E] transition-colors">
                  View all {activeMega?.toLowerCase()} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {activeMega && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 -z-10 hidden lg:block bg-[#1A1A2E]/20 backdrop-blur-sm"
            onClick={() => setActiveMega(null)}
          />
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  Mobile Menu                                                     */}
      {/* ================================================================ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 top-14 z-40 lg:hidden bg-white overflow-y-auto"
          >
            <div className="px-5 py-4">
              {/* Logo */}
              <div className="flex items-center mb-6">
                <Image src="/images/coopbank-logo.png" alt="CoopBank Tanzania" width={140} height={48} className="h-10 w-auto" />
              </div>

              {/* Search */}
              <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-4 py-3 mb-5">
                <Search className="h-4 w-4 text-[#94A3B8]" />
                <input type="text" placeholder="Search..." className="flex-1 text-sm text-[#1A1A2E] placeholder:text-[#CBD5E1] outline-none bg-transparent" />
              </div>

              {/* Login + Register */}
              <div className="flex gap-2 mb-6">
                <Link href="https://coopnet.coopbank.co.tz" onClick={() => setMobileOpen(false)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1A1A2E] px-4 py-3 text-sm font-bold text-white">
                  <Lock className="h-4 w-4" /> Login to CoopNet
                </Link>
              </div>

              {/* Product nav */}
              <p className="px-1 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#CBD5E1]">Products</p>
              <div className="flex flex-col gap-0.5 mb-6">
                {productNav.map((item, i) => {
                  const isExpanded = mobileExpanded === item.label;
                  return (
                    <motion.div key={item.label} custom={i} variants={mobileItemVariants} initial="hidden" animate="visible">
                      <button
                        type="button"
                        onClick={() => setMobileExpanded(isExpanded ? null : item.label)}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold transition-colors ${
                          isExpanded ? "text-[#00C853] bg-[#F8FAFC]" : "text-[#1A1A2E] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`h-4 w-4 text-[#CBD5E1] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {isExpanded && item.megaMenu && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1, transition: { duration: 0.25 } }}
                            exit={{ height: 0, opacity: 0, transition: { duration: 0.18 } }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 border-l-2 border-[#00C853]/15 pl-3 pb-3 space-y-3 mt-1">
                              {item.megaMenu.map((col) => (
                                <div key={col.title}>
                                  <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#CBD5E1]">{col.title}</p>
                                  {col.items.map((sub) => (
                                    <Link key={sub.href + sub.label} href={sub.href} onClick={() => setMobileOpen(false)}
                                      className="block rounded-lg px-3 py-2 text-[13px] text-[#64748B] font-medium hover:bg-[#F8FAFC] hover:text-[#00C853]"
                                    >{sub.label}</Link>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Segments */}
              <p className="px-1 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#CBD5E1]">More</p>
              <div className="flex flex-col gap-0.5">
                {segments.filter(s => !["Personal Banking"].includes(s.label)).map((seg) => (
                  <Link key={seg.label} href={seg.href} onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm text-[#64748B] font-medium hover:bg-[#F8FAFC] hover:text-[#00C853]"
                  >{seg.label}</Link>
                ))}
                <Link href="#" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#64748B] font-medium hover:bg-[#F8FAFC] hover:text-[#00C853]">Careers</Link>
                <Link href="#" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#64748B] font-medium hover:bg-[#F8FAFC] hover:text-[#00C853]">Tenders</Link>
                <Link href="/whistleblower" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#64748B] font-medium hover:bg-[#F8FAFC] hover:text-[#00C853]">Whistleblow</Link>
                <Link href="#" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-[#64748B] font-medium hover:bg-[#F8FAFC] hover:text-[#00C853]">Blog</Link>
              </div>

              {/* Language + contact */}
              <div className="mt-6 border-t border-[#F1F5F9] pt-6">
                <button
                  type="button"
                  onClick={() => setLang(lang === "EN" ? "SW" : "EN")}
                  className="flex items-center gap-2 text-[13px] font-semibold text-[#64748B]"
                >
                  <span className="text-lg">🇹🇿</span>
                  {lang === "EN" ? "Switch to Kiswahili" : "Switch to English"}
                </button>
                <p className="mt-4 text-[11px] text-[#CBD5E1]">+255 27 275 4470 &bull; info@cbtbank.co.tz</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
