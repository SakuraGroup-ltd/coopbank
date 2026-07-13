"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Loader2, CheckCircle2, AlertCircle, ImagePlus, Trash2 } from "lucide-react";
import { Input } from "@/components/studio/ui/Input";
import { Select } from "@/components/studio/ui/Select";
import { Badge } from "@/components/studio/ui/Badge";
import { Button } from "@/components/studio/ui/Button";
import { LivePreviewShell } from "@/components/studio/preview/LivePreviewShell";
import type { LeadershipPreviewData } from "@/components/preview/LeadershipPreviewClient";

type Mode = "create" | "edit";

export type LeadershipDraft = {
  id?: string | number;
  name: string;
  title: string;
  category: "board" | "executive" | "senior" | "advisory";
  photo?: { id: number; url: string };
  bio: string;
  email: string;
  linkedin: string;
  sortOrder: number;
  active: boolean;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const CATEGORY_OPTIONS = [
  { value: "board", label: "Board of Directors" },
  { value: "executive", label: "Executive Management" },
  { value: "senior", label: "Senior Management" },
  { value: "advisory", label: "Advisory" },
] as const;

export function LeadershipForm({ mode, initial }: { mode: Mode; initial: LeadershipDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<LeadershipDraft>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const idRef = useRef<string | number | undefined>(initial.id);

  function patch(partial: Partial<LeadershipDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
    setIsDirty(true);
    setSaveState("idle");
  }

  const persist = useCallback(async (): Promise<boolean> => {
    setSaveState("saving");
    setSaveError(null);
    try {
      const body: Record<string, unknown> = {
        name: draft.name,
        title: draft.title,
        category: draft.category,
        bio: draft.bio,
        linkedin: draft.linkedin,
        sortOrder: draft.sortOrder,
        active: draft.active,
        photo: draft.photo?.id ?? null,
        // `email` is a Payload email field — an empty string 400s, so omit it
        // when blank.
        ...(draft.email ? { email: draft.email } : {}),
      };
      const currentId = idRef.current;
      const url = currentId ? `/api/leadership-team/${currentId}` : "/api/leadership-team";
      const res = await fetch(url, {
        method: currentId ? "PATCH" : "POST",
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
        window.history.replaceState(null, "", `/studio/team-leadership/${data.doc.id}`);
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
    if (!idRef.current && !draft.name) return;
    const t = setTimeout(() => persist(), 1500);
    return () => clearTimeout(t);
  }, [draft, isDirty, persist]);

  async function handleSave() {
    const ok = await persist();
    if (ok) router.refresh();
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("_payload", JSON.stringify({ alt: draft.name || "Leadership profile photo" }));
      const res = await fetch("/api/media", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`upload HTTP ${res.status}`);
      const data = await res.json();
      patch({ photo: { id: data.doc.id, url: data.doc.url } });
    } catch (e) {
      setSaveState("error");
      setSaveError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const previewDraft: LeadershipPreviewData = {
    intro: "",
    highlightCount: draft.category === "board" ? 2 : 1,
    people: [{ name: draft.name || "Name", title: draft.title || "Title", image: draft.photo?.url }],
  };

  return (
    <div className="p-8 lg:p-10 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2 text-xs text-studio-ink-3">
          <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/studio/team-leadership" className="hover:text-studio-ink">Leadership</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-studio-ink font-medium truncate max-w-[280px]">
            {draft.name || (mode === "create" ? "New profile" : "Untitled")}
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <LivePreviewShell
          previewSrc={`/studio-preview/leadership?category=${draft.category}`}
          livePath={draft.category === "board" ? "/about-us/board" : "/about-us/management"}
          scope="leadership"
          draft={previewDraft}
          headerRight={
            <span className="inline-flex items-center gap-3">
              <SaveStatus state={saveState} savedAt={savedAt} error={saveError} />
              <Button variant="dark" size="sm" type="button" onClick={handleSave}>
                Save
              </Button>
            </span>
          }
        >
          <div className="pb-10 pr-1 max-w-[560px]">
            <div className="mb-3">
              <Badge tone={draft.active ? "success" : "neutral"}>{draft.active ? "Live" : "Hidden"}</Badge>
            </div>

            <input
              type="text"
              placeholder="Full name"
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              className="block w-full text-3xl font-semibold tracking-tight text-studio-ink bg-transparent border-none focus:outline-none placeholder:text-studio-ink-3/60 mb-6"
            />

            <div className="flex items-start gap-4 mb-6">
              <label className="relative w-24 h-28 flex-shrink-0 rounded-xl overflow-hidden border border-studio-border bg-studio-soft cursor-pointer group">
                {draft.photo?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.photo.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-studio-ink-3">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploading ? "Uploading…" : "Change photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadPhoto(f);
                    e.target.value = "";
                  }}
                />
              </label>
              <div className="flex-1 space-y-4">
                <Field label="Title" hint="e.g. Group Managing Director">
                  <Input value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
                </Field>
                <Field label="Category">
                  <Select
                    value={draft.category}
                    onChange={(e) => patch({ category: e.target.value as LeadershipDraft["category"] })}
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                </Field>
                {draft.photo && (
                  <button
                    type="button"
                    onClick={() => patch({ photo: undefined })}
                    className="inline-flex items-center gap-1 text-xs text-studio-ink-3 hover:text-rose-600"
                  >
                    <Trash2 className="w-3 h-3" /> Remove photo
                  </button>
                )}
              </div>
            </div>

            <Field label="Bio" hint="Short professional biography">
              <textarea
                value={draft.bio}
                onChange={(e) => patch({ bio: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 rounded-lg border border-studio-border bg-studio-panel text-sm text-studio-ink focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Email" hint="Optional public contact">
                <Input type="email" value={draft.email} onChange={(e) => patch({ email: e.target.value })} />
              </Field>
              <Field label="LinkedIn" hint="Optional URL">
                <Input value={draft.linkedin} onChange={(e) => patch({ linkedin: e.target.value })} />
              </Field>
              <Field label="Sort order" hint="Lower = appears first">
                <Input
                  type="number"
                  value={String(draft.sortOrder)}
                  onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })}
                />
              </Field>
            </div>

            <label className="mt-4 flex items-start justify-between gap-3 p-3 rounded-xl border border-studio-border bg-studio-panel cursor-pointer hover:bg-studio-soft max-w-sm">
              <div className="flex-1">
                <p className="text-sm font-medium text-studio-ink">Active</p>
                <p className="text-xs text-studio-ink-3 mt-0.5">Show on the public leadership pages</p>
              </div>
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => patch({ active: e.target.checked })}
                className="w-4 h-4 accent-cb-green mt-1"
              />
            </label>
          </div>
        </LivePreviewShell>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold text-studio-ink-2 uppercase tracking-wider">{label}</span>
        {hint && <span className="text-[10px] text-studio-ink-3">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SaveStatus({ state, savedAt, error }: { state: SaveState; savedAt: Date | null; error: string | null }) {
  if (state === "saving") {
    return (
      <span className="text-xs text-studio-ink-3 inline-flex items-center gap-1.5">
        <Loader2 className="w-3 h-3 animate-spin" /> Saving…
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
        <AlertCircle className="w-3 h-3" /> Save failed
      </span>
    );
  }
  return null;
}
