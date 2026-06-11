"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import type { Agent } from "@/components/coopwakala/AgentsMap";

// Leaflet cannot run on the server
const AgentsMap = dynamic(() => import("@/components/coopwakala/AgentsMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl border border-gray-200 bg-[#f4f6f9] flex items-center justify-center" style={{ height: "480px" }}>
      <p className="text-sm text-[#4A5568]">Loading map...</p>
    </div>
  ),
});


type SortKey = "name" | "region" | "district";

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-yellow-900 rounded-sm">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function AgentsClient({ agents }: { agents: Agent[] }) {
  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("region");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleRegionClick = (region: string) => {
    setActiveRegion((prev) => (prev === region ? null : region));
    setSearch("");
    // Scroll to table
    setTimeout(() => {
      document.getElementById("agents-table")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return agents
      .filter((a) => {
        const matchRegion = !activeRegion || a.region === activeRegion;
        const matchSearch =
          !q ||
          a.name.toLowerCase().includes(q) ||
          a.region.toLowerCase().includes(q) ||
          a.district.toLowerCase().includes(q) ||
          a.ward.toLowerCase().includes(q) ||
          a.street.toLowerCase().includes(q);
        return matchRegion && matchSearch;
      })
      .sort((a, b) => {
        const va = a[sortKey].toLowerCase();
        const vb = b[sortKey].toLowerCase();
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
  }, [search, activeRegion, sortKey, sortAsc]);

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col gap-[2px]">
      <span className={`block w-0 h-0 border-l-[4px] border-r-[4px] border-b-[5px] border-l-transparent border-r-transparent ${sortKey === col && sortAsc ? "border-b-[#1A56A0]" : "border-b-gray-300"}`} />
      <span className={`block w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent ${sortKey === col && !sortAsc ? "border-t-[#1A56A0]" : "border-t-gray-300"}`} />
    </span>
  );

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: "1200px", backgroundRepeat: "repeat" }} />
        <div className="absolute inset-0 bg-[#1A56A0]/[0.99] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.nav initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link href="/" className="hover:text-white transition-colors font-medium">Home</Link>
            <ChevronRight size={14} className="text-white/30" />
            <Link href="/digital-banking" className="hover:text-white transition-colors font-medium">Digital Banking</Link>
            <ChevronRight size={14} className="text-white/30" />
            <Link href="/digital-banking/coopwakala" className="hover:text-white transition-colors font-medium">CoopWakala</Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white font-semibold">Find an Agent</span>
          </motion.nav>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white text-center mb-3">
            Find a CoopWakala Agent
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-white/60 text-center text-base max-w-xl mx-auto">
            {agents.length} authorized agents across Tanzania — click a pin to filter by region
          </motion.p>
        </div>
      </section>

      {/* MAP */}
      <section className="bg-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <AgentsMap agents={agents} activeRegion={activeRegion} onRegionClick={handleRegionClick} />
          {activeRegion && (
            <div className="mt-3 flex items-center gap-3">
              <p className="text-sm text-[#4A5568]">
                Showing agents in <span className="font-bold text-[#1A56A0]">{activeRegion}</span>
              </p>
              <button onClick={() => setActiveRegion(null)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#4A5568] hover:text-[#1A1A2E] transition">
                <X size={13} /> Clear
              </button>
            </div>
          )}
        </div>
      </section>

      {/* TABLE */}
      <section id="agents-table" className="bg-[#f4f6f9] py-10 sm:py-14 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setActiveRegion(null); }}
                placeholder="Search agents..."
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-8 py-2.5 text-sm text-[#1A1A2E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/20 focus:border-[#1A56A0] transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
            <p className="self-center text-sm text-[#4A5568] sm:ml-auto">
              <span className="font-semibold text-[#1A1A2E]">{filtered.length}</span> of {agents.length} agents
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#f4f6f9] border-b border-gray-200">
                    <th className="w-10 px-4 py-3 text-left text-xs font-bold text-[#4A5568] uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#4A5568] uppercase tracking-wider cursor-pointer select-none hover:text-[#1A56A0] transition" onClick={() => handleSort("name")}>
                      <span className="inline-flex items-center">Agent Name <SortIcon col="name" /></span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#4A5568] uppercase tracking-wider cursor-pointer select-none hover:text-[#1A56A0] transition" onClick={() => handleSort("region")}>
                      <span className="inline-flex items-center">Region <SortIcon col="region" /></span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#4A5568] uppercase tracking-wider cursor-pointer select-none hover:text-[#1A56A0] transition" onClick={() => handleSort("district")}>
                      <span className="inline-flex items-center">District <SortIcon col="district" /></span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#4A5568] uppercase tracking-wider">Ward</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#4A5568] uppercase tracking-wider">Street</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-14 text-center text-[#4A5568]">
                        <p className="font-semibold">No agents found.</p>
                        <button onClick={() => { setSearch(""); setActiveRegion(null); }} className="mt-2 text-sm text-[#1A56A0] hover:underline">Clear filters</button>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((agent, i) => (
                      <tr key={`${agent.name}-${i}`} className="hover:bg-[#f4f6f9]/70 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-400 font-medium">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-[#1A1A2E] max-w-xs">{highlight(agent.name, search)}</td>
                        <td className="px-4 py-3 text-[#4A5568]">{highlight(agent.region, search)}</td>
                        <td className="px-4 py-3 text-[#4A5568]">{highlight(agent.district, search)}</td>
                        <td className="px-4 py-3 text-[#4A5568]">{agent.ward}</td>
                        <td className="px-4 py-3 text-[#4A5568]">{agent.street}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Link href="/digital-banking/coopwakala" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A56A0] hover:underline">
              <ChevronRight size={15} className="rotate-180" /> Back to CoopWakala
            </Link>
            <p className="text-xs text-[#4A5568]">
              Can&apos;t find an agent? Call <span className="font-semibold">+255 27 275 4470</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
