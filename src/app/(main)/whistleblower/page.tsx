"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Phone,
  Mail,
  FileText,
  Users,
  Landmark,
  Wifi,
  Scale,
  Banknote,
  UserX,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Upload,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */


interface MisconductType {
  icon: React.ElementType;
  title: string;
  description: string;
}

const misconductTypes: MisconductType[] = [
  {
    icon: Banknote,
    title: "Fraud & Financial Crime",
    description:
      "Suspicious transactions, embezzlement, money laundering, forgery, unauthorized account access, fictitious loans, or financial irregularities involving bank funds or customer assets.",
  },
  {
    icon: UserX,
    title: "Corruption & Bribery",
    description:
      "Bribes to vendors, conflicts of interest, kickbacks for personal gain, or financial irregularities including procurement misuse.",
  },
  {
    icon: Landmark,
    title: "Regulatory Violations",
    description:
      "Breaches of Bank of Tanzania regulations, AML/CTF non-compliance, Know-Your-Customer (KYC) violations, or failure to report suspicious transactions.",
  },
  {
    icon: AlertTriangle,
    title: "Workplace Misconduct",
    description:
      "Harassment, discrimination, bullying, unsafe working conditions, substance abuse, falsification of records, unauthorized disclosure of confidential customer or bank information.",
  },
  {
    icon: Wifi,
    title: "Cybersecurity Threats",
    description:
      "Unauthorized access to banking systems, data breaches, deliberate IT sabotage, sharing of system credentials, phishing attempts originating from within, or misuse of customer data.",
  },
  {
    icon: Scale,
    title: "Governance Failures",
    description:
      "Board or management decisions that violate the bank\u2019s charter, conflict of interest in decision-making, non-compliance with internal policies, or failure to disclose material information.",
  },
];

interface ReportingChannel {
  icon: React.ElementType;
  title: string;
  description: string;
  detail: string;
}

const reportingChannels: ReportingChannel[] = [
  {
    icon: Mail,
    title: "Confidential Email",
    description:
      "Send a detailed, written report to whistleblow@cbtbank.co.tz \u2014 include dates, names, locations, and supporting evidence.",
    detail: "whistleblow@cbtbank.co.tz",
  },
  {
    icon: Phone,
    title: "Confidential Hotline",
    description:
      "Dedicated confidential hotline operated by an independent third party. Available 24 hours, 7 days a week.",
    detail: "+255 27 275 4470 (Ext. 200)",
  },
  {
    icon: FileText,
    title: "Written Letter",
    description:
      "Submit a sealed, written report marked CONFIDENTIAL to the Head of Internal Audit, CoopBank HQ, P.O. Box 4040, Dar es Salaam.",
    detail: "P.O. Box 4040, Dar es Salaam",
  },
  {
    icon: Users,
    title: "In-Person Meeting",
    description:
      "Request a private, face-to-face meeting with the Head of Internal Audit or the Board Audit Committee Member. Contact Internal Audit to schedule.",
    detail: "+255 27 275 4470 Ext. 201",
  },
];

const protectionGuarantees = [
  "Your identity will be kept strictly confidential and shared only on a need-to-know basis",
  "Reports can be made anonymously \u2014 you are not required to identify yourself",
  "Regular updates on investigation progress if you provide contact details",
  "Board Audit Committee oversight ensures independence of investigations",
  "No retaliation, harassment, demotion, or dismissal for making a good faith report",
  "Independent investigation by Internal Audit, separate from management chain",
  "Your identity will be protected under all applicable laws and policies",
  "Protection under the Tanzania Whistleblower and Witness Protection Act",
  "Right to escalate to Bank of Tanzania or law enforcement if not satisfied with internal response",
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
/*  Whistleblower Form Component                                       */
/* ------------------------------------------------------------------ */

const reportTypes = [
  "Fraud & Financial Crime",
  "Corruption & Bribery",
  "Regulatory Violations",
  "Workplace Misconduct",
  "Cybersecurity Threats",
  "Governance Failures",
  "Other",
];

function WhistleblowerForm() {
  const [formData, setFormData] = useState({
    reportType: "",
    subject: "",
    description: "",
    incidentDate: "",
    location: "",
    name: "",
    email: "",
    phone: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `WB-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    setRefNumber(ref);
    setSubmitted(true);
  };

  return (
    <section className="bg-gray-bg py-[var(--section-padding)]">
      <div className="mx-auto max-w-[var(--container-max)] px-6 sm:px-12">
        {/* Section header */}
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
            Submit a Report Online
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="mx-auto mt-4 max-w-2xl text-body"
          >
            Use this secure form to submit your report directly. All submissions are encrypted and confidential.
          </motion.p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          {submitted ? (
            <div className="rounded-2xl bg-white p-8 shadow-sm sm:p-10 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1A8A3A]/10">
                <CheckCircle2 className="h-8 w-8 text-[#1A8A3A]" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">Report Submitted Successfully</h3>
              <p className="text-body mb-4">
                Your report has been submitted securely. Reference number:
              </p>
              <p className="text-2xl font-extrabold text-[#1A8A3A]">{refNumber}</p>
              <p className="mt-4 text-sm text-body/70">
                Please save this reference number for your records. If you provided contact details, the Internal Audit department may reach out for further information.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm sm:p-10 space-y-6">
              {/* Report Type */}
              <div>
                <label htmlFor="reportType" className="block text-sm font-semibold text-navy mb-2">
                  Report Type <span className="text-[#1A8A3A]">*</span>
                </label>
                <select
                  id="reportType"
                  name="reportType"
                  required
                  value={formData.reportType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-bg px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-[#1A8A3A] focus:ring-1 focus:ring-[#1A8A3A]"
                >
                  <option value="">Select a report type...</option>
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-navy mb-2">
                  Subject <span className="text-[#1A8A3A]">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief summary of the incident"
                  className="w-full rounded-lg border border-gray-200 bg-gray-bg px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-[#1A8A3A] focus:ring-1 focus:ring-[#1A8A3A] placeholder:text-gray-400"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-navy mb-2">
                  Detailed Description <span className="text-[#1A8A3A]">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide as much detail as possible including what happened, who was involved, and any evidence you are aware of..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-bg px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-[#1A8A3A] focus:ring-1 focus:ring-[#1A8A3A] placeholder:text-gray-400 resize-none"
                />
              </div>

              {/* Date & Location row */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="incidentDate" className="block text-sm font-semibold text-navy mb-2">
                    Date of Incident
                  </label>
                  <input
                    type="date"
                    id="incidentDate"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-gray-bg px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-[#1A8A3A] focus:ring-1 focus:ring-[#1A8A3A]"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-navy mb-2">
                    Location / Department
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. HQ, Dar es Salaam Branch"
                    className="w-full rounded-lg border border-gray-200 bg-gray-bg px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-[#1A8A3A] focus:ring-1 focus:ring-[#1A8A3A] placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Supporting Evidence
                </label>
                <div className="relative rounded-lg border-2 border-dashed border-gray-200 bg-gray-bg p-6 text-center transition-colors hover:border-[#1A8A3A]/40">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-body">
                    {file ? (
                      <span className="font-medium text-[#1A8A3A]">{file.name}</span>
                    ) : (
                      <>
                        <span className="font-medium text-[#1A8A3A] cursor-pointer">Click to upload</span> or drag and drop
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Attach documents, screenshots, or other evidence. Max 10MB.</p>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Contact Details (Optional) */}
              <div className="rounded-lg border border-gray-100 bg-gray-bg/50 p-6">
                <h4 className="text-sm font-bold text-navy mb-1">Contact Details (Optional)</h4>
                <p className="text-xs text-body mb-5">
                  Providing contact details is optional. If you wish to remain anonymous, leave these fields blank.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-navy mb-1.5">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-navy outline-none transition-colors focus:border-[#1A8A3A] focus:ring-1 focus:ring-[#1A8A3A] placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-navy mb-1.5">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-navy outline-none transition-colors focus:border-[#1A8A3A] focus:ring-1 focus:ring-[#1A8A3A] placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-navy mb-1.5">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-navy outline-none transition-colors focus:border-[#1A8A3A] focus:ring-1 focus:ring-[#1A8A3A] placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#1A8A3A] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#00C853]"
                >
                  <Shield className="h-4 w-4" />
                  Submit Report Securely
                </button>
                <p className="mt-4 text-center text-xs leading-relaxed text-body/70">
                  Your report is encrypted and will be reviewed only by the Internal Audit department. Your identity, if provided, is protected under the Tanzania Whistleblower and Witness Protection Act.
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function WhistleblowerPage() {
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
            <span className="text-white font-semibold">Whistleblower</span>
          </motion.nav>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex justify-center mb-5">
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">+ Ethics &amp; Integrity</span>
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center">
            Speak Up Safely &amp; Confidentially
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
            CoopBank Tanzania provides a safe, confidential channel to report suspected misconduct, fraud, or unethical behavior without fear of retaliation.
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TYPES OF REPORTABLE MISCONDUCT                              */}
      {/* ============================================================ */}
      <section className="bg-gray-bg py-[var(--section-padding)]">
        <div className="mx-auto max-w-[var(--container-max)] px-6 sm:px-12">
          {/* Section header */}
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
              Types of Reportable Misconduct
            </motion.h2>
          </motion.div>

          {/* 3x2 grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {misconductTypes.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  custom={i}
                  className="group rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-accent/10 text-green-accent transition-colors group-hover:bg-green-accent group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-navy">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-body">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW TO REPORT                                               */}
      {/* ============================================================ */}
      <section className="bg-white py-[var(--section-padding)]">
        <div className="mx-auto max-w-[var(--container-max)] px-6 sm:px-12">
          {/* Section header */}
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
              How to Report
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-4 max-w-2xl text-body"
            >
              Choose any of the following secure channels to submit your report.
              You may report anonymously.
            </motion.p>
          </motion.div>

          {/* 4-method grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-8 sm:grid-cols-2"
          >
            {reportingChannels.map((channel, i) => {
              const Icon = channel.icon;
              return (
                <motion.div
                  key={channel.title}
                  variants={fadeUp}
                  custom={i}
                  className="group rounded-2xl border border-gray-100 bg-gray-bg p-8 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-navy/10 text-navy transition-colors group-hover:bg-[#1A8A3A] group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-navy">
                    {channel.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-body">
                    {channel.description}
                  </p>
                  <p className="text-sm font-semibold text-[#1A8A3A]">
                    {channel.detail}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  ONLINE SUBMISSION FORM                                      */}
      {/* ============================================================ */}
      <WhistleblowerForm />

      {/* ============================================================ */}
      {/*  PROTECTION GUARANTEES                                       */}
      {/* ============================================================ */}
      <section className="bg-gray-bg py-[var(--section-padding)]">
        <div className="mx-auto max-w-[var(--container-max)] px-6 sm:px-12">
          {/* Section header */}
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
              Your Protection is Guaranteed
            </motion.h2>
          </motion.div>

          {/* Guarantees card */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto max-w-3xl"
          >
            <div className="rounded-2xl bg-white p-8 shadow-sm sm:p-10">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-accent/10 text-green-accent">
                  <Shield className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy">
                    Your Safety is Our Priority
                  </h3>
                  <p className="text-sm text-body">
                    CoopBank upholds the following guarantees for every
                    whistleblower
                  </p>
                </div>
              </div>

              <ul className="space-y-4">
                {protectionGuarantees.map((guarantee, i) => (
                  <motion.li
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-accent" />
                    <span className="text-sm leading-relaxed text-body">
                      {guarantee}
                    </span>
                  </motion.li>
                ))}
              </ul>
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
            Your Report Matters
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-4 max-w-xl text-white/70"
          >
            Every report helps protect the integrity of our bank, our customers,
            and our communities. Your courage makes a difference.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <a
              href="mailto:whistleblow@cbtbank.co.tz"
              className="inline-flex items-center gap-2 rounded-full bg-[#00C853] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              Report via Email
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
