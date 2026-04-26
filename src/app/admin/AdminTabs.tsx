"use client";

import { useState } from "react";
import type { ForexRate, JobListing, Tender, Branch } from "@/lib/sheets";
import { isTenderOpen, bool } from "@/lib/sheets";

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Pill({ label, variant }: { label: string; variant: "green"|"red"|"amber"|"blue"|"gray"|"purple" }) {
  const cls: Record<string, string> = {
    green:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    red:    "bg-red-50 text-red-700 ring-1 ring-red-200",
    amber:  "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    blue:   "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    gray:   "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
    purple: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  };
  return <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${cls[variant]}`}>{label}</span>;
}

function SheetLink({ url, label }: { url: string | null; label: string }) {
  if (!url) return <span className="text-xs text-gray-300 italic">Sheet not configured</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A56A0] hover:underline">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      {label}
    </a>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td className={`px-4 py-3 text-sm text-gray-700 align-top ${mono ? "font-mono text-xs" : ""}`}>
      {children}
    </td>
  );
}

// ── Forex tab ─────────────────────────────────────────────────────────────────

function ForexTab({ rates, url }: { rates: ForexRate[]; url: string | null }) {
  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p className="text-sm text-gray-500">{rates.length} rows · updates daily · <span className="text-gray-400">Treasury / Finance</span></p>
        </div>
        <SheetLink url={url} label="Open Google Sheet" />
      </div>
      {rates.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-400 text-sm">
          No data. Share the Google Sheet with &ldquo;Anyone with the link can view&rdquo; and ensure SHEET_FOREX_URL is set.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0F4FA] border-b border-gray-100">
              <tr>
                <TableHeader>Flag</TableHeader>
                <TableHeader>Code</TableHeader>
                <TableHeader>Currency Name</TableHeader>
                <TableHeader>Buy (TZS)</TableHeader>
                <TableHeader>Sell (TZS)</TableHeader>
                <TableHeader>Trend</TableHeader>
                <TableHeader>Updated</TableHeader>
                <TableHeader>Active</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rates.map((r, i) => (
                <tr key={i} className={`hover:bg-blue-50/30 transition ${!bool(r.active) ? "opacity-40" : ""}`}>
                  <Td><span className="text-xl">{r.flag_emoji}</span></Td>
                  <Td><span className="font-bold text-[#1A1A2E]">{r.currency_code}</span></Td>
                  <Td>{r.currency_name}</Td>
                  <Td mono><span className="font-semibold">{Number(r.buy_rate).toLocaleString()}</span></Td>
                  <Td mono>{Number(r.sell_rate).toLocaleString()}</Td>
                  <Td>
                    <Pill label={r.trend || "neutral"}
                      variant={r.trend==="up" ? "green" : r.trend==="down" ? "red" : "gray"} />
                  </Td>
                  <Td><span className="text-xs text-gray-500">{r.updated_date}</span></Td>
                  <Td>
                    <Pill label={bool(r.active) ? "TRUE" : "FALSE"}
                      variant={bool(r.active) ? "green" : "gray"} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Jobs tab ──────────────────────────────────────────────────────────────────

function JobsTab({ jobs, url, now, in7days }: { jobs: JobListing[]; url: string|null; now: Date; in7days: Date }) {
  const [view, setView] = useState<"cards"|"table">("cards");

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">{jobs.length} rows · <span className="text-gray-400">Human Resources</span></p>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            <button onClick={()=>setView("cards")} className={`px-3 py-1.5 font-medium transition ${view==="cards"?"bg-[#1A56A0] text-white":"bg-white text-gray-500 hover:bg-gray-50"}`}>Cards</button>
            <button onClick={()=>setView("table")} className={`px-3 py-1.5 font-medium transition ${view==="table"?"bg-[#1A56A0] text-white":"bg-white text-gray-500 hover:bg-gray-50"}`}>Table</button>
          </div>
        </div>
        <SheetLink url={url} label="Open Google Sheet" />
      </div>

      {jobs.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-400 text-sm">No job listings yet.</div>
      ) : view === "cards" ? (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobs.map((j, i) => {
            const deadline = j.apply_by_date ? new Date(j.apply_by_date) : null;
            const closingSoon = deadline && deadline <= in7days && deadline >= now;
            return (
              <div key={i} className={`bg-white rounded-xl border ${j.status==="open" ? "border-gray-200" : "border-gray-100 opacity-60"} p-5 shadow-sm`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1A1A2E] text-sm leading-snug">{j.job_title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Pill label={j.department} variant="blue" />
                      <Pill label={j.job_type} variant="gray" />
                      {j.location && <span className="text-xs text-gray-400">📍 {j.location}</span>}
                    </div>
                  </div>
                  <Pill
                    label={j.status}
                    variant={j.status==="open" ? "green" : j.status==="draft" ? "amber" : "red"}
                  />
                </div>
                {j.description && (
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{j.description}</p>
                )}
                {j.requirements && (
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                    <span className="font-semibold text-gray-600">Requirements: </span>{j.requirements}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <span className={`text-xs ${closingSoon ? "text-amber-700 font-semibold" : "text-gray-400"}`}>
                    {closingSoon && "⚠ "}Apply by: {j.apply_by_date || "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0F4FA] border-b border-gray-100">
              <tr>
                <TableHeader>Title</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Location</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Apply By</TableHeader>
                <TableHeader>Status</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map((j, i) => {
                const deadline = j.apply_by_date ? new Date(j.apply_by_date) : null;
                const closingSoon = deadline && deadline <= in7days && deadline >= now;
                return (
                  <tr key={i} className={`hover:bg-blue-50/30 ${j.status!=="open" ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-[#1A1A2E]">{j.job_title}</div>
                      {j.description && <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{j.description}</div>}
                    </td>
                    <Td>{j.department}</Td>
                    <Td>{j.location}</Td>
                    <Td><Pill label={j.job_type} variant="blue" /></Td>
                    <Td>
                      <span className={closingSoon ? "text-amber-700 font-semibold text-xs" : "text-xs text-gray-500"}>
                        {closingSoon && "⚠ "}{j.apply_by_date || "—"}
                      </span>
                    </Td>
                    <Td>
                      <Pill label={j.status}
                        variant={j.status==="open" ? "green" : j.status==="draft" ? "amber" : "red"} />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tenders tab ───────────────────────────────────────────────────────────────

function TendersTab({ tenders, url, now, in7days }: { tenders: Tender[]; url: string|null; now: Date; in7days: Date }) {
  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">{tenders.length} rows · <span className="text-gray-400">Operations / Procurement</span></p>
        <SheetLink url={url} label="Open Google Sheet" />
      </div>

      {tenders.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-400 text-sm">No tenders yet.</div>
      ) : (
        <div className="p-6 space-y-4">
          {tenders.map((t, i) => {
            const closing = t.closing_date ? new Date(t.closing_date) : null;
            const closingSoon = closing && closing <= in7days && closing >= now;
            const open = isTenderOpen(t);
            return (
              <div key={i} className={`bg-white rounded-xl border ${open ? "border-gray-200" : "border-gray-100 opacity-60"} shadow-sm overflow-hidden`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{t.tender_ref}</span>
                        <Pill label={t.category} variant="blue" />
                        <Pill label={t.contract_type} variant="gray" />
                      </div>
                      <h3 className="font-bold text-[#1A1A2E] text-sm mt-1">{t.tender_title}</h3>
                      {t.description && (
                        <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-2">{t.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Pill label={open ? "Open" : "Closed"} variant={open ? "green" : "red"} />
                      {t.status === "draft" && <Pill label="Draft" variant="amber" />}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-50 flex-wrap">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium text-gray-600">Published:</span> {t.published_date || "—"}
                    </div>
                    <div className={`text-xs ${closingSoon ? "text-amber-700 font-semibold" : "text-gray-500"}`}>
                      {closingSoon && "⚠ "}
                      <span className="font-medium text-gray-600">Closes:</span> {t.closing_date || "—"}
                    </div>
                    {t.document_url ? (
                      <a href={t.document_url} target="_blank" rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A56A0] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Tender Document
                      </a>
                    ) : (
                      <span className="ml-auto text-xs text-gray-300 italic">No document attached</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Branches tab ──────────────────────────────────────────────────────────────

function BranchesTab({ branches, url }: { branches: Branch[]; url: string|null }) {
  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">{branches.length} rows · <span className="text-gray-400">Business Development</span></p>
        <SheetLink url={url} label="Open Google Sheet" />
      </div>
      {branches.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-400 text-sm">No branches configured.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0F4FA] border-b border-gray-100">
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Region</TableHeader>
                <TableHeader>Address</TableHeader>
                <TableHeader>Phone</TableHeader>
                <TableHeader>Hours (Weekday)</TableHeader>
                <TableHeader>Hours (Sat)</TableHeader>
                <TableHeader>HQ</TableHeader>
                <TableHeader>Coming Soon</TableHeader>
                <TableHeader>Active</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {branches.map((b, i) => (
                <tr key={i} className={`hover:bg-blue-50/30 transition ${!bool(b.active) ? "opacity-40" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-sm text-[#1A1A2E]">{b.name}</div>
                    {b.maps_url && (
                      <a href={b.maps_url} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-[#1A56A0] hover:underline">View map ↗</a>
                    )}
                  </td>
                  <Td><Pill label={b.type} variant={b.type==="branch"?"blue":b.type==="agent"?"green":"gray"} /></Td>
                  <Td>{b.region}</Td>
                  <Td><span className="text-xs">{b.address || "—"}</span></Td>
                  <Td><span className="text-xs font-mono">{b.phone || "—"}</span></Td>
                  <Td><span className="text-xs">{b.hours_weekday || "—"}</span></Td>
                  <Td><span className="text-xs">{b.hours_saturday || "—"}</span></Td>
                  <Td><Pill label={bool(b.is_hq) ? "YES" : "NO"} variant={bool(b.is_hq) ? "blue" : "gray"} /></Td>
                  <Td>
                    {bool(b.coming_soon)
                      ? <Pill label={b.expected_opening || "Soon"} variant="amber" />
                      : <Pill label="NO" variant="gray" />}
                  </Td>
                  <Td><Pill label={bool(b.active) ? "TRUE" : "FALSE"} variant={bool(b.active) ? "green" : "red"} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

const TABS = [
  { key: "forex",    label: "💱 Forex Rates"     },
  { key: "jobs",     label: "💼 Job Listings"    },
  { key: "tenders",  label: "📋 Tenders"         },
  { key: "branches", label: "📍 Branches"        },
];

export default function AdminTabs({
  forex, jobs, tenders, branches, urls, now: nowStr, in7days: in7daysStr,
}: {
  forex: ForexRate[];
  jobs: JobListing[];
  tenders: Tender[];
  branches: Branch[];
  urls: Record<string, string | null>;
  now: string;
  in7days: string;
}) {
  const [active, setActive] = useState("forex");
  const now     = new Date(nowStr);
  const in7days = new Date(in7daysStr);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-2xl overflow-hidden shadow-sm">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setActive(key)}
            className={`flex-1 py-3.5 text-sm font-semibold transition-all border-b-2 ${
              active === key
                ? "border-[#1A56A0] text-[#1A56A0] bg-blue-50/40"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 border-t-0 overflow-hidden">
        {active === "forex"    && <ForexTab    rates={forex}   url={urls.forex}    />}
        {active === "jobs"     && <JobsTab     jobs={jobs}     url={urls.jobs}     now={now} in7days={in7days} />}
        {active === "tenders"  && <TendersTab  tenders={tenders} url={urls.tenders} now={now} in7days={in7days} />}
        {active === "branches" && <BranchesTab branches={branches} url={urls.branches} />}
      </div>

      <p className="text-center text-xs text-gray-300 mt-6">
        Cooperative Bank of Tanzania Plc — Internal Staff Portal — data is live from Google Sheets
      </p>
    </div>
  );
}
