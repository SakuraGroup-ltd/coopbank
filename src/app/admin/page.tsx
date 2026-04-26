import { fetchForexRates, fetchJobListings, fetchTenders, fetchBranches, isTenderOpen, bool } from "@/lib/sheets";
import AdminLogout from "./AdminLogout";

const SHEET_LINKS = {
  forex:    process.env.SHEET_FOREX_URL    ? `https://docs.google.com/spreadsheets/d/${process.env.SHEET_FOREX_URL.match(/\/d\/([^/]+)/)?.[1]}/edit` : "#",
  jobs:     process.env.SHEET_JOBS_URL     ? `https://docs.google.com/spreadsheets/d/${process.env.SHEET_JOBS_URL.match(/\/d\/([^/]+)/)?.[1]}/edit` : "#",
  tenders:  process.env.SHEET_TENDERS_URL  ? `https://docs.google.com/spreadsheets/d/${process.env.SHEET_TENDERS_URL.match(/\/d\/([^/]+)/)?.[1]}/edit` : "#",
  branches: process.env.SHEET_BRANCHES_URL ? `https://docs.google.com/spreadsheets/d/${process.env.SHEET_BRANCHES_URL.match(/\/d\/([^/]+)/)?.[1]}/edit` : "#",
};

function SheetLink({ href, label }: { href: string; label: string }) {
  if (href === "#") return <span className="text-xs text-gray-400 italic">Sheet URL not configured</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1A56A0] hover:underline">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
      {label}
    </a>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    green:  "bg-emerald-100 text-emerald-700",
    amber:  "bg-amber-100 text-amber-700",
    red:    "bg-red-100 text-red-700",
    gray:   "bg-gray-100 text-gray-600",
    blue:   "bg-blue-100 text-blue-700",
  };
  return <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors[color] || colors.gray}`}>{label}</span>;
}

function SectionCard({ emoji, title, count, label, children, sheetHref, sheetLabel }: {
  emoji: string; title: string; count: number; label: string;
  children: React.ReactNode; sheetHref: string; sheetLabel: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <h2 className="font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{count} {label}</p>
          </div>
        </div>
        <SheetLink href={sheetHref} label={sheetLabel} />
      </div>
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

export default async function AdminDashboard() {
  const [forex, jobs, tenders, branches] = await Promise.all([
    fetchForexRates(),
    fetchJobListings(true),
    fetchTenders(true),
    fetchBranches(true),
  ]);

  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Header */}
      <header className="bg-[#1A56A0] text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">CoopBank CMS Dashboard</h1>
            <p className="text-blue-200 text-xs mt-0.5">Google Sheets live data preview</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-xs text-blue-200 hover:text-white transition">← View website</a>
            <AdminLogout />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { emoji: "💱", label: "Forex rates", val: forex.length, color: "border-blue-200" },
            { emoji: "💼", label: "Open positions", val: jobs.filter(j => j.status === "open").length, color: "border-emerald-200" },
            { emoji: "📋", label: "Active tenders", val: tenders.filter(t => isTenderOpen(t)).length, color: "border-amber-200" },
            { emoji: "📍", label: "Branches & agents", val: branches.filter(b => bool(b.active)).length, color: "border-purple-200" },
          ].map(({ emoji, label, val, color }) => (
            <div key={label} className={`bg-white rounded-xl border-2 ${color} p-4 text-center shadow-sm`}>
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-3xl font-black text-gray-900">{val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Forex Rates */}
        <SectionCard emoji="💱" title="Forex Rates" count={forex.length} label="active currencies"
          sheetHref={SHEET_LINKS.forex} sheetLabel="Edit Forex Rates in Google Sheets">
          {forex.length === 0 ? (
            <div className="px-6 py-4 text-sm text-gray-400">No data — add SHEET_FOREX_URL to environment variables.</div>
          ) : forex.map((r) => (
            <div key={r.currency_code} className="px-6 py-3 flex items-center gap-4">
              <span className="text-xl w-8">{r.flag_emoji}</span>
              <div className="flex-1">
                <span className="font-semibold text-gray-800 text-sm">{r.currency_code}</span>
                <span className="text-gray-400 text-xs ml-2">{r.currency_name}</span>
              </div>
              <div className="text-sm text-gray-600">
                Buy <strong>{r.buy_rate}</strong> · Sell <strong>{r.sell_rate}</strong>
              </div>
              <StatusBadge label={r.trend || "neutral"} color={r.trend === "up" ? "green" : r.trend === "down" ? "red" : "gray"} />
              <span className="text-xs text-gray-400">{r.updated_date}</span>
            </div>
          ))}
        </SectionCard>

        {/* Job Listings */}
        <SectionCard emoji="💼" title="Job Listings" count={jobs.filter(j => j.status === "open").length} label="open positions"
          sheetHref={SHEET_LINKS.jobs} sheetLabel="Edit Job Listings in Google Sheets">
          {jobs.length === 0 ? (
            <div className="px-6 py-4 text-sm text-gray-400">No data — add SHEET_JOBS_URL to environment variables.</div>
          ) : jobs.map((j, i) => {
            const deadline = j.apply_by_date ? new Date(j.apply_by_date) : null;
            const closingSoon = deadline && deadline <= in7days && deadline >= now;
            return (
              <div key={i} className="px-6 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm truncate">{j.job_title}</div>
                  <div className="text-xs text-gray-400">{j.department} · {j.location} · {j.job_type}</div>
                </div>
                <div className="text-xs text-gray-500">By {j.apply_by_date || "—"}</div>
                {closingSoon && <StatusBadge label="Closing soon" color="amber" />}
                <StatusBadge
                  label={j.status}
                  color={j.status === "open" ? "green" : j.status === "draft" ? "gray" : "red"}
                />
              </div>
            );
          })}
        </SectionCard>

        {/* Tenders */}
        <SectionCard emoji="📋" title="Tenders" count={tenders.filter(t => isTenderOpen(t)).length} label="active tenders"
          sheetHref={SHEET_LINKS.tenders} sheetLabel="Edit Tenders in Google Sheets">
          {tenders.length === 0 ? (
            <div className="px-6 py-4 text-sm text-gray-400">No data — add SHEET_TENDERS_URL to environment variables.</div>
          ) : tenders.map((t, i) => {
            const closing = t.closing_date ? new Date(t.closing_date) : null;
            const closingSoon = closing && closing <= in7days && closing >= now;
            return (
              <div key={i} className="px-6 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm truncate">{t.tender_title}</div>
                  <div className="text-xs text-gray-400">{t.tender_ref} · {t.category} · {t.contract_type}</div>
                </div>
                <div className="text-xs text-gray-500">Closes {t.closing_date || "—"}</div>
                {closingSoon && <StatusBadge label="Closing soon" color="amber" />}
                <StatusBadge
                  label={isTenderOpen(t) ? "Open" : "Closed"}
                  color={isTenderOpen(t) ? "green" : "gray"}
                />
                {t.document_url && (
                  <a href={t.document_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#1A56A0] hover:underline">Doc ↗</a>
                )}
              </div>
            );
          })}
        </SectionCard>

        {/* Branches & Agents */}
        <SectionCard emoji="📍" title="Branches & Agents" count={branches.filter(b => bool(b.active)).length} label="active locations"
          sheetHref={SHEET_LINKS.branches} sheetLabel="Edit Branches in Google Sheets">
          {branches.length === 0 ? (
            <div className="px-6 py-4 text-sm text-gray-400">No data — add SHEET_BRANCHES_URL to environment variables.</div>
          ) : branches.map((b, i) => (
            <div key={i} className="px-6 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 text-sm">{b.name}</div>
                <div className="text-xs text-gray-400">{b.region} · {b.address}</div>
              </div>
              <StatusBadge label={b.type} color={b.type === "branch" ? "blue" : b.type === "agent" ? "green" : "gray"} />
              {bool(b.is_hq) && <StatusBadge label="HQ" color="blue" />}
              {bool(b.coming_soon) && <StatusBadge label={`Coming ${b.expected_opening || "soon"}`} color="amber" />}
              <StatusBadge label={bool(b.active) ? "Active" : "Inactive"} color={bool(b.active) ? "green" : "red"} />
            </div>
          ))}
        </SectionCard>

      </main>
    </div>
  );
}
