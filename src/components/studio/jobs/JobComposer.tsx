"use client";

// Job composer — mirrors BlogComposer's auto-save + status flow but with
// the HR field set (department, location, jobType, applyByDate, applyEmail)
// and two body editors (overview + requirements) since recruiters write
// them as distinct sections.
import "../editor/tiptap.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { Tiptap } from "../editor/Tiptap";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";

type Mode = "create" | "edit";
type Status = "draft" | "published" | undefined;

export type JobDraft = {
  id?: string | number;
  jobTitle: string;
  department: string;
  location: string;
  jobType: string;
  applyByDate: string;
  summary: string;
  descriptionHtml: string;
  requirementsHtml: string;
  applyEmail: string;
  status?: Status;
};

const DEPARTMENTS = [
  { value: "technology", label: "Technology" },
  { value: "ict-security", label: "ICT Security" },
  { value: "it-digital", label: "IT & Digital Transformation" },
  { value: "operations", label: "Operations" },
  { value: "credit", label: "Credit" },
  { value: "marketing", label: "Marketing" },
  { value: "treasury", label: "Treasury" },
  { value: "hr", label: "Human Resources" },
  { value: "finance", label: "Finance" },
  { value: "other", label: "Other" },
];

const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "consultancy", label: "Consultancy" },
  { value: "internship", label: "Internship" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export function JobComposer({ mode, initial }: { mode: Mode; initial: JobDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<JobDraft>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const idRef = useRef<string | number | undefined>(initial.id);

  function patch(partial: Partial<JobDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
    setIsDirty(true);
    setSaveState("idle");
  }

  const persist = useCallback(
    async (status?: Status): Promise<boolean> => {
      setSaveState("saving");
      setSaveError(null);
      try {
        const body = {
          jobTitle: draft.jobTitle,
          department: draft.department,
          location: draft.location,
          jobType: draft.jobType,
          applyByDate: draft.applyByDate,
          summary: draft.summary,
          descriptionHtml: draft.descriptionHtml,
          requirementsHtml: draft.requirementsHtml,
          applyEmail: draft.applyEmail,
          ...(status ? { _status: status } : {}),
        };
        const currentId = idRef.current;
        const url = currentId
          ? `/api/job-listings/${currentId}?draft=true`
          : "/api/job-listings?draft=true";
        const method = currentId ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          setSaveState("error");
          setSaveError(txt || `HTTP ${res.status}`);
          return false;
        }
        const data = await res.json();
        if (!currentId && data?.doc?.id) {
          idRef.current = data.doc.id;
          window.history.replaceState(null, "", `/studio/jobs/${data.doc.id}`);
        }
        if (status) setDraft((d) => ({ ...d, status }));
        setSaveState("saved");
        setSavedAt(new Date());
        setIsDirty(false);
        return true;
      } catch (e) {
        setSaveState("error");
        setSaveError(e instanceof Error ? e.message : "Network error");
        return false;
      }
    },
    [draft],
  );

  useEffect(() => {
    if (!isDirty) return;
    if (!idRef.current && !draft.jobTitle) return;
    const t = setTimeout(() => persist(), 1500);
    return () => clearTimeout(t);
  }, [draft, isDirty, persist]);

  async function handlePublish() {
    const ok = await persist("published");
    if (ok) router.refresh();
  }
  async function handleSaveDraft() {
    const ok = await persist("draft");
    if (ok) router.refresh();
  }

  const daysLeft = draft.applyByDate
    ? Math.floor(
        (new Date(draft.applyByDate).getTime() - Date.now()) / 86_400_000,
      )
    : null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-0 min-h-screen">
      {/* Center column */}
      <div className="p-8 lg:p-10 max-w-[820px] mx-auto w-full animate-fade-up">
        {/* Breadcrumb + actions */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-studio-ink-3">
            <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/studio/jobs" className="hover:text-studio-ink">Job listings</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-studio-ink font-medium truncate max-w-[280px]">
              {draft.jobTitle || (mode === "create" ? "New job" : "Untitled")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SaveStatus state={saveState} savedAt={savedAt} error={saveError} />
            <button
              type="button"
              onClick={handleSaveDraft}
              className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg border border-studio-border bg-studio-panel hover:bg-studio-soft text-studio-ink font-medium transition-colors"
            >
              Save as draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium transition-colors"
            >
              {draft.status === "published" ? "Update job" : "Publish job"}
            </button>
          </div>
        </div>

        {/* Status badges */}
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <Badge tone={draft.status === "published" ? "success" : "neutral"}>
            {draft.status === "published" ? "Published" : "Draft"}
          </Badge>
          <Badge tone="navy">
            {JOB_TYPES.find((t) => t.value === draft.jobType)?.label || draft.jobType}
          </Badge>
          <Badge tone="neutral">
            {DEPARTMENTS.find((d) => d.value === draft.department)?.label || draft.department}
          </Badge>
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="What's the role? e.g. Senior Treasury Analyst"
          value={draft.jobTitle}
          onChange={(e) => patch({ jobTitle: e.target.value })}
          className="block w-full text-3xl font-semibold tracking-tight text-studio-ink bg-transparent border-none focus:outline-none placeholder:text-studio-ink-3/60 mb-3"
        />

        {/* Summary */}
        <div className="mb-8">
          <label className="block text-xs font-semibold text-studio-ink-2 mb-2 uppercase tracking-wider">
            Summary
          </label>
          <textarea
            placeholder="One sentence — what's the role about? Shown on the job card."
            value={draft.summary}
            onChange={(e) => patch({ summary: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 rounded-2xl border border-studio-border bg-studio-panel text-base text-studio-ink leading-relaxed placeholder:text-studio-ink-3 focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none resize-none"
          />
        </div>

        {/* Description */}
        <label className="block text-xs font-semibold text-studio-ink-2 mb-2 uppercase tracking-wider">
          Role overview
        </label>
        <Tiptap
          initialHtml={draft.descriptionHtml}
          placeholder="What does this person do day-to-day? Who do they report to? What does success look like?"
          onChange={(html) => patch({ descriptionHtml: html })}
        />

        {/* Requirements */}
        <label className="block text-xs font-semibold text-studio-ink-2 mb-2 uppercase tracking-wider mt-8">
          Requirements
        </label>
        <Tiptap
          initialHtml={draft.requirementsHtml}
          placeholder="Qualifications, experience, skills. Bullet lists work great here."
          onChange={(html) => patch({ requirementsHtml: html })}
        />
      </div>

      {/* Right rail */}
      <aside className="bg-studio-panel/50 border-l border-studio-border p-6 lg:p-8 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
        <div className="space-y-5">
          <Block label="Department">
            <Select
              value={draft.department}
              onChange={(e) => patch({ department: e.target.value })}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </Select>
          </Block>

          <Block label="Job type">
            <Select
              value={draft.jobType}
              onChange={(e) => patch({ jobType: e.target.value })}
            >
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </Block>

          <Block label="Location">
            <Input
              type="text"
              value={draft.location}
              onChange={(e) => patch({ location: e.target.value })}
              placeholder="e.g. Head Office – Dodoma"
            />
          </Block>

          <Block
            label="Apply by"
            hint={
              daysLeft === null
                ? undefined
                : daysLeft < 0
                  ? "passed"
                  : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
            }
          >
            <Input
              type="date"
              value={draft.applyByDate}
              onChange={(e) => patch({ applyByDate: e.target.value })}
            />
          </Block>

          <Block label="Apply email" hint="Where applications route">
            <Input
              type="email"
              value={draft.applyEmail}
              onChange={(e) => patch({ applyEmail: e.target.value })}
              placeholder="hr@cbtbank.co.tz"
            />
          </Block>

          {/* Preview */}
          {draft.id && (
            <Block label="Preview">
              <Link
                href={`/preview/careers/${draft.id}`}
                target="_blank"
                className="flex items-center gap-2 p-3 rounded-xl border border-studio-border bg-studio-panel hover:bg-studio-soft transition-colors text-sm text-studio-ink"
              >
                <Eye className="w-4 h-4 text-studio-ink-3" />
                <span className="flex-1">Open live preview</span>
                <ExternalLink className="w-3.5 h-3.5 text-studio-ink-3" />
              </Link>
            </Block>
          )}

          {/* Tip */}
          <div className="p-4 rounded-xl bg-cb-navy/5 border border-cb-navy/10">
            <p className="text-xs text-studio-ink-2 leading-relaxed">
              <span className="font-semibold text-studio-ink inline-flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                Tip
              </span>
              <br />
              Listings auto-hide from /careers once the apply-by date passes. No need to un-publish.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Block({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-studio-ink-3">
          {label}
        </span>
        {hint && <span className="text-[10px] text-studio-ink-3">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SaveStatus({
  state,
  savedAt,
  error,
}: {
  state: SaveState;
  savedAt: Date | null;
  error: string | null;
}) {
  if (state === "saving") {
    return (
      <span className="text-xs text-studio-ink-3 inline-flex items-center gap-1.5">
        <Loader2 className="w-3 h-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (state === "saved" && savedAt) {
    const s = Math.floor((Date.now() - savedAt.getTime()) / 1000);
    return (
      <span className="text-xs text-emerald-700 inline-flex items-center gap-1.5">
        <CheckCircle2 className="w-3 h-3" />
        Saved {s < 5 ? "just now" : s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`}
      </span>
    );
  }
  if (state === "error") {
    return (
      <span title={error || "save failed"} className="text-xs text-rose-700 inline-flex items-center gap-1.5">
        <AlertCircle className="w-3 h-3" />
        Save failed
      </span>
    );
  }
  return null;
}
