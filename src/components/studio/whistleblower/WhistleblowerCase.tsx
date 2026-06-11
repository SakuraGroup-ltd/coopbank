"use client";

// Compliance triage panel. The submission itself is read-only — only `status`,
// `assignedTo`, `internalNotes` and `resolution` are editable. Editor saves
// happen on explicit Save (not auto-save) because changing status without
// intent is a real risk on a sensitive collection.
import "../editor/tiptap.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ShieldAlert,
  Mail,
  Phone,
  Paperclip,
  Calendar,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Tiptap } from "../editor/Tiptap";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "review", label: "Under Review" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
  { value: "escalated", label: "Escalated" },
];

const CATEGORY_LABEL: Record<string, string> = {
  fraud: "Fraud / Theft",
  corruption: "Corruption / Bribery",
  harassment: "Workplace Harassment",
  discrimination: "Discrimination",
  compliance: "Regulatory / Compliance Breach",
  aml: "Money Laundering",
  conflict: "Conflict of Interest",
  other: "Other",
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function WhistleblowerCase({ report }: { report: Record<string, unknown> }) {
  const router = useRouter();
  const r = report as {
    id: string | number;
    caseRef?: string;
    category?: string;
    subject: string;
    description: string;
    incidentDate?: string;
    involvedParties?: string;
    submittedAt?: string;
    reporter?: { anonymous?: boolean; name?: string; email?: string; phone?: string; preferredContact?: string };
    evidence?: Array<{ file?: { url?: string; filename?: string }; note?: string }>;
    status?: string;
    internalNotes?: unknown;
    resolution?: unknown;
    internalNotesHtml?: string;
    resolutionHtml?: string;
  };

  const [status, setStatus] = useState(r.status || "new");
  const [internalNotesHtml, setInternalNotesHtml] = useState(
    typeof r.internalNotesHtml === "string" ? r.internalNotesHtml : "",
  );
  const [resolutionHtml, setResolutionHtml] = useState(
    typeof r.resolutionHtml === "string" ? r.resolutionHtml : "",
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  async function save() {
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await fetch(`/api/whistleblower-reports/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          internalNotesHtml,
          resolutionHtml,
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setSaveState("error");
        setSaveError(txt || `HTTP ${res.status}`);
        return;
      }
      setSaveState("saved");
      router.refresh();
    } catch (e) {
      setSaveState("error");
      setSaveError(e instanceof Error ? e.message : "Network error");
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-0 min-h-screen">
      <div className="p-8 lg:p-10 max-w-[820px] mx-auto w-full animate-fade-up">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
          <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/studio/whistleblower" className="hover:text-studio-ink">Reports</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-studio-ink font-medium">{r.caseRef || r.subject}</span>
        </div>

        {/* Case header */}
        <div className="flex items-start gap-4 mb-6">
          <span className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 inline-flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-mono text-cb-navy bg-cb-navy/8 px-2 py-0.5 rounded">
                {r.caseRef}
              </span>
              <Badge tone="navy">{CATEGORY_LABEL[r.category || ""] || r.category}</Badge>
            </div>
            <h1 className="text-2xl font-semibold text-studio-ink leading-tight">{r.subject}</h1>
            <p className="text-xs text-studio-ink-3 mt-2 inline-flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Read-restricted to Compliance / Risk &amp; admins
            </p>
          </div>
        </div>

        {/* Submission detail */}
        <section className="rounded-2xl border border-studio-border bg-studio-panel p-6 mb-6">
          <h2 className="text-xs uppercase tracking-[0.08em] font-semibold text-studio-ink-3 mb-3">
            Description
          </h2>
          <p className="text-sm text-studio-ink leading-relaxed whitespace-pre-wrap">
            {r.description}
          </p>
          {r.involvedParties && (
            <>
              <h2 className="text-xs uppercase tracking-[0.08em] font-semibold text-studio-ink-3 mt-6 mb-2">
                Involved parties
              </h2>
              <p className="text-sm text-studio-ink-2 whitespace-pre-wrap">{r.involvedParties}</p>
            </>
          )}
          {r.incidentDate && (
            <p className="text-xs text-studio-ink-3 mt-6 inline-flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              Incident date: {new Date(r.incidentDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </section>

        {/* Evidence */}
        {(r.evidence || []).length > 0 && (
          <section className="rounded-2xl border border-studio-border bg-studio-panel p-6 mb-6">
            <h2 className="text-xs uppercase tracking-[0.08em] font-semibold text-studio-ink-3 mb-3">
              Evidence ({(r.evidence || []).length})
            </h2>
            <ul className="space-y-2">
              {(r.evidence || []).map((e, i) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-lg border border-studio-border bg-studio-soft">
                  <Paperclip className="w-4 h-4 text-studio-ink-3 shrink-0" />
                  <div className="flex-1 min-w-0">
                    {e.file?.url ? (
                      <a href={e.file.url} target="_blank" rel="noopener" className="text-sm text-cb-navy hover:text-cb-green truncate block">
                        {e.file.filename || "evidence"}
                      </a>
                    ) : (
                      <span className="text-sm text-studio-ink-2">No file</span>
                    )}
                    {e.note && <p className="text-xs text-studio-ink-3 truncate">{e.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Internal notes */}
        <h2 className="text-xs uppercase tracking-[0.08em] font-semibold text-studio-ink-3 mb-2">
          Internal notes
        </h2>
        <Tiptap
          initialHtml={internalNotesHtml}
          placeholder="Triage notes, calls made, follow-ups. Visible only to Compliance + admins."
          onChange={setInternalNotesHtml}
        />

        {/* Resolution */}
        {["resolved", "dismissed"].includes(status) && (
          <>
            <h2 className="text-xs uppercase tracking-[0.08em] font-semibold text-studio-ink-3 mt-6 mb-2">
              Resolution
            </h2>
            <Tiptap
              initialHtml={resolutionHtml}
              placeholder="Outcome / actions taken."
              onChange={setResolutionHtml}
            />
          </>
        )}
      </div>

      {/* Right rail */}
      <aside className="bg-studio-panel/50 border-l border-studio-border p-6 lg:p-8 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
        <div className="space-y-5">
          <Block label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </Block>

          <Block label="Reporter">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-studio-border bg-studio-panel">
              <Avatar
                name={r.reporter?.anonymous ? "?" : r.reporter?.name || r.reporter?.email}
                size={36}
              />
              <div className="flex-1 min-w-0">
                {r.reporter?.anonymous ? (
                  <>
                    <p className="text-sm font-medium text-studio-ink">Anonymous</p>
                    <p className="text-xs text-studio-ink-3">Identity not disclosed</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-studio-ink truncate">
                      {r.reporter?.name || "Unnamed"}
                    </p>
                    {r.reporter?.email && (
                      <a href={`mailto:${r.reporter.email}`} className="text-xs text-cb-navy hover:text-cb-green inline-flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3" />
                        {r.reporter.email}
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
            {!r.reporter?.anonymous && r.reporter?.phone && (
              <a
                href={`tel:${r.reporter.phone}`}
                className="mt-2 flex items-center gap-2 p-3 rounded-xl border border-studio-border bg-studio-panel hover:bg-studio-soft transition-colors text-sm text-studio-ink"
              >
                <Phone className="w-4 h-4 text-studio-ink-3" />
                {r.reporter.phone}
              </a>
            )}
          </Block>

          <Block label="Submitted">
            <p className="text-sm text-studio-ink p-3 rounded-xl border border-studio-border bg-studio-panel">
              {r.submittedAt
                ? new Date(r.submittedAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </p>
          </Block>

          {/* Save button */}
          <button
            type="button"
            onClick={save}
            disabled={saveState === "saving"}
            className="w-full h-10 px-4 text-sm inline-flex items-center justify-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium transition-colors disabled:opacity-50"
          >
            {saveState === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saveState === "saved" ? (
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </span>
            ) : (
              "Save changes"
            )}
          </button>
          {saveState === "error" && (
            <p className="text-xs text-rose-600 inline-flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {saveError}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-studio-ink-3 mb-2">
        {label}
      </span>
      {children}
    </div>
  );
}
