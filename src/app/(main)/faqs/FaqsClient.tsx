"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, MessageCircle, Phone, Mail } from "lucide-react";
import Link from "next/link";
import type { Faq } from "@/lib/sheets";

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left focus:outline-none"
      >
        <span
          className={`text-base font-semibold transition-colors duration-200 ${
            open ? "text-[#1A8A3A]" : "text-[#1A56A0]"
          }`}
        >
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`flex-shrink-0 transition-colors duration-200 ${
            open ? "text-[#1A8A3A]" : "text-[#1A56A0]/50"
          }`}
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-8 text-[#4A5568] text-sm leading-relaxed whitespace-pre-line">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqsClient({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => f.category && set.add(f.category));
    return ["All", ...Array.from(set)];
  }, [faqs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      if (activeCategory !== "All" && f.category !== activeCategory) return false;
      if (!q) return true;
      return (
        f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      );
    });
  }, [faqs, query, activeCategory]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20 bg-[#0F3D7A]">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: "url('/images/pattern-bg.jpg')",
            backgroundSize: "1200px",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 sm:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00C853] mb-3">
            Help &amp; Support
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight max-w-3xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-2xl">
            Quick answers about accounts, loans, digital banking, cards, and branches. Can&apos;t find what you need? Reach out — we&apos;re here to help.
          </p>

          {/* Search bar */}
          <div className="mt-8 flex items-center gap-3 bg-white rounded-full pl-5 pr-2 py-2 max-w-2xl shadow-lg">
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search FAQs — try 'loan' or 'card'"
              className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent py-2"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORY TABS + LIST */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* Category sidebar */}
          <aside className="lg:sticky lg:top-28 self-start">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
              Categories
            </p>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      activeCategory === cat
                        ? "bg-[#1A8A3A]/10 text-[#1A8A3A]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* FAQ list */}
          <div>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <p className="text-sm text-slate-500">
                  No questions matched your search. Try a different keyword or category.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
                <div className="px-6">
                  {filtered.map((f, i) => (
                    <FaqItem key={f.question + i} q={f.question} a={f.answer} defaultOpen={i === 0 && !query} />
                  ))}
                </div>
              </div>
            )}

            <p className="mt-4 text-xs text-slate-400">
              Showing {filtered.length} of {faqs.length} questions
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="bg-slate-50 py-14 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F3D7A]">
                Still have questions?
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-xl">
                Our team is ready to help in English or Swahili. Visit a branch, drop us a line, or chat with Mshirika using the widget on this page.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="tel:+255272754470"
                className="inline-flex items-center gap-2 rounded-full bg-[#1A8A3A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#157030] transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call us
              </a>
              <a
                href="mailto:info@cbtbank.co.tz"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#0F3D7A] px-5 py-2.5 text-sm font-bold text-[#0F3D7A] hover:bg-[#0F3D7A] hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
              <Link
                href="/branches"
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:border-[#1A8A3A] hover:text-[#1A8A3A] transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Find a branch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
