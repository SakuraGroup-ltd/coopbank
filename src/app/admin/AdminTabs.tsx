"use client";

import { useState, useCallback } from "react";
import type { ForexRate, JobListing, Tender, Branch, BlogPost } from "@/lib/sheets";
import { isTenderOpen, bool } from "@/lib/sheets";
import ContentEditor from "@/components/admin/ContentEditor";

// ── Tab SVG icons ─────────────────────────────────────────────────────────────

const TAB_ICONS: Record<string, React.ReactNode> = {
  forex: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-[15px] h-[15px]">
      <circle cx="12" cy="12" r="9"/>
      <path d="M9.5 9.5C9.5 8.672 10.619 8 12 8s2.5.672 2.5 1.5S13.381 11 12 11s-2.5.672-2.5 1.5S10.619 14 12 14s2.5.672 2.5 1.5M12 7v1m0 8v1"/>
    </svg>
  ),
  jobs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-[15px] h-[15px]">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    </svg>
  ),
  tenders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-[15px] h-[15px]">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="13" y2="17"/>
    </svg>
  ),
  blog: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-[15px] h-[15px]">
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"/>
      <path d="M17.586 3.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  ),
  branches: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-[15px] h-[15px]">
      <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Pill({ label, variant }: { label: string; variant: "green"|"red"|"amber"|"blue"|"gray"|"purple" }) {
  const dot: Record<string, string> = {
    green:  "bg-emerald-400",
    red:    "bg-red-400",
    amber:  "bg-amber-400",
    blue:   "bg-[#1A56A0]",
    gray:   "bg-gray-300",
    purple: "bg-purple-400",
  };
  const txt: Record<string, string> = {
    green:  "text-emerald-700",
    red:    "text-red-600",
    amber:  "text-amber-700",
    blue:   "text-[#1A56A0]",
    gray:   "text-gray-500",
    purple: "text-purple-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${txt[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot[variant]}`} />
      {label}
    </span>
  );
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

// ── Sync button ───────────────────────────────────────────────────────────────

function SyncButton() {
  const [state, setState] = useState<"idle"|"syncing"|"done"|"error">("idle");

  async function sync() {
    setState("syncing");
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 3000);
  }

  return (
    <button onClick={sync} disabled={state === "syncing"}
      className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition
        ${state === "done"  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" :
          state === "error" ? "bg-red-50 text-red-700 ring-1 ring-red-200" :
          "bg-[#1A56A0] text-white hover:bg-[#1547a0] disabled:opacity-60"}`}>
      {state === "syncing" && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {state === "done"    && "✓ Synced!"}
      {state === "error"   && "Sync failed"}
      {state === "idle"    && "↺ Sync to Website"}
      {state === "syncing" && "Syncing…"}
    </button>
  );
}

// ── CMS list item card (shared across Jobs / Tenders / Blog) ──────────────────

function CmsCard({
  tag, title, meta, status, statusVariant, badges = [], onEdit,
}: {
  tag?: string;
  title: string;
  meta?: React.ReactNode;
  status: string;
  statusVariant: "green"|"red"|"amber"|"blue"|"gray";
  badges?: React.ReactNode[];
  onEdit: () => void;
}) {
  return (
    <div
      onClick={onEdit}
      className="group bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm hover:shadow-md hover:border-[#1A56A0]/20 cursor-pointer transition-all flex items-center gap-4"
    >
      {/* Status bar on left */}
      <div className={`w-1 self-stretch rounded-full flex-shrink-0
        ${statusVariant === "green" ? "bg-emerald-400" :
          statusVariant === "amber" ? "bg-amber-400" :
          statusVariant === "red"   ? "bg-red-400"   : "bg-gray-200"}`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {tag && <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{tag}</span>}
          {badges}
        </div>
        <h3 className="font-semibold text-sm text-[#1A1A2E] group-hover:text-[#1A56A0] transition truncate">{title}</h3>
        {meta && <div className="text-xs text-gray-400 mt-1">{meta}</div>}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <Pill label={status} variant={statusVariant} />
        <svg className="w-4 h-4 text-gray-300 group-hover:text-[#1A56A0] transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
    </div>
  );
}

// ── Forex tab (unchanged) ─────────────────────────────────────────────────────

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
                    {r.trend === "up"
                      ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium"><svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2l4 5H2z"/></svg>Up</span>
                      : r.trend === "down"
                      ? <span className="flex items-center gap-1 text-red-500 text-xs font-medium"><svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><path d="M6 10L2 5h8z"/></svg>Down</span>
                      : <span className="text-gray-400 text-xs">—</span>
                    }
                  </Td>
                  <Td><span className="text-xs text-gray-500">{r.updated_date}</span></Td>
                  <Td>
                    {bool(r.active)
                      ? <span className="text-emerald-600 text-xs font-medium flex items-center gap-1"><svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Active</span>
                      : <span className="text-gray-300 text-xs">Inactive</span>
                    }
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
  const [editing, setEditing] = useState<JobListing | null | "new">(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const onSaved = useCallback(() => { setEditing(null); setRefreshKey(k => k + 1); window.location.reload(); }, []);

  const open  = jobs.filter(j => j.status === "open");
  const draft = jobs.filter(j => j.status === "draft");
  const closed = jobs.filter(j => j.status === "closed");

  const grouped = [
    { label: "Open positions", items: open,   variant: "green"  as const },
    { label: "Drafts",         items: draft,  variant: "amber"  as const },
    { label: "Closed",         items: closed, variant: "gray"   as const },
  ].filter(g => g.items.length > 0);

  return (
    <div key={refreshKey}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">{jobs.length} listings · <span className="text-gray-400">Human Resources</span></p>
        <div className="flex items-center gap-3">
          <SheetLink url={url} label="Open Sheet" />
          <button onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#1A56A0] text-white px-4 py-2 rounded-lg hover:bg-[#1547a0] transition">
            + New Job
          </button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-400 text-sm mb-4">No job listings yet.</p>
          <button onClick={() => setEditing("new")}
            className="text-xs font-bold bg-[#1A56A0] text-white px-5 py-2.5 rounded-lg hover:bg-[#1547a0] transition">
            Create First Job Listing
          </button>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {grouped.map(({ label, items, variant }) => (
            <div key={label}>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{label} ({items.length})</h3>
              <div className="space-y-2">
                {items.map((j, i) => {
                  const deadline = j.apply_by_date ? new Date(j.apply_by_date) : null;
                  const closingSoon = deadline && deadline <= in7days && deadline >= now;
                  return (
                    <CmsCard
                      key={i}
                      title={j.job_title}
                      status={j.status}
                      statusVariant={variant}
                      badges={[
                        <Pill key="dept" label={j.department} variant="blue" />,
                        <Pill key="type" label={j.job_type} variant="gray" />,
                      ]}
                      meta={
                        <span className={closingSoon ? "text-amber-600 font-semibold" : ""}>
                          {j.location && `${j.location} · `}
                          {closingSoon ? "⚠ " : ""}
                          {j.apply_by_date ? `Apply by ${j.apply_by_date}` : "No deadline set"}
                        </span>
                      }
                      onEdit={() => setEditing(j)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <ContentEditor
          type="job"
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

// ── Tenders tab ───────────────────────────────────────────────────────────────

function TendersTab({ tenders, url, now, in7days }: { tenders: Tender[]; url: string|null; now: Date; in7days: Date }) {
  const [editing, setEditing] = useState<Tender | null | "new">(null);
  const onSaved = useCallback(() => { setEditing(null); window.location.reload(); }, []);

  const open   = tenders.filter(t => isTenderOpen(t));
  const draft  = tenders.filter(t => t.status === "draft");
  const closed = tenders.filter(t => !isTenderOpen(t) && t.status !== "draft");

  const grouped = [
    { label: "Active tenders", items: open,   variant: "green" as const },
    { label: "Drafts",         items: draft,  variant: "amber" as const },
    { label: "Closed",         items: closed, variant: "gray"  as const },
  ].filter(g => g.items.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">{tenders.length} tenders · <span className="text-gray-400">Operations / Procurement</span></p>
        <div className="flex items-center gap-3">
          <SheetLink url={url} label="Open Sheet" />
          <button onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#1A56A0] text-white px-4 py-2 rounded-lg hover:bg-[#1547a0] transition">
            + New Tender
          </button>
        </div>
      </div>

      {tenders.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-400 text-sm mb-4">No tenders yet.</p>
          <button onClick={() => setEditing("new")}
            className="text-xs font-bold bg-[#1A56A0] text-white px-5 py-2.5 rounded-lg hover:bg-[#1547a0] transition">
            Create First Tender
          </button>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {grouped.map(({ label, items, variant }) => (
            <div key={label}>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{label} ({items.length})</h3>
              <div className="space-y-2">
                {items.map((t, i) => {
                  const closing = t.closing_date ? new Date(t.closing_date) : null;
                  const closingSoon = closing && closing <= in7days && closing >= now;
                  return (
                    <CmsCard
                      key={i}
                      tag={t.tender_ref}
                      title={t.tender_title}
                      status={isTenderOpen(t) ? "open" : "closed"}
                      statusVariant={variant}
                      badges={[
                        <Pill key="cat" label={t.category} variant="blue" />,
                        <Pill key="ct"  label={t.contract_type} variant="gray" />,
                      ]}
                      meta={
                        <span className={closingSoon ? "text-amber-600 font-semibold" : ""}>
                          {closingSoon ? "⚠ Closes " : "Closes "}
                          {t.closing_date || "—"}
                          {t.document_url ? " · Document attached" : ""}
                        </span>
                      }
                      onEdit={() => setEditing(t)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <ContentEditor
          type="tender"
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

// ── Blog tab ──────────────────────────────────────────────────────────────────

function BlogTab({ posts, url }: { posts: BlogPost[]; url: string|null }) {
  const [editing, setEditing] = useState<BlogPost | null | "new">(null);
  const onSaved = useCallback(() => { setEditing(null); window.location.reload(); }, []);

  const published = posts.filter(p => p.status === "published");
  const drafts    = posts.filter(p => p.status === "draft");

  const grouped = [
    { label: "Published", items: published, variant: "green" as const },
    { label: "Drafts",    items: drafts,    variant: "amber" as const },
  ].filter(g => g.items.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">
          {posts.length} posts · <span className="text-gray-400">Communications</span>
        </p>
        <div className="flex items-center gap-3">
          {url && <SheetLink url={url} label="Open Sheet" />}
          <button onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#1A56A0] text-white px-4 py-2 rounded-lg hover:bg-[#1547a0] transition">
            + New Post
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-400 text-sm mb-4">No blog posts yet.</p>
          <button onClick={() => setEditing("new")}
            className="text-xs font-bold bg-[#1A56A0] text-white px-5 py-2.5 rounded-lg hover:bg-[#1547a0] transition">
            Write First Post
          </button>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {grouped.map(({ label, items, variant }) => (
            <div key={label}>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{label} ({items.length})</h3>
              <div className="space-y-2">
                {items.map((p, i) => (
                  <CmsCard
                    key={i}
                    tag={p.category}
                    title={p.title}
                    status={p.status}
                    statusVariant={variant}
                    badges={[
                      ...(bool(p.featured) ? [<Pill key="f" label="Featured" variant="purple" />] : []),
                    ]}
                    meta={`${p.author} · ${p.publish_date}${p.read_time_mins ? ` · ${p.read_time_mins} min read` : ""}`}
                    onEdit={() => setEditing(p)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <ContentEditor
          type="blog"
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

// ── Branches tab (unchanged) ──────────────────────────────────────────────────

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
  { key: "forex",    label: "Forex Rates"  },
  { key: "jobs",     label: "Job Listings" },
  { key: "tenders",  label: "Tenders"      },
  { key: "blog",     label: "Blog"         },
  { key: "branches", label: "Branches"     },
];

export default function AdminTabs({
  forex, jobs, tenders, branches, blog, urls, now: nowStr, in7days: in7daysStr,
}: {
  forex: ForexRate[];
  jobs: JobListing[];
  tenders: Tender[];
  branches: Branch[];
  blog: BlogPost[];
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
      <div className="flex items-center border-b border-gray-200 bg-white rounded-t-2xl overflow-hidden shadow-sm">
        <div className="flex flex-1">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setActive(key)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all border-b-2 flex items-center justify-center gap-2 ${
                active === key
                  ? "border-[#1A56A0] text-[#1A56A0] bg-blue-50/30"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}>
              <span className="opacity-80">{TAB_ICONS[key]}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <div className="px-3">
          <SyncButton />
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 border-t-0 overflow-hidden">
        {active === "forex"    && <ForexTab    rates={forex}    url={urls.forex}    />}
        {active === "jobs"     && <JobsTab     jobs={jobs}      url={urls.jobs}     now={now} in7days={in7days} />}
        {active === "tenders"  && <TendersTab  tenders={tenders} url={urls.tenders} now={now} in7days={in7days} />}
        {active === "blog"     && <BlogTab     posts={blog}     url={urls.blog}     />}
        {active === "branches" && <BranchesTab branches={branches} url={urls.branches} />}
      </div>

      <p className="text-center text-xs text-gray-300 mt-6">
        Cooperative Bank of Tanzania Plc — Internal Staff Portal — data is live from Google Sheets
      </p>
    </div>
  );
}
