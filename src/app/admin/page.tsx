import Image from "next/image";
import { fetchForexRates, fetchJobListings, fetchTenders, fetchBranches, isTenderOpen, bool } from "@/lib/sheets";
import AdminLogout from "./AdminLogout";

// ── Helpers ───────────────────────────────────────────────────────────────────

function sheetEditUrl(envUrl: string | undefined) {
  if (!envUrl) return null;
  const m = envUrl.match(/\/d\/([^/]+)\//);
  return m ? `https://docs.google.com/spreadsheets/d/${m[1]}/edit` : null;
}

function Pill({ label, variant }: { label: string; variant: "green" | "red" | "amber" | "blue" | "gray" }) {
  const cls = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    red:   "bg-red-50 text-red-700 ring-red-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    blue:  "bg-blue-50 text-blue-700 ring-blue-200",
    gray:  "bg-gray-100 text-gray-500 ring-gray-200",
  }[variant];
  return (
    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${cls}`}>
      {label}
    </span>
  );
}

function SheetButton({ url, label }: { url: string | null; label: string }) {
  if (!url) return <span className="text-xs text-gray-300 italic">Not configured</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1A56A0] hover:text-[#154a8c] hover:underline transition">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      {label}
    </a>
  );
}

function SectionHeader({ title, count, label, sheetUrl, sheetLabel }: {
  title: string; count: number; label: string; sheetUrl: string | null; sheetLabel: string;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <div>
        <h2 className="text-sm font-bold text-[#1A1A2E]">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{count} {label}</p>
      </div>
      <SheetButton url={sheetUrl} label={sheetLabel} />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-6 py-8 text-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const [forex, jobs, tenders, branches] = await Promise.all([
    fetchForexRates(),
    fetchJobListings(true),
    fetchTenders(true),
    fetchBranches(true),
  ]);

  const now     = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const openJobs     = jobs.filter(j => j.status === "open");
  const activeTenders = tenders.filter(t => isTenderOpen(t));
  const activeBranches = branches.filter(b => bool(b.active));

  const sheetBase = `https://docs.google.com/spreadsheets/d/${
    (process.env.SHEET_FOREX_URL || "").match(/\/d\/([^/]+)\//)?.[1] || ""
  }`;

  const urls = {
    forex:    sheetEditUrl(process.env.SHEET_FOREX_URL),
    jobs:     sheetEditUrl(process.env.SHEET_JOBS_URL),
    tenders:  sheetEditUrl(process.env.SHEET_TENDERS_URL),
    branches: sheetEditUrl(process.env.SHEET_BRANCHES_URL),
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA]">

      {/* ── Top nav ──────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/coopbank-logo.png"
              alt="CoopBank"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-sm font-semibold text-gray-600">Content Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank"
              className="text-xs text-gray-400 hover:text-[#1A56A0] transition flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View website
            </a>
            <AdminLogout />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── Summary cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Forex rates",       value: forex.length,          sub: "Active currencies",    color: "border-l-[#1A56A0]" },
            { label: "Open positions",    value: openJobs.length,       sub: `${jobs.length} total`,        color: "border-l-emerald-500" },
            { label: "Active tenders",   value: activeTenders.length,   sub: `${tenders.length} total`,     color: "border-l-amber-500" },
            { label: "Locations",         value: activeBranches.length, sub: "Branches & agents",   color: "border-l-purple-500" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className={`bg-white rounded-xl border border-gray-100 border-l-4 ${color} px-5 py-4 shadow-sm`}>
              <p className="text-3xl font-black text-[#1A1A2E] tracking-tight">{value}</p>
              <p className="text-sm font-semibold text-gray-600 mt-0.5">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Forex Rates ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <SectionHeader title="Forex Rates" count={forex.length} label="active currencies"
            sheetUrl={urls.forex} sheetLabel="Edit in Google Sheets" />
          {forex.length === 0 ? (
            <EmptyState message="No data yet. Make sure the sheet is shared publicly and the URL is configured." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">Currency</th>
                    <th className="px-4 py-3 font-semibold">Buy (TZS)</th>
                    <th className="px-4 py-3 font-semibold">Sell (TZS)</th>
                    <th className="px-4 py-3 font-semibold">Trend</th>
                    <th className="px-4 py-3 font-semibold">Updated</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {forex.map((r) => (
                    <tr key={r.currency_code} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{r.flag_emoji}</span>
                          <div>
                            <div className="font-semibold text-[#1A1A2E]">{r.currency_code}</div>
                            <div className="text-xs text-gray-400">{r.currency_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#1A1A2E]">{Number(r.buy_rate).toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{Number(r.sell_rate).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Pill
                          label={r.trend || "neutral"}
                          variant={r.trend === "up" ? "green" : r.trend === "down" ? "red" : "gray"}
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{r.updated_date}</td>
                      <td className="px-4 py-3">
                        <Pill label={bool(r.active) ? "Active" : "Hidden"} variant={bool(r.active) ? "green" : "gray"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Job Listings ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <SectionHeader title="Job Listings" count={openJobs.length} label="open positions"
            sheetUrl={urls.jobs} sheetLabel="Edit in Google Sheets" />
          {jobs.length === 0 ? (
            <EmptyState message="No jobs configured yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">Position</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Apply by</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jobs.map((j, i) => {
                    const deadline = j.apply_by_date ? new Date(j.apply_by_date) : null;
                    const closingSoon = deadline && deadline <= in7days && deadline >= now;
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-3">
                          <div className="font-medium text-[#1A1A2E]">{j.job_title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{j.location}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{j.department}</td>
                        <td className="px-4 py-3"><Pill label={j.job_type} variant="blue" /></td>
                        <td className="px-4 py-3 text-xs">
                          <span className={closingSoon ? "text-amber-700 font-semibold" : "text-gray-500"}>
                            {j.apply_by_date || "—"}
                          </span>
                          {closingSoon && <span className="ml-1 text-amber-500">⚠</span>}
                        </td>
                        <td className="px-4 py-3">
                          <Pill label={j.status}
                            variant={j.status === "open" ? "green" : j.status === "draft" ? "gray" : "red"} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Tenders ───────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <SectionHeader title="Tenders & Procurement" count={activeTenders.length} label="active tenders"
            sheetUrl={urls.tenders} sheetLabel="Edit in Google Sheets" />
          {tenders.length === 0 ? (
            <EmptyState message="No tenders configured yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">Ref</th>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Closes</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Doc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tenders.map((t, i) => {
                    const closing = t.closing_date ? new Date(t.closing_date) : null;
                    const closingSoon = closing && closing <= in7days && closing >= now;
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-3 font-mono text-xs text-gray-500">{t.tender_ref}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#1A1A2E] max-w-64">{t.tender_title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{t.contract_type}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{t.category}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={closingSoon ? "text-amber-700 font-semibold" : "text-gray-500"}>
                            {t.closing_date || "—"}
                          </span>
                          {closingSoon && <span className="ml-1 text-amber-500">⚠</span>}
                        </td>
                        <td className="px-4 py-3">
                          <Pill label={isTenderOpen(t) ? "Open" : "Closed"}
                            variant={isTenderOpen(t) ? "green" : "gray"} />
                        </td>
                        <td className="px-4 py-3">
                          {t.document_url ? (
                            <a href={t.document_url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-[#1A56A0] hover:underline">View ↗</a>
                          ) : <span className="text-gray-300 text-xs">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Branches & Agents ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <SectionHeader title="Branches & Agents" count={activeBranches.length} label="active locations"
            sheetUrl={urls.branches} sheetLabel="Edit in Google Sheets" />
          {branches.length === 0 ? (
            <EmptyState message="No branches configured yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Region</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Hours</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {branches.map((b, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#1A1A2E]">{b.name}</span>
                          {bool(b.is_hq) && <Pill label="HQ" variant="blue" />}
                        </div>
                        {b.address && <div className="text-xs text-gray-400 mt-0.5">{b.address}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{b.region}</td>
                      <td className="px-4 py-3">
                        <Pill label={b.type}
                          variant={b.type === "branch" ? "blue" : b.type === "agent" ? "green" : "gray"} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {b.hours_weekday || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {bool(b.coming_soon)
                          ? <Pill label={`Coming ${b.expected_opening || "soon"}`} variant="amber" />
                          : <Pill label={bool(b.active) ? "Active" : "Hidden"}
                              variant={bool(b.active) ? "green" : "gray"} />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 pb-4">
          Cooperative Bank of Tanzania Plc — Internal Staff Portal — data refreshes every 5–60 minutes
        </p>
      </div>
    </div>
  );
}
