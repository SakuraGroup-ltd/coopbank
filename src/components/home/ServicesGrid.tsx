"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { iconOf } from "@/components/blocks/icon-map";
import { safeHref } from "@/lib/safe-href";
import { defaultServiceTabs, type ServiceTab } from "./home-defaults";

export default function ServicesGrid({ tabs = defaultServiceTabs }: { tabs?: ServiceTab[] }) {
  if (!tabs.length) tabs = defaultServiceTabs;
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <section id="services" ref={ref} className="bg-[#F2F4F8] py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12">
        {/* Tabs — underline style */}
        <div className="mb-10 flex items-center justify-center gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-4 text-[13px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-[#1A56A0]"
                  : "text-[#4A5568]/50 hover:text-[#4A5568]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.span
                  layoutId="services-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#1A8A3A]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {currentTab.items.map((item, i) => {
              const Icon = iconOf(item.icon);
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  <Link
                    href={safeHref(item.href) || "#"}
                    className="group flex items-start gap-4 rounded-xl bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-1"
                  >
                    <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1A8A3A]/10">
                      <Icon className="h-5 w-5 text-[#1A8A3A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-bold text-[#1A56A0] group-hover:text-[#1A8A3A] transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#4A5568]">
                        {item.desc}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 mt-1 text-[#1A56A0]/20 group-hover:text-[#1A8A3A] transition-colors" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
