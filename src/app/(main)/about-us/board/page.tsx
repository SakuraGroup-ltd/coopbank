"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AboutUsSidebarShell } from "../layout";

/* ------------------------------------------------------------------ */
/*  Animated wrapper                                                   */
/* ------------------------------------------------------------------ */
function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
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
const boardDirectors = [
  {
    name: "Dr. Joseph Ochieng Witts",
    title: "Board Chairman",
    image: "/images/board/dr-joseph-ochieng-witts.jpg",
  },
  {
    name: "Prof. Gervas M. Machimu",
    title: "Board Vice Chairman",
    image: "/images/board/prof-gervas-m-machimu.jpg",
  },
  {
    name: "Mr. Godfrey J. Ng'urah",
    title: "MD & CEO (Ex-Officio Board Member)",
    image: "/images/management/mr-godfrey-j-ngurah.jpg",
  },
  {
    name: "Adv. Hassa S. Herith",
    title: "Head of Legal & Company Secretary",
    image: "/images/board/adv-hassa-s-herith.jpg",
  },
  {
    name: "Adv. Silvanus Benedict Mlola",
    title: "Board Member",
    image: "/images/board/adv-silvanus-benedict-mlola.jpg",
  },
  {
    name: "CPA Lt. Col. Lucy Samson Chacha",
    title: "Board Member",
    image: "/images/board/cpa-lt-col-lucy-samson-chacha.jpg",
  },
  {
    name: "Dr. Aikande Clement Kwayu",
    title: "Board Member",
    image: "/images/board/dr-aikande-clement-kwayu.jpg",
  },
  {
    name: "Dr. Anthony F. Mveyange",
    title: "Board Member",
    image: "/images/board/dr-anthony-f-mveyange.jpg",
  },
  {
    name: "Dr. John M. Saus",
    title: "Board Member",
    image: "/images/board/dr-john-m-saus.jpg",
  },
  {
    name: "Mr. Mohamed N. Mwinguku",
    title: "Board Member",
    image: "/images/board/mr-mohamed-n-mwinguku.jpg",
  },
  {
    name: "Mr. Peter Situmbeko Nalitolela",
    title: "Board Member",
    image: "/images/board/mr-peter-situmbeko-nalitolela.jpg",
  },
  {
    name: "Mr. Pius N. Killo",
    title: "Board Member",
    image: "/images/board/mr-pius-n-killo.jpg",
  },
  {
    name: "Prof. Geraldine A. Rashel",
    title: "Board Member",
    image: "/images/board/prof-geraldine-a-rashel.jpg",
  },
];

/* ------------------------------------------------------------------ */
/*  Profile Card                                                       */
/* ------------------------------------------------------------------ */
function ProfileCard({
  name,
  title,
  image,
  index,
}: {
  name: string;
  title: string;
  image: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const isLeadership = index < 2;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
      className={`group relative rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
        isLeadership ? "border-2 border-[#1A8A3A]/20" : "border border-gray-200"
      }`}
    >
      {/* Photo */}
      <div className="relative w-full aspect-square bg-gradient-to-b from-[#1A56A0]/5 to-[#1A56A0]/10 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Info */}
      <div className="px-3 py-3 text-center">
        <h3 className="text-sm font-bold text-[#1A1A2E] leading-tight mb-0.5">
          {name}
        </h3>
        <p className={`text-xs font-semibold ${isLeadership ? "text-[#1A8A3A]" : "text-[#1A56A0]/70"}`}>
          {title}
        </p>
      </div>

      {/* Leadership accent bar */}
      {isLeadership && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#1A8A3A] to-[#1A56A0]" />
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function BoardPage() {
  return (
    <>
      {/* Sub-page header */}
      <section className="bg-gradient-to-br from-[#0F3D7A] via-[#1A56A0] to-[#0F3D7A] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link
              href="/about-us"
              className="hover:text-white/70 transition-colors"
            >
              About Us
            </Link>
            <ChevronRight size={14} />
            <span className="text-white/70">Board of Directors</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Board of Directors
          </h1>
        </div>
      </section>

      {/* Sidebar + Content */}
      <AboutUsSidebarShell>
        <FadeIn className="mb-10">
          <p className="text-[#4A5568] leading-relaxed text-lg max-w-2xl">
            The Board of Directors provides strategic oversight and governance to
            ensure Cooperative Bank Tanzania Plc. fulfills its mission of
            empowering communities through inclusive banking.
          </p>
        </FadeIn>

        {/* All board members in 3-column grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {boardDirectors.map((director, i) => (
            <ProfileCard
              key={director.name}
              name={director.name}
              title={director.title}
              image={director.image}
              index={i}
            />
          ))}
        </div>
      </AboutUsSidebarShell>
    </>
  );
}
