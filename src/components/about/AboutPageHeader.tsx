"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { defaultAboutHeader } from "./about-defaults";

export default function AboutPageHeader({
  badge = defaultAboutHeader.badge,
  title = defaultAboutHeader.title,
  subtitle = defaultAboutHeader.subtitle,
  breadcrumb = defaultAboutHeader.breadcrumb,
}: {
  badge?: string;
  title?: string;
  subtitle?: string;
  breadcrumb?: string;
}) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: "1200px", backgroundRepeat: "repeat" }}
      />
      <div className="absolute inset-0 bg-[#1A56A0]/[0.99] pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.nav
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-sm text-white/50 mb-8"
        >
          <Link href="/" className="hover:text-white transition-colors font-medium">Home</Link>
          <ChevronRight size={14} className="text-white/30" />
          <span className="text-white font-semibold">{breadcrumb}</span>
        </motion.nav>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-5"
        >
          <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
            {badge}
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-white/60 max-w-2xl mx-auto text-lg leading-relaxed"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}
