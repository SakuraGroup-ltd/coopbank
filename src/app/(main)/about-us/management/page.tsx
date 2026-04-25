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
const managementTeam = [
  {
    name: "Mr. Godfrey J. Ng'urah",
    title: "Managing Director & CEO",
    image: "/images/management/mr-godfrey-j-ngurah.jpg",
  },
  {
    name: "Adv. Hassa S. Herith",
    title: "Head of Legal & Company Secretary",
    image: "/images/management/adv-hassa-s-herith.jpg",
  },
  {
    name: "CPA Kinyaki Obby Kinyaki",
    title: "Head of Finance & Strategy",
    image: "/images/management/cpa-kinyaki-obby-kinyaki.jpg",
  },
  {
    name: "Immaculatha Maro",
    title: "Head of Credit",
    image: "/images/management/immaculatha-maro.jpg",
  },
  {
    name: "Jackline Muro",
    title: "Head of Risk & Compliance",
    image: "/images/management/jackline-muro.jpg",
  },
  {
    name: "Mr. Hemed Nasoor",
    title: "Head of ICT & Innovation",
    image: "/images/management/mr-hemed-nasoor.jpg",
  },
  {
    name: "Mathew Msambayeti",
    title: "Human Resources Manager",
    image: "/images/management/mathew-msambayeti.jpg",
  },
  {
    name: "Yahya Kiyabo",
    title: "Head of Business & Co-operative Banking",
    image: "/images/management/yahya-kiyabo.jpg",
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
  featured = false,
}: {
  name: string;
  title: string;
  image: string;
  index: number;
  featured?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
      className={`group relative rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
        featured
          ? "border-2 border-[#1A8A3A]/30 ring-2 ring-[#1A8A3A]/10"
          : "border border-gray-200"
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
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Info */}
      <div className="px-3 py-3 text-center">
        <h3 className="text-sm font-bold text-[#1A1A2E] leading-tight mb-0.5">
          {name}
        </h3>
        <p
          className={`text-xs font-semibold ${
            featured ? "text-[#1A8A3A]" : "text-[#1A56A0]/70"
          }`}
        >
          {title}
        </p>
      </div>

      {featured && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#1A8A3A] to-[#1A56A0]" />
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function ManagementPage() {
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
            <span className="text-white/70">Management Team</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Management Team
          </h1>
        </div>
      </section>

      {/* Sidebar + Content */}
      <AboutUsSidebarShell>
        <FadeIn className="mb-10">
          <p className="text-[#4A5568] leading-relaxed text-lg max-w-2xl">
            Our executive management team drives the day-to-day operations and
            strategic execution of Cooperative Bank Tanzania Plc., ensuring
            excellence in service delivery across all branches.
          </p>
        </FadeIn>

        {/* All management in 3-column grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {managementTeam.map((member, i) => (
            <ProfileCard
              key={member.name}
              name={member.name}
              title={member.title}
              image={member.image}
              index={i}
              featured={i === 0}
            />
          ))}
        </div>
      </AboutUsSidebarShell>
    </>
  );
}
