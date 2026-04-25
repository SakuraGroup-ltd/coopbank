"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  BookOpen,
  DollarSign,
  Heart,
  Lightbulb,
  Globe,
  Search,
  FileText,
  Mail,
  Users,
  Award,
  ChevronDown,
  ChevronRight,
  MapPin,
  Clock,
  Calendar,
  Code,
  Briefcase,
  BarChart3,
  Megaphone,
  Shield,
  Handshake,
  GraduationCap,
  Sun,
  Cpu,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const heroStats = [
  { value: "500+", label: "Employees" },
  { value: "30+", label: "Roles Available" },
  { value: "15+", label: "Benefits" },
  { value: "98%", label: "Staff Retention" },
];

const featuredPositions = [
  "Senior Software Engineer",
  "AI/ML Analyst",
  "Youth Analyst",
];

interface Benefit {
  icon: React.ElementType;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: TrendingUp,
    title: "Career Growth & Advancement",
    description: "Structured career paths and promotions",
  },
  {
    icon: BookOpen,
    title: "Continuous Learning",
    description:
      "Access to training programs, workshops, and certifications",
  },
  {
    icon: DollarSign,
    title: "Competitive Compensation",
    description: "Market-competitive salary, medical, and pension",
  },
  {
    icon: Heart,
    title: "Work-Life Balance",
    description: "Flexible arrangements and wellness programs",
  },
  {
    icon: Lightbulb,
    title: "Innovation Culture",
    description: "Work on digital banking, fintech, and new products",
  },
  {
    icon: Globe,
    title: "Social Impact & Purpose",
    description: "Directly uplift Tanzanian communities daily",
  },
];

type ContractType = "Full-time" | "Internship" | "Consultancy";

interface JobListing {
  id: number;
  title: string;
  department: string;
  departmentIcon: React.ElementType;
  contractType: ContractType;
  location: string;
  closingDate: string;
  description: string;
}

const jobListings: JobListing[] = [
  {
    id: 1,
    title: "Senior Software Engineer \u2013 Digital Banking",
    department: "Technology",
    departmentIcon: Code,
    contractType: "Full-time",
    location: "Remote/Flexible",
    closingDate: "15 Apr 2026",
    description:
      "Lead development of digital banking platforms and mobile applications.",
  },
  {
    id: 2,
    title: "Branch Manager \u2013 Arusha Region",
    department: "Operations",
    departmentIcon: Briefcase,
    contractType: "Full-time",
    location: "Branch",
    closingDate: "10 Apr 2026",
    description:
      "Manage branch operations and drive business growth in Arusha region.",
  },
  {
    id: 3,
    title: "Credit Analyst \u2013 Corporate Banking",
    department: "Credit",
    departmentIcon: BarChart3,
    contractType: "Full-time",
    location: "Head Office",
    closingDate: "15 May 2026",
    description:
      "Analyze corporate credit applications and manage risk assessment.",
  },
  {
    id: 4,
    title: "Digital Marketing Specialist",
    department: "Marketing",
    departmentIcon: Megaphone,
    contractType: "Full-time",
    location: "Dodoma/Remote",
    closingDate: "30 Apr 2026",
    description:
      "Drive digital marketing campaigns and brand presence across channels.",
  },
  {
    id: 5,
    title: "Cybersecurity Analyst",
    department: "ICT Security",
    departmentIcon: Shield,
    contractType: "Full-time",
    location: "Head Office",
    closingDate: "31 May 2026",
    description:
      "Protect banking systems and ensure cybersecurity compliance.",
  },
  {
    id: 6,
    title: "Relationship Manager \u2013 SME Banking",
    department: "Business Banking",
    departmentIcon: Handshake,
    contractType: "Full-time",
    location: "Various",
    closingDate: "30 Apr 2026",
    description:
      "Build and manage relationships with SME banking clients.",
  },
  {
    id: 7,
    title: "Core Banking System Upgrade Consultant",
    department: "IT & Digital Transformation",
    departmentIcon: Cpu,
    contractType: "Consultancy",
    location: "Dodoma / Remote",
    closingDate: "May 2026",
    description:
      "Lead the evaluation, selection, and implementation of a modern core banking system. Must have 10+ years in banking IT transformation, experience with T24/Finacle/Flexcube preferred.",
  },
];

const applicationSteps = [
  {
    icon: Search,
    title: "Browse Openings",
    description: "Find a role that matches your skills and passion",
  },
  {
    icon: FileText,
    title: "Prepare Application",
    description: "CV, cover letter, relevant documents",
  },
  {
    icon: Mail,
    title: "Submit via Email",
    description: "Send application to hr@cbtbank.co.tz",
  },
  {
    icon: Users,
    title: "Interview & Selection",
    description: "HR contacts shortlisted candidates",
  },
  {
    icon: Award,
    title: "Offer & Onboarding",
    description: "Welcome to the CoopBank family!",
  },
];

const graduatePrograms = [
  {
    icon: GraduationCap,
    title: "Graduate Trainee Program",
    description:
      "12-month structured training across all departments",
  },
  {
    icon: Sun,
    title: "Internship Programmes",
    description: "3-6 months, ongoing intake for university students",
  },
  {
    icon: Cpu,
    title: "IT Attachment Program",
    description:
      "Technical attachment for ICT and computing students",
  },
];

const filterTabs: { label: string; value: "All" | ContractType }[] = [
  { label: "All", value: "All" },
  { label: "Full-time", value: "Full-time" },
  { label: "Internship", value: "Internship" },
  { label: "Consultancy", value: "Consultancy" },
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

export default function CareersPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | ContractType>("All");
  const [expandedJob, setExpandedJob] = useState<number | null>(null);

  const filteredJobs =
    activeFilter === "All"
      ? jobListings
      : jobListings.filter((j) => j.contractType === activeFilter);

  const toggleJob = (id: number) =>
    setExpandedJob((prev) => (prev === id ? null : id));

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
            <span className="text-white font-semibold">Careers</span>
          </motion.nav>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex justify-center mb-5">
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">+ Careers</span>
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center">
            Shape the Future of Banking
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
            At CoopBank Tanzania, we believe our people are our greatest asset. Join a team that is transforming financial services across Tanzania.
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  WHY WORK WITH US                                            */}
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
              Why Work With Us
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
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title}
                  variants={fadeUp}
                  custom={i}
                  className="group rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-accent/10 text-green-accent transition-colors group-hover:bg-green-accent group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-navy">
                    {b.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-body">
                    {b.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CURRENT OPENINGS                                            */}
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
              Current Openings
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-4 max-w-2xl text-body"
            >
              Click any opening to view full requirements and to submit your
              application.
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

          {/* Job cards */}
          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job) => {
                const Icon = job.departmentIcon;
                const isExpanded = expandedJob === job.id;
                return (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-bg shadow-sm"
                  >
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy/10 text-navy">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-navy">
                              {job.title}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-body">
                              <span className="inline-flex items-center gap-1 rounded-full bg-navy/10 px-3 py-0.5 text-xs font-semibold text-navy">
                                {job.department}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {job.location}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {job.contractType}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Apply by: {job.closingDate}
                              </span>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-body">
                              {job.description}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleJob(job.id)}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-navy/20 px-5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
                        >
                          View Requirements
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
                              {job.contractType === "Consultancy" && (
                                <div className="mb-5">
                                  <p className="mb-3 text-sm font-semibold text-navy">
                                    Key Requirements
                                  </p>
                                  <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-body">
                                    <li>10+ years of relevant banking IT consultancy experience, with at least 5 years in core banking system implementation or migration projects</li>
                                    <li>Hands-on experience with T24 (Temenos), Finacle (Infosys), or Flexcube (Oracle) strongly preferred</li>
                                    <li>PRINCE2, PMP, or equivalent project management certification preferred</li>
                                    <li>Strong understanding of banking operations, regulatory compliance, and data migration best practices</li>
                                    <li>Proven ability to manage cross-functional teams and stakeholder communication at executive level</li>
                                    <li>Experience working with financial institutions in East Africa is an added advantage</li>
                                  </ul>
                                </div>
                              )}
                              <p className="mb-4 text-sm font-semibold text-navy">
                                How to Apply
                              </p>
                              <p className="text-sm leading-relaxed text-body">
                                Send your CV, cover letter, and relevant
                                certificates to{" "}
                                <a
                                  href="mailto:hr@cbtbank.co.tz"
                                  className="font-semibold text-[#1A8A3A] underline"
                                >
                                  hr@cbtbank.co.tz
                                </a>{" "}
                                with the subject line:{" "}
                                <span className="font-semibold text-navy">
                                  &ldquo;Application &ndash; {job.title}&rdquo;
                                </span>
                                .
                              </p>
                              <p className="mt-3 text-sm text-body">
                                For inquiries, contact us at{" "}
                                <span className="font-semibold text-navy">
                                  +255 27 275 4470
                                </span>
                                .
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

            {filteredJobs.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-body">
                  No openings match the selected filter. Please try another
                  category.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  APPLICATION PROCESS                                         */}
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
              Application Process
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
      {/*  GRADUATE & INTERNSHIP PROGRAMS                              */}
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
              Graduate &amp; Internship Programs
            </motion.h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {graduatePrograms.map((prog, i) => {
              const Icon = prog.icon;
              return (
                <motion.div
                  key={prog.title}
                  variants={fadeUp}
                  custom={i}
                  className="group rounded-2xl border border-gray-100 bg-gray-bg p-8 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-navy/10 text-navy transition-colors group-hover:bg-[#1A8A3A] group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-navy">
                    {prog.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-body">
                    {prog.description}
                  </p>
                </motion.div>
              );
            })}
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
            Ready to Make an Impact?
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <a
              href="mailto:hr@cbtbank.co.tz"
              className="inline-flex items-center gap-2 rounded-full bg-[#00C853] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              Email Your Application
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
