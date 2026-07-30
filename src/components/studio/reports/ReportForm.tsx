"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  X,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

type Mode = "create" | "edit";

type Doc = { id?: string | number; url?: string; filename?: string };
type Photo = { id?: string | number; url?: string; alt?: string };

export type ReportDraft = {
  id?: string | number;
  title: string;
  year: number | undefined;
  kind: string;
  publishedDate: string;
  summary: string;
  document?: Doc;
  cover?: Photo;
};

const KINDS = [
  { value: "annual", label: "Annual Report" },
  { value: "integrated", label: "Integrated Report" },
  { value: "interim", label: "Interim / Half-year" },
  { value: "sustainability", label: "Sustainability Report" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export function ReportForm({ mode, initial }: { mode: Mode; initial: ReportDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ReportDraft>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const idRef = useRef<string | number | undefined>(initial.id);

  function patch(partial: Partial<ReportDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
    setIsDirty(true);
    setSaveState("idle");
  }

  const persist = useCallback(async (): Promise<boolean> => {
    setSaveState("saving");
    setSaveError(null);
    try {
      const body: Record<string, unknown> = {
        title: draft.title,
        year: draft.year,
        kind: draft.kind,
        publishedDate: draft.publishedDate,
        summary: draft.summary,
      };
      if (draft.document?.id) body.document = draft.document.id;
      if (draft.cover?.id) body.cover = draft.cover.id;
      const currentId = idRef.current;
      const url = currentId ? `/api/annual-reports/${currentId}` : "/api/annual-reports";
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
        window.history.replaceState(null, "", `/studio/reports/${data.doc.id}`);
      }
      setSaveState("saved");
      setSavedAt(new Date());
      setIsDirty(false);
      return true;
    } catch (e) {
      setSaveState("error");
      setSaveError(e instanceof Error ? e.message : "Network error");
      return false;
    }
  }, [draft]);

  useEffect(() => {
    if (!isDirty) return;
    if (!idRef.current && (!draft.title || !draft.document?.id)) return;
    const t = setTimeout(() => persist(), 1500);
    return () => clearTimeout(t);
  }, [draft, isDirty, persist]);

  async function handleSave() {
    const ok = await persist();
    if (ok) router.refresh();
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-0 min-h-screen">
      <div className="p-8 lg:p-10 max-w-[820px] mx-auto w-full animate-fade-up">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-studio-ink-3">
            <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/studio/reports" className="hover:text-studio-ink">Annual reports</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-studio-ink font-medium truncate max-w-[280px]">
              {draft.title || (mode === "create" ? "New report" : "Untitled")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SaveStatus state={saveState} savedAt={savedAt} error={saveError} />
            <button
              type="button"
              onClick={handleSave}
              className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Cooperative Bank Tanzania — Annual Report 2025"
          value={draft.title}
          onChange={(e) => patch({ title: e.target.value })}
          className="block w-full text-2xl font-semibold tracking-tight text-studio-ink bg-transparent border-none focus:outline-none placeholder:text-studio-ink-3/60 mb-6"
        />

        {/* Cover */}
        <Field label="Cover image (optional)" hint="Used on the listing card">
          <CoverPicker value={draft.cover} onChange={(cover) => patch({ cover })} />
        </Field>

        {/* Summary */}
        <Field label="Summary">
          <textarea
            placeholder="1-2 paragraphs for the listing page."
            value={draft.summary}
            onChange={(e) => patch({ summary: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-2xl border border-studio-border bg-studio-panel text-base text-studio-ink leading-relaxed placeholder:text-studio-ink-3 focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none resize-none"
          />
        </Field>

        {/* Document */}
        <Field label="Report PDF" hint="This is what investors download">
          <PDFPicker value={draft.document} onChange={(document) => patch({ document })} />
        </Field>
      </div>

      {/* Right rail */}
      <aside className="bg-studio-panel/50 border-l border-studio-border p-6 lg:p-8 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
        <div className="space-y-5">
          <Block label="Kind">
            <Select value={draft.kind} onChange={(e) => patch({ kind: e.target.value })}>
              {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </Select>
          </Block>

          <Block label="Financial year">
            <Input
              type="number"
              value={draft.year ?? ""}
              onChange={(e) => patch({ year: e.target.value === "" ? undefined : Number(e.target.value) })}
              placeholder="2025"
            />
          </Block>

          <Block label="Published date">
            <Input
              type="date"
              value={draft.publishedDate}
              onChange={(e) => patch({ publishedDate: e.target.value })}
            />
          </Block>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold text-studio-ink-2 uppercase tracking-wider">{label}</span>
        {hint && <span className="text-[10px] text-studio-ink-3">{hint}</span>}
      </div>
      {children}
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

function SaveStatus({ state, savedAt, error }: { state: SaveState; savedAt: Date | null; error: string | null }) {
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

function PDFPicker({ value, onChange }: { value?: Doc; onChange: (n?: Doc) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", file.name);
      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (!res.ok) { setErr("Upload failed"); setBusy(false); return; }
      const data = await res.json();
      onChange({ id: data?.doc?.id, url: data?.doc?.url, filename: data?.doc?.filename || file.name });
    } catch { setErr("Network error"); }
    finally { setBusy(false); }
  }

  if (value?.url) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-studio-border bg-studio-panel p-4">
        <FileText className="w-5 h-5 text-cb-navy shrink-0" />
        <a
          href={value.url}
          target="_blank"
          rel="noopener"
          className="flex-1 text-sm font-medium text-studio-ink hover:text-cb-navy truncate inline-flex items-center gap-1"
        >
          {value.filename || "report.pdf"}
          <ExternalLink className="w-3 h-3" />
        </a>
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
    <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-studio-border bg-studio-panel/50 hover:border-cb-navy/30 px-6 py-8 text-center">
      <input
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
        disabled={busy}
      />
      <Upload className="w-7 h-7 mx-auto text-studio-ink-3 mb-2" />
      <p className="text-sm font-medium text-studio-ink">{busy ? "Uploading…" : "Upload the PDF"}</p>
      {err && <p className="text-xs text-rose-600 mt-2">{err}</p>}
    </label>
  );
}

function CoverPicker({ value, onChange }: { value?: Photo; onChange: (n?: Photo) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", file.name.replace(/\.[^.]+$/, ""));
      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (!res.ok) { setErr("Upload failed"); setBusy(false); return; }
      const data = await res.json();
      onChange({ id: data?.doc?.id, url: data?.doc?.url, alt: data?.doc?.alt });
    } catch { setErr("Network error"); }
    finally { setBusy(false); }
  }

  if (value?.url) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-studio-border">
        <img src={value.url} alt={value.alt || ""} className="w-full aspect-[16/10] object-cover" />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-studio-ink/80 backdrop-blur text-white text-xs hover:bg-studio-ink"
        >
          <X className="w-3 h-3" />
          Remove
        </button>
      </div>
    );
  }

  return (
    <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-studio-border bg-studio-panel/50 hover:border-cb-navy/30 px-6 py-10 text-center">
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
        disabled={busy}
      />
      <ImageIcon className="w-7 h-7 mx-auto text-studio-ink-3 mb-2" />
      <p className="text-sm font-medium text-studio-ink">{busy ? "Uploading…" : "Add cover image"}</p>
      {err && <p className="text-xs text-rose-600 mt-2">{err}</p>}
    </label>
  );
}
