"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";

type Mode = "create" | "edit";

export type AgentDraft = {
  id?: string | number;
  name: string;
  region: string;
  district: string;
  ward: string;
  street: string;
  active: boolean;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function AgentForm({ mode, initial }: { mode: Mode; initial: AgentDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<AgentDraft>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const idRef = useRef<string | number | undefined>(initial.id);

  function patch(partial: Partial<AgentDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
    setIsDirty(true);
    setSaveState("idle");
  }

  const persist = useCallback(async (): Promise<boolean> => {
    setSaveState("saving");
    setSaveError(null);
    try {
      const body = {
        name: draft.name,
        region: draft.region,
        district: draft.district,
        ward: draft.ward,
        street: draft.street,
        active: draft.active,
      };
      const currentId = idRef.current;
      const url = currentId ? `/api/coopwakala-agents/${currentId}` : "/api/coopwakala-agents";
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
        window.history.replaceState(null, "", `/studio/agents/${data.doc.id}`);
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

  return (
    <div className="p-8 lg:p-10 max-w-[820px] mx-auto w-full animate-fade-up">
      {/* Breadcrumb + save */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2 text-xs text-studio-ink-3">
          <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/studio/agents" className="hover:text-studio-ink">Agents</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-studio-ink font-medium truncate max-w-[280px]">
            {draft.name || (mode === "create" ? "New agent" : "Untitled")}
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

      <div className="mb-3">
        <Badge tone={draft.active ? "success" : "neutral"}>{draft.active ? "Live" : "Hidden"}</Badge>
      </div>

      {/* Name */}
      <input
        type="text"
        placeholder="Agent name"
        value={draft.name}
        onChange={(e) => patch({ name: e.target.value })}
        className="block w-full text-3xl font-semibold tracking-tight text-studio-ink bg-transparent border-none focus:outline-none placeholder:text-studio-ink-3/60 mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Region" hint="As shown on the map filter">
          <Input type="text" value={draft.region} onChange={(e) => patch({ region: e.target.value })} placeholder="Arusha" />
        </Field>
        <Field label="District">
          <Input type="text" value={draft.district} onChange={(e) => patch({ district: e.target.value })} placeholder="Arusha" />
        </Field>
        <Field label="Ward">
          <Input type="text" value={draft.ward} onChange={(e) => patch({ ward: e.target.value })} placeholder="Kati" />
        </Field>
        <Field label="Street">
          <Input type="text" value={draft.street} onChange={(e) => patch({ street: e.target.value })} placeholder="Pangani" />
        </Field>
      </div>

      <label className="mt-6 flex items-start justify-between gap-3 p-3 rounded-xl border border-studio-border bg-studio-panel cursor-pointer hover:bg-studio-soft max-w-sm">
        <div className="flex-1">
          <p className="text-sm font-medium text-studio-ink">Active</p>
          <p className="text-xs text-studio-ink-3 mt-0.5">Show on the public agents directory</p>
        </div>
        <input
          type="checkbox"
          checked={draft.active}
          onChange={(e) => patch({ active: e.target.checked })}
          className="w-4 h-4 accent-cb-green mt-1"
        />
      </label>
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
