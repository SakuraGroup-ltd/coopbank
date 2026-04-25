"use client";

import { motion } from "framer-motion";
import { ArrowRight, Home, Phone } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      {/* Hero-style 404 section */}
      <section className="relative overflow-hidden pt-32 pb-24 sm:pt-36 sm:pb-32">
        {/* Pattern background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/images/pattern-bg.jpg')",
            backgroundSize: "1200px",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="absolute inset-0 bg-[#1A56A0]/[0.99] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          {/* Animated 404 number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6"
          >
            <span className="text-[140px] sm:text-[180px] lg:text-[220px] font-extrabold leading-none bg-gradient-to-b from-white/25 to-white/5 bg-clip-text text-transparent select-none">
              404
            </span>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-5 -mt-16"
          >
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
              Page Not Found
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5"
          >
            This page took a detour
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white/60 max-w-xl mx-auto text-lg leading-relaxed mb-10"
          >
            The page you are looking for might have been moved, renamed, or
            is temporarily unavailable. Let us help you find your way back.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1A8A3A] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#00C853]"
            >
              <Home size={16} />
              Back to Home
            </Link>
            <Link
              href="/branches"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <Phone size={16} />
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick links section */}
      <section className="bg-[#F2F4F8] py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-[#0F3D7A] mb-3">
              Where would you like to go?
            </h2>
            <p className="text-[#0F3D7A]/60">
              Here are some helpful pages to get you back on track.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              {
                title: "Personal Banking",
                desc: "Savings, current accounts, and fixed deposits",
                href: "/personal-banking",
              },
              {
                title: "Loan Products",
                desc: "Personal, business, and agricultural loans",
                href: "/loan-products",
              },
              {
                title: "Digital Banking",
                desc: "CoopEsa, CoopNet, USSD, and QR Pay",
                href: "/digital-banking",
              },
              {
                title: "Branch Locator",
                desc: "Find a branch near you",
                href: "/branches",
              },
              {
                title: "Careers",
                desc: "Join the CoopBank team",
                href: "/careers",
              },
              {
                title: "About Us",
                desc: "Our story, mission, and values",
                href: "/about-us",
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between rounded-xl border border-[#0F3D7A]/10 bg-white p-5 transition-all hover:border-[#1A8A3A]/30 hover:shadow-lg"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0F3D7A] group-hover:text-[#1A8A3A] transition-colors">
                    {link.title}
                  </p>
                  <p className="text-xs text-[#0F3D7A]/50 mt-1">{link.desc}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-[#0F3D7A]/20 group-hover:text-[#1A8A3A] transition-colors shrink-0 ml-3"
                />
              </Link>
            ))}
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
}
