import Image from "next/image";
import { fetchForexRates, fetchJobListings, fetchTenders, fetchBranches, fetchBlogPosts, isTenderOpen, bool } from "@/lib/sheets";
import AdminLogout from "./AdminLogout";
import AdminTabs from "./AdminTabs";

export const dynamic = "force-dynamic"; // always fetch live, never use ISR cache

function sheetEditUrl(envUrl: string | undefined) {
  if (!envUrl) return null;
  const m = envUrl.match(/\/d\/([^/]+)\//);
  return m ? `https://docs.google.com/spreadsheets/d/${m[1]}/edit` : null;
}

export default async function AdminDashboard() {
  const [forex, jobs, tenders, branches, blog] = await Promise.all([
    fetchForexRates(true),
    fetchJobListings(true, true),
    fetchTenders(true, true),
    fetchBranches(true, true),
    fetchBlogPosts(true, true),
  ]);

  const urls = {
    forex:    sheetEditUrl(process.env.SHEET_FOREX_URL),
    jobs:     sheetEditUrl(process.env.SHEET_JOBS_URL),
    tenders:  sheetEditUrl(process.env.SHEET_TENDERS_URL),
    branches: sheetEditUrl(process.env.SHEET_BRANCHES_URL),
    blog:     sheetEditUrl(process.env.SHEET_BLOG_URL),
  };

  const now     = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-[#F6F8FA]">

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/images/coopbank-logo.png" alt="CoopBank" width={120} height={40} className="h-8 w-auto" priority />
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-sm font-semibold text-gray-500">Content Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-xs text-gray-400 hover:text-[#1A56A0] transition flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              View website
            </a>
            <AdminLogout />
          </div>
        </div>
      </nav>

      {/* Summary row */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Forex rates",     value: forex.length,                               color: "border-l-[#1A56A0]" },
            { label: "Open positions",  value: jobs.filter(j=>j.status==="open").length,   color: "border-l-emerald-500" },
            { label: "Active tenders",  value: tenders.filter(t=>isTenderOpen(t)).length,  color: "border-l-amber-500"  },
            { label: "Published posts", value: blog.filter(p=>p.status==="published").length, color: "border-l-purple-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-white rounded-xl border border-gray-100 border-l-4 ${color} px-5 py-3.5 shadow-sm`}>
              <p className="text-2xl font-black text-[#1A1A2E]">{value}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabbed content */}
      <AdminTabs
        forex={forex}
        jobs={jobs}
        tenders={tenders}
        branches={branches}
        blog={blog}
        urls={urls}
        now={now.toISOString()}
        in7days={in7days.toISOString()}
      />
    </div>
  );
}
