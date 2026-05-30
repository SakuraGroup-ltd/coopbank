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
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Forex rates",
              value: forex.length,
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5C9.5 8.672 10.619 8 12 8s2.5.672 2.5 1.5S13.381 11 12 11s-2.5.672-2.5 1.5S10.619 14 12 14s2.5.672 2.5 1.5M12 7v1m0 8v1"/></svg>,
            },
            {
              label: "Open positions",
              value: jobs.filter(j=>j.status==="open").length,
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
            },
            {
              label: "Active tenders",
              value: tenders.filter(t=>isTenderOpen(t)).length,
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>,
            },
            {
              label: "Published posts",
              value: blog.filter(p=>p.status==="published").length,
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"/><path d="M17.586 3.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
            },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                <span className="text-gray-300">{icon}</span>
              </div>
              <p className="text-3xl font-black text-[#0E1B36] tracking-tight">{value}</p>
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
