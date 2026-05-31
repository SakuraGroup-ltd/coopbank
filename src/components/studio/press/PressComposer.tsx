"use client";

import "../editor/tiptap.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Loader2, CheckCircle2, AlertCircle, FileText, Upload, X, ExternalLink } from "lucide-react";
import { Tiptap } from "../editor/Tiptap";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";

type Mode = "create" | "edit";
type Status = "draft" | "published" | undefined;
type Doc = { id?: string | number; url?: string; filename?: string };

export type PressDraft = {
  id?: string | number;
  headline: string;
  slug: string;
  category: string;
  releaseDate: string;
  summary: string;
  bodyHtml: string;
  document?: Doc;
  status?: Status;
};

const CATEGORIES = [
  { value: "corporate", label: "Corporate" },
  { value: "regulatory", label: "Regulatory" },
  { value: "financial", label: "Financial Results" },
  { value: "leadership", label: "Leadership" },
  { value: "agm", label: "AGM / Dividend" },
  { value: "product", label: "Product Launch" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export function PressComposer({ mode, initial }: { mode: Mode; initial: PressDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<PressDraft>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const idRef = useRef<string | number | undefined>(initial.id);

  function patch(p: Partial<PressDraft>) {
    setDraft((d) => ({ ...d, ...p }));
    setIsDirty(true);
    setSaveState("idle");
  }

  useEffect(() => {
    if (!draft.slug && draft.headline) {
      const s = draft.headline.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      setDraft((d) => ({ ...d, slug: s }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.headline]);

  const persist = useCallback(async (status?: Status): Promise<boolean> => {
    setSaveState("saving");
    setSaveError(null);
    try {
      const body: Record<string, unknown> = {
        headline: draft.headline,
        slug: draft.slug,
        category: draft.category,
        releaseDate: draft.releaseDate,
        summary: draft.summary,
        bodyHtml: draft.bodyHtml,
      };
      if (draft.document?.id) body.document = draft.document.id;
      if (status) body._status = status;
      const currentId = idRef.current;
      const url = currentId ? `/api/press-releases/${currentId}?draft=true` : "/api/press-releases?draft=true";
      const method = currentId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        setSaveState("error");
        setSaveError((await res.text().catch(() => "")) || `HTTP ${res.status}`);
        return false;
      }
      const data = await res.json();
      if (!currentId && data?.doc?.id) {
        idRef.current = data.doc.id;
        window.history.replaceState(null, "", `/studio/press/${data.doc.id}`);
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
  }, [draft]);

  useEffect(() => {
    if (!isDirty || (!idRef.current && (!draft.headline || !draft.summary))) return;
    const t = setTimeout(() => persist(), 1500);
    return () => clearTimeout(t);
  }, [draft, isDirty, persist]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-0 min-h-screen">
      <div className="p-8 lg:p-10 max-w-[820px] mx-auto w-full animate-fade-up">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-studio-ink-3">
            <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/studio/press" className="hover:text-studio-ink">Press releases</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-studio-ink font-medium truncate max-w-[280px]">
              {draft.headline || (mode === "create" ? "New release" : "Untitled")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SaveStatus state={saveState} savedAt={savedAt} error={saveError} />
            <button onClick={() => persist("draft").then((ok) => ok && router.refresh())} className="h-9 px-4 text-sm rounded-lg border border-studio-border bg-studio-panel hover:bg-studio-soft text-studio-ink font-medium">Save as draft</button>
            <button onClick={() => persist("published").then((ok) => ok && router.refresh())} className="h-9 px-4 text-sm rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium">
              {draft.status === "published" ? "Update release" : "Publish"}
            </button>
          </div>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <Badge tone={draft.status === "published" ? "success" : "neutral"}>{draft.status === "published" ? "Published" : "Draft"}</Badge>
          <Badge tone="navy">{CATEGORIES.find((c) => c.value === draft.category)?.label}</Badge>
        </div>

        <input type="text" placeholder="Headline" value={draft.headline} onChange={(e) => patch({ headline: e.target.value })} className="block w-full text-3xl font-semibold tracking-tight text-studio-ink bg-transparent border-none focus:outline-none placeholder:text-studio-ink-3/60 mb-3" />
        <input type="text" placeholder="url-slug" value={draft.slug} onChange={(e) => patch({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+/, "") })} className="block w-full text-sm font-mono text-studio-ink-3 bg-transparent border-none focus:outline-none mb-6" />

        <label className="block text-xs font-semibold text-studio-ink-2 mb-2 uppercase tracking-wider">Lede</label>
        <textarea
          value={draft.summary}
          onChange={(e) => patch({ summary: e.target.value })}
          rows={3}
          placeholder="One paragraph — what's the news, in plain language."
          className="w-full px-4 py-3 rounded-2xl border border-studio-border bg-studio-panel text-base text-studio-ink leading-relaxed placeholder:text-studio-ink-3 focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none resize-none mb-6"
        />

        <label className="block text-xs font-semibold text-studio-ink-2 mb-2 uppercase tracking-wider">Full body</label>
        <Tiptap initialHtml={draft.bodyHtml} placeholder="Full release. Quotes, financial figures, citations." onChange={(html) => patch({ bodyHtml: html })} />

        <div className="mt-8">
          <label className="block text-xs font-semibold text-studio-ink-2 mb-2 uppercase tracking-wider">Official PDF (optional)</label>
          <PDFPicker value={draft.document} onChange={(document) => patch({ document })} />
        </div>
      </div>

      <aside className="bg-studio-panel/50 border-l border-studio-border p-6 lg:p-8 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
        <div className="space-y-5">
          <Block label="Category">
            <Select value={draft.category} onChange={(e) => patch({ category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </Block>
          <Block label="Release date">
            <Input type="date" value={draft.releaseDate} onChange={(e) => patch({ releaseDate: e.target.value })} />
          </Block>
        </div>
      </aside>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-studio-ink-3 mb-2">{label}</span>{children}</div>;
}

function SaveStatus({ state, savedAt, error }: { state: SaveState; savedAt: Date | null; error: string | null }) {
  if (state === "saving") return <span className="text-xs text-studio-ink-3 inline-flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" />Saving…</span>;
  if (state === "saved" && savedAt) return <span className="text-xs text-emerald-700 inline-flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" />Saved</span>;
  if (state === "error") return <span title={error || ""} className="text-xs text-rose-700 inline-flex items-center gap-1.5"><AlertCircle className="w-3 h-3" />Save failed</span>;
  return null;
}

function PDFPicker({ value, onChange }: { value?: Doc; onChange: (n?: Doc) => void }) {
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt", file.name);
    const res = await fetch("/api/media", { method: "POST", body: formData });
    setBusy(false);
    if (!res.ok) return;
    const data = await res.json();
    onChange({ id: data?.doc?.id, url: data?.doc?.url, filename: data?.doc?.filename || file.name });
  }
  if (value?.url) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-studio-border bg-studio-panel p-4">
        <FileText className="w-5 h-5 text-cb-navy" />
        <a href={value.url} target="_blank" rel="noopener" className="flex-1 text-sm font-medium text-studio-ink hover:text-cb-navy truncate inline-flex items-center gap-1">
          {value.filename || "release.pdf"}
          <ExternalLink className="w-3 h-3" />
        </a>
        <button onClick={() => onChange(undefined)} className="text-xs text-studio-ink-3 hover:text-rose-600 inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50"><X className="w-3 h-3" />Remove</button>
      </div>
    );
  }
  return (
    <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-studio-border bg-studio-panel/50 hover:border-cb-navy/30 px-6 py-8 text-center">
      <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} disabled={busy} />
      <Upload className="w-7 h-7 mx-auto text-studio-ink-3 mb-2" />
      <p className="text-sm font-medium text-studio-ink">{busy ? "Uploading…" : "Attach official PDF"}</p>
    </label>
  );
}
