"use client";

import "../editor/tiptap.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Tiptap } from "../editor/Tiptap";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

type Mode = "create" | "edit";

export type FaqDraft = {
  id?: string | number;
  question: string;
  answerHtml: string;
  category: string;
  sortOrder: number;
  active: boolean;
};

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "accounts", label: "Accounts" },
  { value: "loans", label: "Loans" },
  { value: "cards", label: "Cards" },
  { value: "digital", label: "Digital Banking" },
  { value: "branches", label: "Branches & ATMs" },
  { value: "security", label: "Security" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export function FaqForm({ mode, initial }: { mode: Mode; initial: FaqDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<FaqDraft>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const idRef = useRef<string | number | undefined>(initial.id);

  function patch(partial: Partial<FaqDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
    setIsDirty(true);
    setSaveState("idle");
  }

  const persist = useCallback(async (): Promise<boolean> => {
    setSaveState("saving");
    setSaveError(null);
    try {
      const body = {
        question: draft.question,
        answerHtml: draft.answerHtml,
        category: draft.category,
        sortOrder: draft.sortOrder,
        active: draft.active,
      };
      const currentId = idRef.current;
      const url = currentId ? `/api/faqs/${currentId}` : "/api/faqs";
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
        window.history.replaceState(null, "", `/studio/faqs/${data.doc.id}`);
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
    if (!idRef.current && !draft.question) return;
    const t = setTimeout(() => persist(), 1500);
    return () => clearTimeout(t);
  }, [draft, isDirty, persist]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-0 min-h-screen">
      <div className="p-8 lg:p-10 max-w-[820px] mx-auto w-full animate-fade-up">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-studio-ink-3">
            <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/studio/faqs" className="hover:text-studio-ink">FAQs</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-studio-ink font-medium truncate max-w-[280px]">
              {draft.question || (mode === "create" ? "New FAQ" : "Untitled")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SaveStatus state={saveState} savedAt={savedAt} error={saveError} />
            <button
              type="button"
              onClick={() => persist().then((ok) => ok && router.refresh())}
              className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
            >
              Save
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="What's the question?"
          value={draft.question}
          onChange={(e) => patch({ question: e.target.value })}
          className="block w-full text-3xl font-semibold tracking-tight text-studio-ink bg-transparent border-none focus:outline-none placeholder:text-studio-ink-3/60 mb-8"
        />

        <label className="block text-xs font-semibold text-studio-ink-2 mb-2 uppercase tracking-wider">
          Answer
        </label>
        <Tiptap
          initialHtml={draft.answerHtml}
          placeholder="Write the customer-facing answer. Keep it concise and clear."
          onChange={(html) => patch({ answerHtml: html })}
        />
      </div>

      <aside className="bg-studio-panel/50 border-l border-studio-border p-6 lg:p-8 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
        <div className="space-y-5">
          <Block label="Category">
            <Select value={draft.category} onChange={(e) => patch({ category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </Block>
          <Block label="Sort order" hint="Lower = appears first">
            <Input
              type="number"
              value={draft.sortOrder}
              onChange={(e) => patch({ sortOrder: Number(e.target.value) })}
            />
          </Block>
          <Block label="Visibility">
            <label className="flex items-center justify-between p-3 rounded-xl border border-studio-border bg-studio-panel cursor-pointer hover:bg-studio-soft">
              <div>
                <p className="text-sm font-medium text-studio-ink">Show on /faqs</p>
                <p className="text-xs text-studio-ink-3 mt-0.5">Uncheck to hide without deleting</p>
              </div>
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => patch({ active: e.target.checked })}
                className="w-4 h-4 accent-cb-green"
              />
            </label>
          </Block>
        </div>
      </aside>
    </div>
  );
}

function Block({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-studio-ink-3">{label}</span>
        {hint && <span className="text-[10px] text-studio-ink-3">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SaveStatus({ state, savedAt, error }: { state: SaveState; savedAt: Date | null; error: string | null }) {
  if (state === "saving") return <span className="text-xs text-studio-ink-3 inline-flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" />Saving…</span>;
  if (state === "saved" && savedAt) return <span className="text-xs text-emerald-700 inline-flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" />Saved</span>;
  if (state === "error") return <span title={error || ""} className="text-xs text-rose-700 inline-flex items-center gap-1.5"><AlertCircle className="w-3 h-3" />Save failed</span>;
  return null;
}
