"use client";

import { useState, useEffect, useRef } from "react";
// Public-facing tender shape. Names mirror the legacy Sheet columns so the
// rest of this file barely changes — but `description_html` and
// `document_url` are now Payload-fed and let Procurement push the full
// brief from /studio/tenders.
export type ClientTender = {
  tender_ref: string;
  tender_title: string;
  category: string;
  contract_type: string;
  published_date: string;
  closing_date: string;
  description: string;
  description_html: string;
  document_url: string;
  status: string;
};
// Inline helper — keeps this file independent of the Sheets module so we
// can fully retire @/lib/sheets once the remaining pages migrate.
function isTenderOpen(t: { status?: string; closing_date?: string }): boolean {
  if (t.status === "Closed" || t.status === "closed" || t.status === "draft") return false;
  if (!t.closing_date) return t.status === "Open" || t.status === "open";
  return new Date(t.closing_date) >= new Date(new Date().toDateString());
}
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ShoppingCart,
  HardHat,
  Package,
  Monitor,
  Server,
  ShieldCheck,
  ClipboardList,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  ArrowRight,
  Download,
  Award,
  Search,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TenderStatus = "Open" | "Closed";
type TenderCategory =
  | "IT Equipment"
  | "Services"
  | "Construction"
  | "Goods"
  | "IT Services";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const categoryConfig: Record<
  TenderCategory,
  { color: string; bg: string; icon: React.ElementType }
> = {
  "IT Equipment": { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: Monitor },
  Services: { color: "#1A56A0", bg: "rgba(13,56,117,0.1)", icon: ShieldCheck },
  Construction: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: HardHat },
  Goods: { color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: Package },
  "IT Services": { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: Server },
};

const applicationSteps = [
  {
    icon: Download,
    title: "Review Tender Notice",
    description: "Download the detailed tender notice and specifications",
  },
  {
    icon: ShoppingCart,
    title: "Purchase Tender Documents",
    description: "Obtain official documents from the Procurement Team",
  },
  {
    icon: Search,
    title: "Attend Site Visit / Meeting",
    description: "Attend mandatory site visits where applicable",
  },
  {
    icon: FileText,
    title: "Prepare & Submit Bid",
    description: "Submit sealed bid before the stated deadline",
  },
  {
    icon: Award,
    title: "Evaluation & Award",
    description: "CoopBank evaluates and awards the contract",
  },
];

const vendorRequirements = [
  "Must have a valid Certificate of Registration (BRELA)",
  "Tax Identification Number (TIN) and VAT compliance",
  "GST registration certificate (where applicable)",
  "Company must be in existence for at least 2 years with audited financial statements",
  "Family members of CoopBank staff must disclose their relationship",
  "Must have financial accounts audited for the current year",
  "Submit vendor registration via email with all attachments to whistleblow@cbtbank.co.tz",
];

type _FilterTab = "All Tenders" | "Open" | "Closed";

const filterTabs: { label: string; value: string }[] = [
  { label: "All Tenders", value: "All Tenders" },
  { label: "Open", value: "Open" },
  { label: "Closed", value: "Closed" },
];

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TendersClient({
  tenders,
  expandRef,
}: {
  tenders: ClientTender[];
  expandRef?: string;
}) {
  const [activeFilter, setActiveFilter] = useState<string>("All Tenders");
  const [expandedTender, setExpandedTender] = useState<string | null>(
    expandRef || null,
  );
  const focusedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!expandRef) return;
    const t = setTimeout(() => {
      focusedRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
    return () => clearTimeout(t);
  }, [expandRef]);

  const filteredTenders =
    activeFilter === "All Tenders"
      ? tenders
      : tenders.filter((t) => t.status === activeFilter);

  const toggleTender = (ref: string) =>
    setExpandedTender((prev) => (prev === ref ? null : ref));

  return (
    <>
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20">
        {/* Pattern background */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: "1200px", backgroundRepeat: "repeat" }} />
        <div className="absolute inset-0 bg-[#1A56A0]/[0.99] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <motion.nav initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link href="/" className="hover:text-white transition-colors font-medium">Home</Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white font-semibold">Tenders</span>
          </motion.nav>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex justify-center mb-5">
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">+ Procurement &amp; Tenders</span>
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center">
            Business Opportunities — Partner With Us
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
            CoopBank Tanzania is committed to fair, transparent, and competitive procurement. We invite qualified vendors to participate in our tendering process.
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CURRENT OPPORTUNITIES                                       */}
      {/* ============================================================ */}
      <section className="bg-white py-[var(--section-padding)]">
        <div className="mx-auto max-w-[var(--container-max)] px-6 sm:px-12">
          {/* Section header */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-extrabold text-navy sm:text-4xl"
            >
              Current Opportunities
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-4 max-w-2xl text-body"
            >
              Browse our open tenders and submit your bid before the closing
              date. Click any tender to view full requirements and documents.
            </motion.p>
          </motion.div>

          {/* Filter tabs */}
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
                  activeFilter === tab.value
                    ? "bg-[#1A8A3A] text-white"
                    : "bg-gray-bg text-navy hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tender cards */}
          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {filteredTenders.map((tender: ClientTender, idx: number) => {
                const config = categoryConfig[tender.category as keyof typeof categoryConfig] || { color: "#1A56A0", bg: "rgba(13,56,117,0.1)", icon: ClipboardList };
                const CategoryIcon = config.icon;
                const isExpanded = expandedTender === (tender.tender_ref || String(idx));
                const isFocused = expandRef && tender.tender_ref === expandRef;
                return (
                  <motion.div
                    key={tender.tender_ref || idx}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}
                    ref={isFocused ? focusedRef : undefined}
                    className={`overflow-hidden rounded-2xl border bg-gray-bg shadow-sm ${
                      isFocused ? "border-[#1A8A3A] ring-2 ring-[#1A8A3A]/15" : "border-gray-100"
                    }`}
                  >
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                            style={{
                              backgroundColor: config.bg,
                              color: config.color,
                            }}
                          >
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span
                                className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold"
                                style={{
                                  backgroundColor: config.bg,
                                  color: config.color,
                                }}
                              >
                                {tender.category}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${
                                  isTenderOpen(tender)
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {tender.status}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-navy">
                              {tender.tender_title}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-body">
                              <span className="inline-flex items-center gap-1">
                                <ClipboardList className="h-3.5 w-3.5" />
                                Ref: {tender.tender_ref}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" />
                                {tender.contract_type}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Published: {tender.published_date}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Closing: {tender.closing_date}
                              </span>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-body">
                              {tender.description}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleTender(tender.tender_ref || String(idx))}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-navy/20 px-5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
                        >
                          View Requirements &amp; Documents
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Expandable requirements */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
                              {/* Scope + requirements live in Payload now */}
                              {tender.description_html && (
                                <div className="mb-5">
                                  <p className="mb-3 text-sm font-semibold text-navy">
                                    Scope &amp; Requirements
                                  </p>
                                  <div
                                    className="prose prose-sm max-w-none text-body
                                               prose-headings:text-navy
                                               prose-strong:text-navy
                                               prose-a:text-[#1A8A3A]
                                               prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1.5
                                               prose-li:leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: tender.description_html }}
                                  />
                                </div>
                              )}
                              {tender.document_url && (
                                <p className="mb-4 text-sm">
                                  <a
                                    href={tender.document_url}
                                    target="_blank"
                                    rel="noopener"
                                    className="inline-flex items-center gap-1.5 font-semibold text-[#1A8A3A] underline"
                                  >
                                    Download tender document (PDF)
                                  </a>
                                </p>
                              )}
                              <p className="mb-4 text-sm font-semibold text-navy">
                                How to Participate
                              </p>
                              <p className="text-sm leading-relaxed text-body">
                                Submit your bid in a sealed envelope before the
                                closing date. Quotations may also be sent to the
                                Procurement Team below.
                              </p>
                              <p className="mt-3 text-sm text-body">
                                For inquiries, contact us at{" "}
                                <a
                                  href="mailto:procurement@cbtbank.co.tz"
                                  className="font-semibold text-[#1A8A3A] underline"
                                >
                                  procurement@cbtbank.co.tz
                                </a>{" "}
                                or call{" "}
                                <span className="font-semibold text-navy">
                                  +255 27 275 4470
                                </span>
                                .
                              </p>
                              <p className="mt-3 text-xs text-body/60">
                                Reference: {tender.tender_ref} | Closing:{" "}
                                {tender.closing_date}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredTenders.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-body">
                  No tenders match the selected filter. Please try another
                  category.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TENDER APPLICATION PROCESS                                   */}
      {/* ============================================================ */}
      <section className="bg-gray-bg py-[var(--section-padding)]">
        <div className="mx-auto max-w-[var(--container-max)] px-6 sm:px-12">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mb-16 text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-extrabold text-navy sm:text-4xl"
            >
              Tender Application Process
            </motion.h2>
          </motion.div>

          {/* 5-step horizontal flow */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5"
          >
            {applicationSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  custom={i}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Connector line (hidden on first item and mobile) */}
                  {i > 0 && (
                    <div className="absolute left-0 top-8 hidden h-0.5 w-full -translate-x-1/2 bg-green-accent/30 lg:block" />
                  )}

                  <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1A8A3A] text-white shadow-lg">
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="mb-1 text-xs font-bold tracking-wider text-[#1A8A3A] uppercase">
                    Step {i + 1}
                  </p>
                  <h3 className="mb-2 text-base font-bold text-navy">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-body">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BECOME A REGISTERED VENDOR                                   */}
      {/* ============================================================ */}
      <section className="bg-white py-[var(--section-padding)]">
        <div className="mx-auto max-w-[var(--container-max)] px-6 sm:px-12">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mb-16 text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-extrabold text-navy sm:text-4xl"
            >
              Become a Registered Vendor
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-4 max-w-2xl text-body"
            >
              To participate in CoopBank tenders, vendors must meet the following
              registration requirements.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto max-w-3xl"
          >
            <div className="rounded-2xl border border-gray-100 bg-gray-bg p-8 sm:p-10">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A8A3A]/10 text-[#1A8A3A]">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-navy">
                  Vendor Registration Requirements
                </h3>
              </div>

              <ul className="space-y-4">
                {vendorRequirements.map((req, i) => (
                  <motion.li
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1A8A3A]" />
                    <span className="text-sm leading-relaxed text-body">
                      {req}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-10 text-center">
                <a
                  href="mailto:whistleblow@cbtbank.co.tz?subject=Vendor%20Registration%20Application"
                  className="inline-flex items-center gap-2 rounded-full bg-[#00C853] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
                >
                  Register as Vendor
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA BANNER                                                  */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-navy-dark py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F3D7A] via-[#1A56A0] to-[#1A8A3A]" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full bg-green-accent/10 blur-[140px]" />

        <div className="relative z-10 mx-auto max-w-[var(--container-max)] px-6 text-center sm:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-extrabold text-white sm:text-4xl"
          >
            Have Questions About Our Tenders?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-5 max-w-xl text-lg text-white/70"
          >
            Our Procurement team is available Monday to Friday, 8:00 AM &ndash;
            5:00 PM.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60"
          >
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" />
              +255 27 275 4470
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              procurement@cbtbank.co.tz
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <a
              href="mailto:procurement@cbtbank.co.tz"
              className="inline-flex items-center gap-2 rounded-full bg-[#00C853] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              Email Procurement Team
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Back to Home
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
