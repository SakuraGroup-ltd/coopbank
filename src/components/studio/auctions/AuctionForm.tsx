"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Loader2, CheckCircle2, AlertCircle, Landmark } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";

type Mode = "create" | "edit";

export type AuctionDraft = {
  id?: string | number;
  instrument: string;
  tenor: string;
  announcementDate: string;
  auctionDate: string;
  valueDate: string;
  maturityDate: string;
  notes: string;
  status: string;
  active: boolean;
};

const STATUSES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "open", label: "Open for bids" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export function AuctionForm({ mode, initial }: { mode: Mode; initial: AuctionDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<AuctionDraft>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const idRef = useRef<string | number | undefined>(initial.id);

  function patch(p: Partial<AuctionDraft>) {
    setDraft((d) => ({ ...d, ...p }));
    setIsDirty(true);
    setSaveState("idle");
  }

  const persist = useCallback(async (): Promise<boolean> => {
    setSaveState("saving");
    setSaveError(null);
    try {
      const body: Record<string, unknown> = {
        instrument: draft.instrument,
        tenor: draft.tenor,
        announcementDate: draft.announcementDate,
        auctionDate: draft.auctionDate,
        status: draft.status,
        active: draft.active,
      };
      if (draft.valueDate) body.valueDate = draft.valueDate;
      if (draft.maturityDate) body.maturityDate = draft.maturityDate;
      if (draft.notes) body.notes = draft.notes;
      const currentId = idRef.current;
      const url = currentId ? `/api/auctions/${currentId}` : "/api/auctions";
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
        window.history.replaceState(null, "", `/studio/auctions/${data.doc.id}`);
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
    if (!idRef.current && !draft.instrument) return;
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
            <Link href="/studio/auctions" className="hover:text-studio-ink">Auctions</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-studio-ink font-medium truncate max-w-[280px]">
              {draft.instrument || (mode === "create" ? "New auction" : "Untitled")}
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

        <div className="flex items-center gap-2 mb-2">
          <Badge tone="navy">{STATUSES.find((s) => s.value === draft.status)?.label || draft.status}</Badge>
          <Badge tone="neutral">{draft.tenor || "—"}</Badge>
        </div>

        <input
          type="text"
          placeholder="e.g. Treasury Bond"
          value={draft.instrument}
          onChange={(e) => patch({ instrument: e.target.value })}
          className="block w-full text-3xl font-semibold tracking-tight text-studio-ink bg-transparent border-none focus:outline-none placeholder:text-studio-ink-3/60 mb-6"
        />

        <div className="rounded-2xl border border-studio-border bg-studio-panel p-6 space-y-5">
          <Field label="Tenor" hint="e.g. 91-day, 5-year, 15-year">
            <Input value={draft.tenor} onChange={(e) => patch({ tenor: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Announcement date">
              <Input type="date" value={draft.announcementDate} onChange={(e) => patch({ announcementDate: e.target.value })} />
            </Field>
            <Field label="Auction date">
              <Input type="date" value={draft.auctionDate} onChange={(e) => patch({ auctionDate: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Value date" hint="When funds settle">
              <Input type="date" value={draft.valueDate} onChange={(e) => patch({ valueDate: e.target.value })} />
            </Field>
            <Field label="Maturity date">
              <Input type="date" value={draft.maturityDate} onChange={(e) => patch({ maturityDate: e.target.value })} />
            </Field>
          </div>
          <Field label="Notes" hint="Public — shown alongside the listing">
            <textarea
              value={draft.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-studio-border bg-studio-panel text-sm focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none resize-none"
            />
          </Field>
        </div>
      </div>

      <aside className="bg-studio-panel/50 border-l border-studio-border p-6 lg:p-8 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
        <div className="space-y-5">
          <Block label="Status">
            <Select value={draft.status} onChange={(e) => patch({ status: e.target.value })}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </Block>
          <Block label="Visibility">
            <label className="flex items-center justify-between p-3 rounded-xl border border-studio-border bg-studio-panel cursor-pointer hover:bg-studio-soft">
              <div>
                <p className="text-sm font-medium text-studio-ink">Show publicly</p>
                <p className="text-xs text-studio-ink-3 mt-0.5">Uncheck to hide</p>
              </div>
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => patch({ active: e.target.checked })}
                className="w-4 h-4 accent-cb-green"
              />
            </label>
          </Block>
          <div className="p-4 rounded-xl bg-cb-navy/5 border border-cb-navy/10">
            <p className="text-xs text-studio-ink-2 leading-relaxed inline-flex items-start gap-2">
              <Landmark className="w-3.5 h-3.5 mt-0.5 text-cb-navy shrink-0" />
              <span>
                <span className="font-semibold text-studio-ink">Treasury Bills + Bonds</span>
                <br />
                Mirror the BOT calendar. Once the auction date passes, mark Completed to archive.
              </span>
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
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
      <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-studio-ink-3 mb-2">{label}</span>
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
