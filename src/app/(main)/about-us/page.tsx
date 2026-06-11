"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Target,
  Eye,
  Users,
  Shield,
  Zap,
  Lightbulb,
  Heart,
  Building2,
  Phone,
  ChevronRight,
  TrendingUp,
  MapPin,
  Award,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AboutUsSidebarShell } from "./layout";

/* ------------------------------------------------------------------ */
/*  Animated wrapper                                                   */
/* ------------------------------------------------------------------ */
function FadeIn({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const heroStats = [
  { value: "25+", label: "Years of Service" },
  { value: "4", label: "Active Branches" },
  { value: "30+", label: "Branches (Target)" },
  { value: "2024", label: "Merger Milestone" },
];

const coreValues = [
  {
    icon: Users,
    title: "Team Player",
    description: "Collaborate openly, support others. Listen actively, show respect.",
  },
  {
    icon: Zap,
    title: "Agility",
    description: "Embrace change, adapt quickly. Stay flexible, drive innovation.",
  },
  {
    icon: Shield,
    title: "Accountability",
    description: "Own our actions, show integrity. Be transparent, keep learning.",
  },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function AboutUsPage() {
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
          <motion.nav
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-sm text-white/50 mb-8"
          >
            <Link href="/" className="hover:text-white transition-colors font-medium">Home</Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white font-semibold">About Us</span>
          </motion.nav>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
              + About Us
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center"
          >
            Banking Built on Trust
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center text-white/60 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            For over 25 years, Cooperative Bank Tanzania Plc. has been rooted in the cooperative movement — empowering individuals, businesses, and communities across Tanzania.
          </motion.p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SIDEBAR + CONTENT                                           */}
      {/* ============================================================ */}
      <AboutUsSidebarShell>
        {/* Bank Prayer */}
        <FadeIn className="mb-14" id="bank-prayer">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-5">
            Bank Prayer
          </h2>
          <div className="rounded-2xl border border-[#1A56A0]/20 bg-[#f4f6f9] px-8 py-10 text-center space-y-5" style={{ fontVariant: "small-caps" }}>
            <p className="text-[#2D3748] leading-relaxed font-medium">
              Ewe Mwenyezi Mungu Muumba wa Mbingu na Nchi,<br />
              Tunakushukuru kwa Kutujalia Kuiona Siku ya Leo.
            </p>
            <p className="text-[#2D3748] leading-relaxed font-medium">
              Tunakuomba Utujalie Amani, Upendo na Ushirikiano<br />
              Tunapoanza Siku Yetu ya Leo.
            </p>
            <p className="text-[#2D3748] leading-relaxed font-medium">
              Tunakuomba Uwape Busara na Hekima Viongozi<br />
              Wetu, Waweze Kutuongoza Vema na Kutoa Maamuzi<br />
              Sahihi Yatakayo Inufaisha Benki, Wafanyakazi na<br />
              Jamii kwa Ujumla ili Benki Iendelee Kustawi.
            </p>
            <p className="text-[#2D3748] leading-relaxed font-medium">
              Tunakuomba Utujalie Uwezo wa Kufanya Kazi<br />
              kwa Bidii, Maarifa na kwa Kujituma kwa Kufuata<br />
              Taratibu Zote ili Kuepuka Hasara Zinazoweza<br />
              Kujitokeza.
            </p>
            <p className="text-[#2D3748] leading-relaxed font-medium">
              Tunaiombea Amani Nchi Yetu ya Tanzania,<br />
              Wateja na Wadau Wote wa Benki ili<br />
              Tuendelee Kutoa Huduma kwa Tija na Ufanisi.
            </p>
            <p className="text-[#2D3748] leading-relaxed font-medium">
              Eeh Mwenyezi Mungu Tunaomba Tuianze na<br />
              Kumaliza Siku Hii ya Leo Chini ya Uangalizi Wako.
            </p>
            <p className="text-2xl font-extrabold text-[#1A56A0] tracking-widest mt-4">
              Amina
            </p>
          </div>
        </FadeIn>

        {/* Divider */}
        <div className="border-t border-gray-200 my-10" />

        {/* Our Story */}
        <FadeIn className="mb-14" id="our-story">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-5">
            Our Story
          </h2>
          <div className="prose prose-lg max-w-none text-[#4A5568] leading-relaxed space-y-4">
            <p>
              Cooperative Bank Tanzania Plc was established in the 1990s to serve
              the financial needs of cooperative societies and their members across
              Tanzania. Founded on the principles of self-help, mutual
              responsibility, and community ownership, the Bank remains committed
              to providing inclusive and accessible financial services.
            </p>
            <p>
              Over the years, the Bank has continuously modernized its services
              through digital solutions such as CoopNet Internet Banking, the
              CoopPesa Mobile App, and CoopWakala agency banking, strengthening its
              mission of expanding financial inclusion, particularly in rural and
              underserved communities.
            </p>
            <p>
              A major milestone in the Bank&apos;s growth was achieved in 2024
              following the merger of Kilimanjaro Cooperative Bank Limited (KCBL)
              and Tandahimba Community Bank Limited (TCBL), forming Cooperative
              Bank Tanzania. This strategic merger strengthened the Bank&apos;s
              capacity to serve cooperative institutions, SMEs, farmers, and retail
              customers nationwide.
            </p>
            <p>
              Today, Coop Bank Tanzania continues to embrace innovation and digital
              transformation while building a strong branch and agency network,
              with a long-term target of establishing over 30 branches nationwide.
            </p>
          </div>
        </FadeIn>

        {/* Divider */}
        <div className="border-t border-gray-200 my-10" />

        {/* Branch Network */}
        <FadeIn className="mb-14" id="branch-network">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-3">
            Our Branch Network
          </h2>
          <p className="text-[#4A5568] mb-8">
            Growing our presence across Tanzania — from established branches to exciting new locations on the horizon.
          </p>
          {/* Active branch location boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {["Dodoma", "Mtwara", "Tabora", "Moshi"].map((branch, i) => (
              <FadeIn key={branch} delay={i * 0.08}>
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#1A8A3A]/20 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#1A8A3A]/40 transition-all text-center">
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#1A8A3A]/10">
                    <MapPin size={20} className="text-[#1A8A3A]" />
                  </span>
                  <span className="text-sm font-bold text-[#1A1A2E]">{branch}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#1A8A3A]">Open</span>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Coming soon */}
          <div className="rounded-2xl border border-dashed border-[#1A56A0]/30 bg-[#f4f6f9] px-7 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#1A56A0]/10 flex-shrink-0">
              <TrendingUp size={18} className="text-[#1A56A0]" />
            </span>
            <p className="text-sm text-[#4A5568] leading-relaxed">
              <span className="font-semibold text-[#1A1A2E]">Coming soon — </span>
              We are launching new branches in <span className="font-semibold text-[#1A56A0]">Kagera</span>, <span className="font-semibold text-[#1A56A0]">Mbeya</span>, <span className="font-semibold text-[#1A56A0]">Mwanza</span>, and <span className="font-semibold text-[#1A56A0]">Dar es Salaam</span> between Q3 2026 and Q2 2027, with more locations planned as part of our continued national growth strategy.
            </p>
          </div>
        </FadeIn>

        {/* Divider */}
        <div className="border-t border-gray-200 my-10" />

        {/* Our Journey — Artistic Timeline */}
        <FadeIn className="mb-14" id="our-journey">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-3">
            Our Journey
          </h2>
          <p className="text-[#4A5568] mb-10">
            Key milestones in the growth of Cooperative Bank Tanzania.
          </p>

          {/* SVG curved path timeline */}
          <div className="relative">
            {/* Curved connector — visible on lg only */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
              preserveAspectRatio="none"
              viewBox="0 0 900 300"
              fill="none"
            >
              <path
                d="M60 250 C180 250, 180 50, 300 50 C420 50, 420 250, 540 250 C660 250, 660 50, 780 50"
                stroke="url(#timeline-grad)"
                strokeWidth="2.5"
                strokeDasharray="8 4"
                fill="none"
              />
              <defs>
                <linearGradient id="timeline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1A8A3A" />
                  <stop offset="50%" stopColor="#1A56A0" />
                  <stop offset="100%" stopColor="#1A8A3A" />
                </linearGradient>
              </defs>
            </svg>

            {/* Cards in alternating up/down positions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {[
                {
                  year: "1990s",
                  title: "Bank Established",
                  desc: "Cooperative Bank Tanzania established to serve cooperative societies and SACCOs, built on self-help, mutual responsibility, and community ownership.",
                  position: "bottom",
                  color: "#1A8A3A",
                },
                {
                  year: "2023",
                  title: "Banking License",
                  desc: "COOP Bank granted a full commercial banking license by the Bank of Tanzania in 2023, marking a key milestone in establishing a modern, member-centred institution.",
                  position: "top",
                  color: "#1A56A0",
                },
                {
                  year: "2024",
                  title: "Strategic Merger",
                  desc: "KCBL and TCBL merged to form Cooperative Bank Tanzania, strengthening capacity to serve SMEs, farmers, and retail customers nationwide.",
                  position: "bottom",
                  color: "#1A56A0",
                },
                {
                  year: "2026+",
                  title: "National Expansion",
                  desc: "New branches launching in Kagera, Mbeya, Mwanza, and Dar es Salaam — part of a long-term target of 30+ branches nationwide.",
                  position: "top",
                  color: "#1A8A3A",
                },
              ].map((item, i) => (
                <FadeIn key={item.year} delay={i * 0.15}>
                  <div className={`flex flex-col items-center ${item.position === "top" ? "lg:pt-0 lg:pb-24" : "lg:pt-24 lg:pb-0"}`}>
                    {/* Year circle */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg mb-4"
                      style={{ backgroundColor: item.color, boxShadow: `0 0 0 6px ${item.color}18, 0 4px 15px ${item.color}30` }}
                    >
                      {item.year}
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow text-center w-full">
                      <h3 className="text-sm font-bold text-[#1A1A2E] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#4A5568] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Divider */}
        <div className="border-t border-gray-200 my-10" />

        {/* Mission & Vision */}
        <FadeIn className="mb-14" id="mission-vision">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-8">
            Mission &amp; Vision
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Mission */}
            <div className="rounded-2xl border border-gray-100 bg-[#f4f6f9] p-8">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A56A0]/10 mb-5">
                <Target size={24} className="text-[#1A56A0]" />
              </span>
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-3">
                Our Mission
              </h3>
              <p className="text-[#4A5568] leading-relaxed">
                Provide tailored financial solutions, powered by innovation and
                technology to deliver financial inclusion, member experience and
                value creation to stakeholders.
              </p>
            </div>

            {/* Vision */}
            <div className="rounded-2xl border border-gray-100 bg-[#f4f6f9] p-8">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A8A3A]/10 mb-5">
                <Eye size={24} className="text-[#1A8A3A]" />
              </span>
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-3">
                Our Vision
              </h3>
              <p className="text-[#4A5568] leading-relaxed">
                To be a leading high-end technology and member-centred Coop
                Bank, driving financial inclusion.
              </p>
            </div>
          </div>

          {/* Bank Purpose banner */}
          <div className="rounded-2xl bg-gradient-to-r from-[#1A56A0] to-[#1A8A3A] p-6 flex items-center gap-5">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 flex-shrink-0">
              <TrendingUp size={22} className="text-white" />
            </span>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Bank Purpose</p>
              <p className="text-white font-semibold text-base leading-relaxed">Driving socio-economic transformation of our members through financial inclusion initiatives and AI-powered digital innovations to empower and impact livelihoods of ten million families by 2030.</p>
            </div>
          </div>
        </FadeIn>

        {/* Divider */}
        <div className="border-t border-gray-200 my-10" />

        {/* Core Values */}
        <FadeIn id="core-values">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-8">
            Core Values
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {coreValues.map((value, i) => (
              <FadeIn key={value.title} delay={i * 0.08}>
                <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-[#f4f6f9] p-6 h-full">
                  <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#1A8A3A]/10 flex items-center justify-center mt-0.5">
                    <value.icon size={20} className="text-[#1A8A3A]" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#1A1A2E] mb-1">
                      {value.title}
                    </h3>
                    <p className="text-sm text-[#4A5568] leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </AboutUsSidebarShell>
    </>
  );
}
