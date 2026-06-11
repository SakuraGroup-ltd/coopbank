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
  Phone,
  MapPin,
  Globe,
  Lock,
  HelpCircle,
  UserPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface SubMenuItem {
  label: string;
  href: string;
  desc?: string;
}

interface MegaColumn {
  title: string;
  items: SubMenuItem[];
}

interface NavItem {
  label: string;
  href: string;
  megaMenu?: MegaColumn[];
  cta?: { label: string; href: string; desc: string };
}

/* ---------- Mega menu data ---------- */

const personalBankingMenu: MegaColumn[] = [
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
    title: "Fixed & Group Accounts",
    items: [
      { label: "Mtoto Account", href: "/personal-banking#mtoto", desc: "Children's savings" },
      { label: "Mama Africa Account", href: "/personal-banking#mama-africa", desc: "Women's empowerment savings" },
      { label: "Baba Fedha Account", href: "/personal-banking#baba-fedha", desc: "Family financial planning" },
      { label: "Juhudi Account", href: "/personal-banking#juhudi", desc: "Hard work rewarded" },
      { label: "Fixed Deposit Account", href: "/personal-banking#fixed-deposit", desc: "Up to 10% p.a. interest" },
      { label: "Group Savings Account", href: "/personal-banking#group-savings", desc: "SACCOS, Vikoba & Chamas" },
      { label: "Cooperative Savings", href: "/personal-banking#cooperative-savings", desc: "For cooperative societies" },
      { label: "Group Current Account", href: "/personal-banking#group-current", desc: "Group transactional account" },
    ],
  },
  {
    title: "Current Accounts (TZS, USD, EUR, GBP)",
    items: [
      { label: "Individual Current Account", href: "/personal-banking#individual-current", desc: "Personal transactions" },
      { label: "Jasiri Current Account", href: "/personal-banking#jasiri-current", desc: "Youth transactional (18–35)" },
      { label: "Enterprise Current Account", href: "/personal-banking#enterprise-current", desc: "For SMEs & growing businesses" },
      { label: "Corporate Current Account", href: "/personal-banking#corporate-current", desc: "Full-service corporate banking" },
    ],
  },
];

const digitalBankingMenu: MegaColumn[] = [
  {
    title: "Digital Channels",
    items: [
      { label: "CoopNet Internet Banking", href: "/digital-banking#coopnet", desc: "24/7 browser-based banking" },
      { label: "CoopEsa Mobile App", href: "/digital-banking#coopesa", desc: "Android & iOS banking" },
      { label: "USSD *150*84#", href: "/digital-banking#ussd", desc: "Works on every phone" },
      { label: "CoopWakala Agency", href: "/digital-banking#coopwakala", desc: "100+ agent points nationwide" },
    ],
  },
  {
    title: "Mobile Banking",
    items: [
      { label: "Download CoopEsa", href: "/digital-banking#download", desc: "Google Play & App Store" },
      { label: "Cardless ATM Withdrawal", href: "/digital-banking#cardless", desc: "Withdraw without your card" },
      { label: "QR Code Payments", href: "/digital-banking#qr-pay", desc: "Scan-to-pay with CoopEsa" },
      { label: "Push Notifications", href: "/digital-banking#notifications", desc: "Real-time transaction alerts" },
    ],
  },
  {
    title: "Get Started",
    items: [
      { label: "Login to CoopNet", href: "https://coopnet.coopbank.co.tz", desc: "Access your account online" },
      { label: "Register for USSD", href: "/digital-banking#ussd", desc: "Dial *150*84# to start" },
      { label: "Find an Agent", href: "/branches#agents", desc: "CoopWakala near you" },
      { label: "Digital Banking FAQs", href: "/faqs#digital", desc: "Common questions answered" },
    ],
  },
];

const cardsPaymentsMenu: MegaColumn[] = [
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
      { label: "QR Pay", href: "/cards#qr-pay", desc: "Scan-to-pay at merchant points" },
      { label: "Bill Payments", href: "/cards#bill-pay", desc: "Utilities, school fees & more" },
      { label: "Money Transfers", href: "/cards#transfers", desc: "Send money locally & abroad" },
      { label: "International Payments", href: "/cards#intl-payments", desc: "Cross-border fund transfers" },
      { label: "Airtime & Bundles", href: "/cards#airtime", desc: "Top up any network" },
    ],
  },
  {
    title: "Features & Security",
    items: [
      { label: "Card Controls", href: "/cards#controls", desc: "Freeze, limit & manage via app" },
      { label: "Lost or Stolen Card", href: "/cards#report", desc: "Report & get a replacement" },
    ],
  },
];

const loanProductsMenu: MegaColumn[] = [
  {
    title: "Agriculture & Business",
    items: [
      { label: "Agri-Business Loans", href: "/loan-products#agri-business", desc: "TSH 100K–50M, 8–12% rate" },
      { label: "MSE Loans", href: "/loan-products#mse", desc: "Minimal collateral, quick turnaround" },
      { label: "SME Loans", href: "/loan-products#sme", desc: "Working capital & asset finance" },
      { label: "Business Loans", href: "/loan-products#business", desc: "Corporate & large enterprise" },
    ],
  },
  {
    title: "Personal & Salaried",
    items: [
      { label: "Salaried Loans", href: "/loan-products#salaried", desc: "Fast payroll-linked loans" },
      { label: "Digital Loans", href: "/loan-products#digital", desc: "Instant via CoopEsa app" },
      { label: "Investment Account Loans", href: "/loan-products#investment", desc: "Deposit as collateral" },
    ],
  },
  {
    title: "Specialized",
    items: [
      { label: "Asset Financing", href: "/loan-products#asset-financing", desc: "Up to 80% asset value" },
      { label: "Bunge Loans", href: "/loan-products#bunge", desc: "Cooperative group lending" },
      { label: "Bajaji Loans", href: "/loan-products#bajaji", desc: "Transport fleet financing" },
    ],
  },
];

const treasuryMenu: MegaColumn[] = [
  {
    title: "Foreign Exchange",
    items: [
      { label: "Spot Foreign Exchange", href: "/treasury/foreign-exchange#spot-fx", desc: "Competitive rates, no commission" },
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
      { label: "Contact Treasury Desk", href: "/treasury/foreign-exchange#contact", desc: "Speak to our dealers" },
    ],
  },
];

const investorsMenu: MegaColumn[] = [
  {
    title: "Investor Information",
    items: [
      { label: "Memorandum & Articles", href: "/investors#memorandum", desc: "Articles of association" },
      { label: "Shareholder Notices", href: "/investors#notices", desc: "Latest shareholder communications" },
      { label: "Corporate Governance", href: "/investors#governance", desc: "Board charter & policies" },
      { label: "Investor FAQs", href: "/investors#faqs", desc: "Common investor questions" },
    ],
  },
  {
    title: "Reports & Disclosures",
    items: [
      { label: "Annual Reports", href: "/investors#annual-reports", desc: "Yearly financial performance" },
      { label: "Quarterly Reports", href: "/investors#quarterly-reports", desc: "Quarterly financial results" },
      { label: "Financial Statements", href: "/investors#financials", desc: "Audited financial statements" },
      { label: "Presentations", href: "/investors#presentations", desc: "Investor & analyst presentations" },
      { label: "Disclosures", href: "/investors#disclosures", desc: "Regulatory disclosures" },
    ],
  },
  {
    title: "AGM & Dividends",
    items: [
      { label: "AGM 2026", href: "/investors#agm", desc: "Annual general meeting details" },
      { label: "Dividend Mandate Forms", href: "/investors#dividends", desc: "Update your dividend details" },
      { label: "Proxy Form", href: "/investors#proxy", desc: "Appoint a proxy for AGM" },
      { label: "Dividend History", href: "/investors#dividend-history", desc: "Past dividend payouts" },
    ],
  },
];

/* ---------- Main nav items (bottom bar) ---------- */

const mainNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Personal Banking",
    href: "/personal-banking",
    megaMenu: personalBankingMenu,
    cta: { label: "Open an Account", href: "https://coopnet.coopbank.co.tz/Account/Register", desc: "Start your banking journey with CoopBank today" },
  },
  {
    label: "Digital Banking",
    href: "/digital-banking",
    megaMenu: digitalBankingMenu,
    cta: { label: "Download CoopEsa", href: "/digital-banking#download", desc: "Get the CoopEsa app on Android or iOS" },
  },
  {
    label: "Cards & Payments",
    href: "/cards",
    megaMenu: cardsPaymentsMenu,
    cta: { label: "Apply for a Card", href: "/cards#apply", desc: "Get your Visa card linked to your CoopBank account" },
  },
  {
    label: "Loan Products",
    href: "/loan-products",
    megaMenu: loanProductsMenu,
    cta: { label: "Loan Calculator", href: "/loan-products#calculator", desc: "Estimate your monthly repayments instantly" },
  },
  {
    label: "Treasury",
    href: "/treasury/foreign-exchange",
    megaMenu: treasuryMenu,
    cta: { label: "Daily FX Rates", href: "/treasury/foreign-exchange#rates", desc: "View today's CoopBank foreign exchange rates" },
  },
  {
    label: "Investors",
    href: "/investors",
    megaMenu: investorsMenu,
    cta: { label: "Annual Report 2025", href: "/investors#annual-reports", desc: "Download our latest annual report" },
  },
];

/* ---------- Top utility links (top bar) ---------- */

const topLinks = [
  { label: "About Us", href: "/about-us" },
  { label: "Careers", href: "/careers" },
  { label: "Tenders", href: "/tenders" },
  { label: "Whistleblower", href: "/whistleblower" },
  { label: "News", href: "/news" },
  { label: "FAQs", href: "/faqs" },
];

/* ------------------------------------------------------------------ */
/*  Animations                                                         */
/* ------------------------------------------------------------------ */

const megaMenuVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
};

const mobileMenuVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: "easeOut" as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [lang, setLang] = useState<"EN" | "SW">("EN");
  const [searchOpen, setSearchOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Body lock */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* Outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node))
        setActiveMega(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMega(null);
        setMobileOpen(false);
        setSearchOpen(false);
      }
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

  const activeNavItem = mainNavItems.find((n) => n.label === activeMega);
  const activeMegaColumns = activeNavItem?.megaMenu ?? null;
  const activeCta = activeNavItem?.cta ?? null;

  const showDark = !scrolled && !activeMega;

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50">

      {/* ================================================================ */}
      {/*  ROW 1 — Top Utility Bar (desktop only)                          */}
      {/*  About, Careers, Tenders, Support | Login, Register, Lang        */}
      {/* ================================================================ */}
      <div className={`hidden xl:block transition-colors duration-300 ${showDark ? "bg-[#0F3D7A]/80 backdrop-blur-md" : "bg-[#0F3D7A]"}`}>
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex h-11 items-center justify-between">

            {/* Center — Secondary page links */}
            <div className="flex items-center gap-1">
              {topLinks.map((link, i) => (
                <span key={link.label} className="flex items-center">
                  {i > 0 && <span className="text-white/15 mx-1">|</span>}
                  <Link
                    href={link.href}
                    className="text-[11px] text-white/55 hover:text-white transition-colors px-1.5 py-0.5"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
              <span className="text-white/15 mx-1">|</span>
              <Link
                href="/branches"
                className="flex items-center gap-1 text-[11px] text-white/55 hover:text-white transition-colors px-1.5 py-0.5"
              >
                <MapPin className="h-3 w-3" />
                Find a Branch
              </Link>
              <span className="text-white/15 mx-1">|</span>
              <Link
                href="/about-us#contact"
                className="flex items-center gap-1 text-[11px] text-white/55 hover:text-white transition-colors px-1.5 py-0.5"
              >
                <HelpCircle className="h-3 w-3" />
                Support
              </Link>
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-2">
              {/* Lang toggle */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setLang("EN")}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    lang === "EN" ? "bg-white/15 text-white" : "text-white/35 hover:text-white/60"
                  }`}
                >
                  <Globe className="h-3 w-3" />EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang("SW")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    lang === "SW" ? "bg-white/15 text-white" : "text-white/35 hover:text-white/60"
                  }`}
                >
                  SW
                </button>
              </div>

              <span className="text-white/15 text-xs">|</span>

              {/* Register */}
              <Link
                href="https://coopnet.coopbank.co.tz/Account/Register" target="_blank" rel="noopener"
                className="inline-flex items-center gap-1 text-[11px] text-white/55 hover:text-white transition-colors px-1.5"
              >
                <UserPlus className="h-3 w-3" />
                Register
              </Link>

              {/* Login to CoopNet */}
              <Link
                href="https://coopnet.coopbank.co.tz"
                className="inline-flex items-center gap-1.5 rounded bg-[#1A8A3A] px-3.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#14692D]"
              >
                <Lock className="h-3 w-3" />
                Login to CoopNet
              </Link>

              {/* Search */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1.5 rounded text-white/50 hover:text-white transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search bar overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-[52px] xl:top-11 bg-white shadow-lg z-50"
          >
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-4">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search accounts, loans, branches, services..."
                  className="flex-1 text-sm text-[#1A56A0] placeholder:text-gray-400 outline-none bg-transparent"
                  autoFocus
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-1 rounded text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  ROW 2 — Main Navigation (banking items with mega menus)         */}
      {/* ================================================================ */}
      <div
        className="bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex h-[52px] items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0 mr-6">
              <Image src="/images/coopbank-logo.png" alt="CoopBank Tanzania" width={140} height={48} className="h-10 w-auto" priority />
            </Link>

            {/* Mobile hamburger + actions */}
            <div className="xl:hidden ml-auto flex items-center gap-2">
              <Link
                href="https://coopnet.coopbank.co.tz"
                className="inline-flex items-center gap-1.5 rounded bg-[#1A8A3A] px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#14692D]"
              >
                <Lock className="h-3 w-3" />
                CoopNet
              </Link>
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1.5 rounded text-gray-400 hover:text-[#1A56A0] transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((v) => !v)}
                className="p-1.5 rounded text-[#1A56A0] hover:text-[#1A8A3A] transition-colors"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {mainNavItems.map((item, idx) => {
              const hasMega = !!item.megaMenu;
              const isActive = activeMega === item.label;
              const megaOpen = !!activeMega;

              const textCls = isActive
                ? "text-[#1A8A3A]"
                : "text-[#1A56A0] hover:text-[#1A8A3A]";

              return (
                <div
                  key={item.label}
                  className="relative hidden xl:flex items-center h-full"
                  onMouseEnter={() => {}}
                  onMouseLeave={() => {}}
                >
                  {idx > 0 && (
                    <span
                      className="h-4 w-px shrink-0 bg-gray-200"
                    />
                  )}

                  {hasMega ? (
                    <button
                      type="button"
                      onClick={() => setActiveMega(isActive ? null : item.label)}
                      className={`flex items-center gap-1 px-6 h-full text-[12.5px] font-semibold tracking-wide transition-colors duration-200 ${textCls} relative`}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-3 w-3 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`}
                      />
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-indicator"
                          className="absolute bottom-0 left-6 right-6 h-[2px] bg-[#00C853]"
                        />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center px-6 h-full text-[12.5px] font-semibold tracking-wide transition-colors duration-200 ${textCls}`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}

            {/* Right side of main nav — Open Account CTA (desktop) */}
            <div className="ml-auto hidden xl:flex items-center gap-3">
              {/* "Open an Account" CTA hidden per request — set to true to restore */}
              {false && (
                <Link
                  href="https://coopnet.coopbank.co.tz/Account/Register" target="_blank" rel="noopener"
                  className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[11px] font-bold transition-colors ${
                    activeMega
                      ? "bg-[#1A8A3A] text-white hover:bg-[#14692D]"
                      : scrolled
                      ? "bg-[#1A8A3A] text-white hover:bg-[#14692D]"
                      : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  }`}
                >
                  Open an Account
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  SAB-style Dark Mega Menu                                        */}
      {/* ================================================================ */}
      <AnimatePresence>
        {activeMega && activeMegaColumns && (
          <motion.div
            key={activeMega}
            variants={megaMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
            className="absolute inset-x-0 hidden xl:block bg-white border-t border-slate-200 shadow-2xl"
            style={{ top: "calc(44px + 52px)" }}
          >
            <div className="mx-auto max-w-[1440px] px-10 py-10">
              {/* Proportional grid: 3 content cols + 1 narrower CTA col */}
              <div
                className="grid items-start gap-x-8"
                style={{ gridTemplateColumns: activeCta ? "1fr 1fr 1fr 280px" : "1fr 1fr 1fr" }}
              >
                {activeMegaColumns.map((col) => (
                  <div key={col.title}>
                    <h4 className="mb-5 pb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 border-b border-slate-200">
                      {col.title}
                    </h4>
                    <ul className="space-y-0.5">
                      {col.items.map((item) => (
                        <li key={item.href + item.label}>
                          <Link
                            href={item.href}
                            onClick={() => setActiveMega(null)}
                            className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-slate-50"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 group-hover:bg-[#00C853] transition-colors" />
                            <div>
                              <span className="block text-[13px] font-medium text-slate-800 group-hover:text-[#00C853] transition-colors">
                                {item.label}
                              </span>
                              {item.desc && (
                                <span className="block mt-0.5 text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors leading-relaxed">
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

                {/* CTA card — right column with man image */}
                {activeCta && (
                  <div className="flex flex-col h-full justify-end">
                    <div className="relative rounded-xl bg-gradient-to-br from-[#1A8A3A]/90 to-[#00C853]/80 p-5 overflow-hidden min-h-[260px] flex flex-col justify-between">
                      {/* Man image */}
                      <div className="absolute -right-2 -bottom-2 w-64 h-80 pointer-events-none">
                        <Image src="/images/open-account-man.png" alt="" width={280} height={350} className="w-full h-full object-contain object-bottom" />
                      </div>
                      <div className="relative z-10 max-w-[55%]">
                        <p className="text-[14px] font-bold text-white mb-1.5">{activeCta.label}</p>
                        <p className="text-[11px] text-white/70 leading-relaxed">{activeCta.desc}</p>
                      </div>
                      <div className="relative z-10">
                        <Link
                          href={activeCta.href}
                          onClick={() => setActiveMega(null)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[10px] font-bold text-[#1A56A0] transition-all hover:bg-white/90 hover:gap-2.5"
                        >
                          {activeCta.label}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom row */}
              <div className="mt-8 border-t border-slate-200 pt-5 flex items-center justify-between">
                <Link
                  href={activeNavItem?.href ?? "/"}
                  onClick={() => setActiveMega(null)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1A8A3A] hover:text-[#0F3D7A] transition-colors"
                >
                  View all {activeMega?.toLowerCase()} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <div className="flex items-center gap-4">
                  <Link href="/branches" onClick={() => setActiveMega(null)} className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors">Find a Branch</Link>
                  <Link href="/faqs" onClick={() => setActiveMega(null)} className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors">FAQs</Link>
                  <Link href="/about-us#contact" onClick={() => setActiveMega(null)} className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors">Contact Us</Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark backdrop */}
      <AnimatePresence>
        {activeMega && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 -z-10 hidden xl:block bg-black/50"
            onClick={() => setActiveMega(null)}
          />
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/*  Announcement strip                                              */}
      {/* ================================================================ */}
      {!scrolled && !activeMega && (
        <div className="hidden xl:block bg-[#1A56A0]">
          <p className="py-2 text-center text-[11px] text-white/45 font-medium">
            Licensed by the Bank of Tanzania &bull; Serving Tanzania for 30+ years &bull; Ustawi kwa wote
          </p>
        </div>
      )}

      {/* ================================================================ */}
      {/*  Mobile Menu                                                     */}
      {/* ================================================================ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 top-[52px] z-40 xl:hidden bg-white overflow-y-auto"
          >
            <div className="px-5 py-4">
              {/* Mobile search */}
              <div className="flex items-center gap-3 bg-slate-100 rounded-lg px-4 py-3 mb-4">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input type="text" placeholder="Search..." className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent" />
              </div>

              {/* Mobile CoopNet + Register row */}
              <div className="flex gap-2 mb-5">
                <Link
                  href="https://coopnet.coopbank.co.tz"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#1A8A3A] px-4 py-3 text-sm font-bold text-white"
                >
                  <Lock className="h-4 w-4" />
                  Login to CoopNet
                </Link>
                <Link
                  href="https://coopnet.coopbank.co.tz/Account/Register" target="_blank" rel="noopener"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#1A56A0] px-4 py-3 text-sm font-bold text-white"
                >
                  <UserPlus className="h-4 w-4" />
                  Register
                </Link>
              </div>

              {/* Main nav items with mega submenus */}
              <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Banking</p>
              <div className="flex flex-col gap-0.5 mb-4">
                {mainNavItems.map((item, i) => {
                  const hasMega = !!item.megaMenu;
                  const isExpanded = mobileExpanded === item.label;

                  return (
                    <motion.div key={item.label} custom={i} variants={mobileItemVariants} initial="hidden" animate="visible">
                      {hasMega ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setMobileExpanded(isExpanded ? null : item.label)}
                            className={`flex w-full items-center justify-between rounded-lg px-4 py-3.5 text-sm font-bold transition-colors ${
                              isExpanded ? "text-[#1A8A3A] bg-slate-100" : "text-slate-900 hover:bg-slate-100"
                            }`}
                          >
                            {item.label}
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>

                          <AnimatePresence>
                            {isExpanded && item.megaMenu && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1, transition: { duration: 0.25, ease: "easeOut" as const } }}
                                exit={{ height: 0, opacity: 0, transition: { duration: 0.18, ease: "easeIn" as const } }}
                                className="overflow-hidden"
                              >
                                <div className="ml-4 border-l border-[#1A8A3A]/30 pl-3 pb-3 space-y-4 mt-1">
                                  {item.megaMenu.map((col) => (
                                    <div key={col.title}>
                                      <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{col.title}</p>
                                      {col.items.map((sub) => (
                                        <Link
                                          key={sub.href + sub.label}
                                          href={sub.href}
                                          onClick={() => setMobileOpen(false)}
                                          className="block rounded-md px-3 py-2 text-[13px] text-slate-600 font-medium transition-colors hover:bg-slate-100 hover:text-[#1A8A3A]"
                                        >
                                          {sub.label}
                                        </Link>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-lg px-4 py-3.5 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100"
                        >
                          {item.label}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Secondary links */}
              <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">More</p>
              <div className="flex flex-col gap-0.5">
                {[
                  { label: "About Us", href: "/about-us" },
                  { label: "Careers", href: "/careers" },
                  { label: "Tenders & Procurement", href: "/tenders" },
                  { label: "Whistleblower", href: "/whistleblower" },
                  { label: "In the News", href: "/news" },
                  { label: "FAQs", href: "/faqs" },
                  { label: "Find a Branch", href: "/branches" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm text-slate-600 font-medium transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile footer */}
              <div className="mt-6 border-t border-slate-200 pt-6 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-slate-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setLang("EN")}
                    className={`px-4 py-2 text-xs font-bold transition-colors ${lang === "EN" ? "bg-[#1A8A3A] text-white" : "text-slate-500"}`}
                  >EN</button>
                  <button
                    type="button"
                    onClick={() => setLang("SW")}
                    className={`px-4 py-2 text-xs font-bold transition-colors ${lang === "SW" ? "bg-[#1A8A3A] text-white" : "text-slate-500"}`}
                  >SW</button>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[11px] text-slate-500">+255 27 275 4470</p>
                  <p className="text-[11px] text-slate-500">info@cbtbank.co.tz</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
