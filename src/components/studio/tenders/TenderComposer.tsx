"use client";

// Tender composer — same auto-save pattern as Blog/Job. Adds tenderRef
// format validation (TB-YYYY-###) and a PDF attachment that uploads to
// the Payload media library and binds the doc id to the tender.
/* eslint-disable @next/next/no-img-element */
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
  FileText,
  Upload,
  X,
  ExternalLink,
  Info,
} from "lucide-react";
import { Tiptap } from "../editor/Tiptap";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";

type Mode = "create" | "edit";
type Status = "draft" | "published" | undefined;

type Doc = { id?: string | number; url?: string; filename?: string };

export type TenderDraft = {
  id?: string | number;
  tenderRef: string;
  title: string;
  category: string;
  contractType: string;
  publishedDate: string;
  closingDate: string;
  descriptionHtml: string;
  document?: Doc;
  status?: Status;
};

const CATEGORIES = [
  { value: "it-equipment", label: "IT Equipment" },
  { value: "it-services", label: "IT Services" },
  { value: "construction", label: "Construction" },
  { value: "services", label: "Services" },
  { value: "goods", label: "Goods" },
  { value: "consultancy", label: "Consultancy" },
];

const CONTRACT_TYPES = [
  { value: "supply", label: "Supply" },
  { value: "supply-install", label: "Supply & Installation" },
  { value: "service", label: "Service Contract" },
  { value: "construction", label: "Construction Works" },
  { value: "consulting", label: "Consulting Services" },
];

const REF_PATTERN = /^TB-\d{4}-\d{3,}$/;

type SaveState = "idle" | "saving" | "saved" | "error";

export function TenderComposer({ mode, initial }: { mode: Mode; initial: TenderDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<TenderDraft>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const idRef = useRef<string | number | undefined>(initial.id);

  const refValid = REF_PATTERN.test(draft.tenderRef);
  const closingDays = draft.closingDate
    ? Math.floor((new Date(draft.closingDate).getTime() - Date.now()) / 86_400_000)
    : null;

  function patch(partial: Partial<TenderDraft>) {
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
          tenderRef: draft.tenderRef,
          title: draft.title,
          category: draft.category,
          contractType: draft.contractType,
          publishedDate: draft.publishedDate,
          closingDate: draft.closingDate,
          descriptionHtml: draft.descriptionHtml,
          ...(draft.document?.id ? { document: draft.document.id } : {}),
          ...(status ? { _status: status } : {}),
        };
        const currentId = idRef.current;
        const url = currentId
          ? `/api/tenders/${currentId}?draft=true`
          : "/api/tenders?draft=true";
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
          window.history.replaceState(null, "", `/studio/tenders/${data.doc.id}`);
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
    if (!idRef.current && (!draft.title || !refValid)) return;
    const t = setTimeout(() => persist(), 1500);
    return () => clearTimeout(t);
  }, [draft, isDirty, persist, refValid]);

  async function handlePublish() {
    if (!refValid) {
      setSaveError("Tender ref must match TB-YYYY-###");
      setSaveState("error");
      return;
    }
    const ok = await persist("published");
    if (ok) router.refresh();
  }
  async function handleSaveDraft() {
    const ok = await persist("draft");
    if (ok) router.refresh();
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-0 min-h-screen">
      {/* Center column */}
      <div className="p-8 lg:p-10 max-w-[820px] mx-auto w-full animate-fade-up">
        {/* Breadcrumb + actions */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-studio-ink-3">
            <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/studio/tenders" className="hover:text-studio-ink">Tenders</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-studio-ink font-medium truncate max-w-[280px]">
              {draft.title || (mode === "create" ? "New tender" : "Untitled")}
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
              disabled={!refValid}
              className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={!refValid ? "Fix the tender ref format first" : undefined}
            >
              {draft.status === "published" ? "Update tender" : "Publish tender"}
            </button>
          </div>
        </div>

        {/* Status row */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone={draft.status === "published" ? "success" : "neutral"}>
            {draft.status === "published" ? "Published" : "Draft"}
          </Badge>
          <Badge tone="navy">
            {CATEGORIES.find((c) => c.value === draft.category)?.label}
          </Badge>
          {closingDays !== null && (
            <Badge tone={closingDays < 0 ? "neutral" : closingDays <= 7 ? "warning" : "neutral"}>
              {closingDays < 0
                ? "Closed"
                : closingDays === 0
                  ? "Closes today"
                  : `${closingDays}d to close`}
            </Badge>
          )}
        </div>

        {/* Tender ref */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="TB-2026-001"
            value={draft.tenderRef}
            onChange={(e) => patch({ tenderRef: e.target.value.toUpperCase() })}
            className={`block w-44 text-sm font-mono px-3 py-2 rounded-lg border bg-studio-panel focus:outline-none focus:ring-2 focus:ring-cb-navy/15 ${
              refValid
                ? "border-studio-border text-cb-navy focus:border-cb-navy/30"
                : "border-rose-200 text-rose-700 focus:border-rose-300"
            }`}
          />
          {!refValid && (
            <p className="text-xs text-rose-600 mt-1.5">
              Format: TB-YYYY-### (e.g. TB-2026-001).
            </p>
          )}
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="What's being procured?"
          value={draft.title}
          onChange={(e) => patch({ title: e.target.value })}
          className="block w-full text-3xl font-semibold tracking-tight text-studio-ink bg-transparent border-none focus:outline-none placeholder:text-studio-ink-3/60 mb-6"
        />

        {/* Description */}
        <label className="block text-xs font-semibold text-studio-ink-2 mb-2 uppercase tracking-wider">
          Scope &amp; requirements
        </label>
        <Tiptap
          initialHtml={draft.descriptionHtml}
          placeholder="Describe what's being procured, deliverables, evaluation criteria, and any pre-bid meeting details."
          onChange={(html) => patch({ descriptionHtml: html })}
        />

        {/* Document attachment */}
        <div className="mt-8">
          <label className="block text-xs font-semibold text-studio-ink-2 mb-2 uppercase tracking-wider">
            Tender document (PDF)
          </label>
          <DocumentPicker
            value={draft.document}
            onChange={(document) => patch({ document })}
          />
        </div>
      </div>

      {/* Right rail */}
      <aside className="bg-studio-panel/50 border-l border-studio-border p-6 lg:p-8 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
        <div className="space-y-5">
          <Block label="Category">
            <Select
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </Block>

          <Block label="Contract type">
            <Select
              value={draft.contractType}
              onChange={(e) => patch({ contractType: e.target.value })}
            >
              {CONTRACT_TYPES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </Block>

          <Block label="Published">
            <Input
              type="date"
              value={draft.publishedDate}
              onChange={(e) => patch({ publishedDate: e.target.value })}
            />
          </Block>

          <Block
            label="Closing date"
            hint={
              closingDays === null
                ? undefined
                : closingDays < 0
                  ? "passed"
                  : `${closingDays} day${closingDays === 1 ? "" : "s"} left`
            }
          >
            <Input
              type="date"
              value={draft.closingDate}
              onChange={(e) => patch({ closingDate: e.target.value })}
            />
          </Block>

          {/* Preview */}
          {draft.id && (
            <Block label="Preview">
              <Link
                href={`/preview/tenders/${draft.tenderRef || draft.id}`}
                target="_blank"
                className="flex items-center gap-2 p-3 rounded-xl border border-studio-border bg-studio-panel hover:bg-studio-soft transition-colors text-sm text-studio-ink"
              >
                <Eye className="w-4 h-4 text-studio-ink-3" />
                <span className="flex-1">Open live preview</span>
                <ExternalLink className="w-3.5 h-3.5 text-studio-ink-3" />
              </Link>
            </Block>
          )}

          <div className="p-4 rounded-xl bg-cb-navy/5 border border-cb-navy/10">
            <p className="text-xs text-studio-ink-2 leading-relaxed">
              <span className="font-semibold text-studio-ink inline-flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Tip
              </span>
              <br />
              Tenders auto-close on /tenders once the closing date passes. Always include tenders@ as your reply-to so vendors can request clarifications.
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
        {error || "Save failed"}
      </span>
    );
  }
  return null;
}

function DocumentPicker({
  value,
  onChange,
}: {
  value?: Doc;
  onChange: (next?: Doc) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", file.name.replace(/\.[^.]+$/, ""));
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        setErr("Upload failed");
        setBusy(false);
        return;
      }
      const data = await res.json();
      onChange({
        id: data?.doc?.id,
        url: data?.doc?.url,
        filename: data?.doc?.filename || file.name,
      });
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  if (value?.url) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-studio-border bg-studio-panel p-4">
        <span className="w-10 h-10 rounded-lg bg-cb-navy/8 text-cb-navy flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <a
            href={value.url}
            target="_blank"
            rel="noopener"
            className="text-sm font-medium text-studio-ink hover:text-cb-navy truncate inline-flex items-center gap-1"
          >
            {value.filename || "tender.pdf"}
            <ExternalLink className="w-3 h-3" />
          </a>
          <p className="text-xs text-studio-ink-3 mt-0.5">Attached</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-xs text-studio-ink-3 hover:text-rose-600 inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50"
        >
          <X className="w-3 h-3" />
          Remove
        </button>
      </div>
    );
  }

  return (
    <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-studio-border bg-studio-panel/50 hover:border-cb-navy/30 hover:bg-cb-navy/2 transition-colors px-6 py-8 text-center">
      <input
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
        disabled={busy}
      />
      <Upload className="w-7 h-7 mx-auto text-studio-ink-3 mb-2" />
      <p className="text-sm font-medium text-studio-ink">
        {busy ? "Uploading…" : "Attach tender document"}
      </p>
      <p className="text-xs text-studio-ink-3 mt-1">PDF only · vendors download this from /tenders</p>
      {err && <p className="text-xs text-rose-600 mt-2">{err}</p>}
    </label>
  );
}
