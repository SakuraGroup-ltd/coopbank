"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  X,
  ExternalLink,
} from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";

type Mode = "create" | "edit";

type Photo = { id?: string | number; url?: string; alt?: string };

export type BranchDraft = {
  id?: string | number;
  name: string;
  type: string;
  region: string;
  address: string;
  phone: string;
  hoursWeekday: string;
  hoursSaturday: string;
  coordinates: { lat?: number; lng?: number };
  mapsUrl: string;
  photo?: Photo;
  isHq: boolean;
  comingSoon: boolean;
  expectedOpening?: string;
  active: boolean;
};

const TYPES = [
  { value: "branch", label: "Branch" },
  { value: "agency", label: "Agency (CoopWakala)" },
  { value: "sub-branch", label: "Sub-branch" },
  { value: "atm", label: "ATM only" },
];

const REGIONS = [
  { value: "arusha", label: "Arusha" },
  { value: "dar-es-salaam", label: "Dar es Salaam" },
  { value: "dodoma", label: "Dodoma" },
  { value: "kagera", label: "Kagera" },
  { value: "kilimanjaro", label: "Kilimanjaro" },
  { value: "mbeya", label: "Mbeya" },
  { value: "mtwara", label: "Mtwara" },
  { value: "mwanza", label: "Mwanza" },
  { value: "tabora", label: "Tabora" },
  { value: "other", label: "Other" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export function BranchForm({ mode, initial }: { mode: Mode; initial: BranchDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<BranchDraft>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const idRef = useRef<string | number | undefined>(initial.id);

  function patch(partial: Partial<BranchDraft>) {
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
        type: draft.type,
        region: draft.region,
        address: draft.address,
        phone: draft.phone,
        hoursWeekday: draft.hoursWeekday,
        hoursSaturday: draft.hoursSaturday,
        coordinates: draft.coordinates,
        mapsUrl: draft.mapsUrl,
        ...(draft.photo?.id ? { photo: draft.photo.id } : {}),
        isHq: draft.isHq,
        comingSoon: draft.comingSoon,
        expectedOpening: draft.expectedOpening,
        active: draft.active,
      };
      const currentId = idRef.current;
      const url = currentId ? `/api/branches/${currentId}` : "/api/branches";
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
        window.history.replaceState(null, "", `/studio/branches/${data.doc.id}`);
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
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-0 min-h-screen">
      <div className="p-8 lg:p-10 max-w-[820px] mx-auto w-full animate-fade-up">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-studio-ink-3">
            <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/studio/branches" className="hover:text-studio-ink">Branches</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-studio-ink font-medium truncate max-w-[280px]">
              {draft.name || (mode === "create" ? "New branch" : "Untitled")}
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

        {/* Status badges */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone={draft.active ? "success" : "neutral"}>
            {draft.active ? "Live" : "Paused"}
          </Badge>
          {draft.isHq && <Badge tone="warning">Headquarters</Badge>}
          {draft.comingSoon && <Badge tone="navy">Coming soon</Badge>}
        </div>

        {/* Name */}
        <input
          type="text"
          placeholder="Branch name"
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
          className="block w-full text-3xl font-semibold tracking-tight text-studio-ink bg-transparent border-none focus:outline-none placeholder:text-studio-ink-3/60 mb-6"
        />

        {/* Photo */}
        <PhotoPicker value={draft.photo} onChange={(photo) => patch({ photo })} />

        {/* Address */}
        <Field label="Address">
          <textarea
            placeholder="Street, building, P.O. Box"
            value={draft.address}
            onChange={(e) => patch({ address: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-studio-border bg-studio-panel text-base text-studio-ink leading-relaxed placeholder:text-studio-ink-3 focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none resize-none"
          />
        </Field>

        {/* Phone + Maps URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Phone">
            <Input
              type="tel"
              value={draft.phone}
              onChange={(e) => patch({ phone: e.target.value })}
              placeholder="+255 …"
            />
          </Field>
          <Field label="Google Maps URL">
            <Input
              type="url"
              value={draft.mapsUrl}
              onChange={(e) => patch({ mapsUrl: e.target.value })}
              placeholder="https://goo.gl/maps/…"
            />
          </Field>
        </div>

        {/* Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Field label="Weekday hours">
            <Input
              type="text"
              value={draft.hoursWeekday}
              onChange={(e) => patch({ hoursWeekday: e.target.value })}
              placeholder="8:30AM–4:00PM"
            />
          </Field>
          <Field label="Saturday hours">
            <Input
              type="text"
              value={draft.hoursSaturday}
              onChange={(e) => patch({ hoursSaturday: e.target.value })}
              placeholder="8:30AM–1:30PM"
            />
          </Field>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Field label="Latitude" hint="Lookup precise value on Google Maps">
            <Input
              type="number"
              step="0.000001"
              value={draft.coordinates.lat ?? ""}
              onChange={(e) =>
                patch({
                  coordinates: {
                    ...draft.coordinates,
                    lat: e.target.value === "" ? undefined : Number(e.target.value),
                  },
                })
              }
              placeholder="-6.7924"
            />
          </Field>
          <Field label="Longitude">
            <Input
              type="number"
              step="0.000001"
              value={draft.coordinates.lng ?? ""}
              onChange={(e) =>
                patch({
                  coordinates: {
                    ...draft.coordinates,
                    lng: e.target.value === "" ? undefined : Number(e.target.value),
                  },
                })
              }
              placeholder="39.2083"
            />
          </Field>
        </div>
      </div>

      {/* Right rail */}
      <aside className="bg-studio-panel/50 border-l border-studio-border p-6 lg:p-8 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
        <div className="space-y-5">
          <Block label="Type">
            <Select value={draft.type} onChange={(e) => patch({ type: e.target.value })}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </Block>

          <Block label="Region">
            <Select value={draft.region} onChange={(e) => patch({ region: e.target.value })}>
              {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          </Block>

          <Block label="Visibility">
            <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-studio-border bg-studio-panel cursor-pointer hover:bg-studio-soft mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-studio-ink">Active</p>
                <p className="text-xs text-studio-ink-3 mt-0.5">Show on /branches</p>
              </div>
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => patch({ active: e.target.checked })}
                className="w-4 h-4 accent-cb-green mt-1"
              />
            </label>
            <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-studio-border bg-studio-panel cursor-pointer hover:bg-studio-soft mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-studio-ink">Headquarters</p>
                <p className="text-xs text-studio-ink-3 mt-0.5">Mark as HQ (only one)</p>
              </div>
              <input
                type="checkbox"
                checked={draft.isHq}
                onChange={(e) => patch({ isHq: e.target.checked })}
                className="w-4 h-4 accent-cb-green mt-1"
              />
            </label>
            <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-studio-border bg-studio-panel cursor-pointer hover:bg-studio-soft">
              <div className="flex-1">
                <p className="text-sm font-medium text-studio-ink">Coming soon</p>
                <p className="text-xs text-studio-ink-3 mt-0.5">Hide hours, show ETA</p>
              </div>
              <input
                type="checkbox"
                checked={draft.comingSoon}
                onChange={(e) => patch({ comingSoon: e.target.checked })}
                className="w-4 h-4 accent-cb-green mt-1"
              />
            </label>
          </Block>

          {draft.comingSoon && (
            <Block label="Expected opening">
              <Input
                type="text"
                value={draft.expectedOpening || ""}
                onChange={(e) => patch({ expectedOpening: e.target.value })}
                placeholder="Q3 2026"
              />
            </Block>
          )}

          {draft.mapsUrl && (
            <a
              href={draft.mapsUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 p-3 rounded-xl border border-studio-border bg-studio-panel hover:bg-studio-soft text-sm text-studio-ink"
            >
              <MapPin className="w-4 h-4 text-studio-ink-3" />
              <span className="flex-1">Open on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-studio-ink-3" />
            </a>
          )}
        </div>
      </aside>
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

function PhotoPicker({ value, onChange }: { value?: Photo; onChange: (n?: Photo) => void }) {
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
      <div className="mb-6 relative rounded-2xl overflow-hidden border border-studio-border">
        <img src={value.url} alt={value.alt || ""} className="w-full aspect-[16/8] object-cover" />
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
    <label className="mb-6 block cursor-pointer rounded-2xl border-2 border-dashed border-studio-border bg-studio-panel/50 hover:border-cb-navy/30 px-6 py-10 text-center">
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
        disabled={busy}
      />
      <ImageIcon className="w-7 h-7 mx-auto text-studio-ink-3 mb-2" />
      <p className="text-sm font-medium text-studio-ink">{busy ? "Uploading…" : "Add branch photo"}</p>
      <p className="text-xs text-studio-ink-3 mt-1">Exterior shot. Used on /branches detail.</p>
      {err && <p className="text-xs text-rose-600 mt-2">{err}</p>}
    </label>
  );
}
