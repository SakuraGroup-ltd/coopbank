"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ImagePlus,
} from "lucide-react";
import { Input } from "@/components/studio/ui/Input";
import { Button } from "@/components/studio/ui/Button";
import {
  resolveShowcaseCards,
  type ShowcaseCard,
} from "@/components/home/showcase-data";
import { LivePreviewShell } from "@/components/studio/preview/LivePreviewShell";

// One editable card, global-shaped. `docId` present = persisted row.
export type ShowcaseDraftCard = {
  docId?: number;
  title: string;
  bullets: string; // one per line, exactly as stored
  href: string;
  image?: { id: number; url: string };
  active: boolean;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function ShowcaseEditor({ initialCards }: { initialCards: ShowcaseDraftCard[] }) {
  const router = useRouter();
  const [cards, setCards] = useState<ShowcaseDraftCard[]>(initialCards);
  // ids that existed at load (or after last save) — save diffs against this.
  const persistedIds = useRef<number[]>(initialCards.map((c) => c.docId!).filter(Boolean));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  function patchCard(i: number, partial: Partial<ShowcaseDraftCard>) {
    setCards((prev) => {
      const next = prev.slice();
      next[i] = { ...next[i], ...partial };
      return next;
    });
    setSaveState("idle");
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= cards.length) return;
    const next = cards.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setCards(next);
    setSaveState("idle");
  }

  // Same resolver production uses → preview identical to the live carousel.
  const previewCards: ShowcaseCard[] = resolveShowcaseCards(
    cards.map((c) => ({
      title: c.title,
      bullets: c.bullets,
      href: c.href,
      active: c.active,
      image: c.image ? { url: c.image.url } : null,
    })),
  );

  async function uploadImage(i: number, file: File) {
    setUploadingIdx(i);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("_payload", JSON.stringify({ alt: cards[i].title || "Showcase card" }));
      const res = await fetch("/api/media", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`upload HTTP ${res.status}`);
      const data = await res.json();
      patchCard(i, { image: { id: data.doc.id, url: data.doc.url } });
    } catch (e) {
      setSaveState("error");
      setSaveError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingIdx(null);
    }
  }

  async function handleSave() {
    setSaveState("saving");
    setSaveError(null);
    try {
      const keptIds = new Set(cards.map((c) => c.docId).filter(Boolean));
      // deletions first, then upserts in display order
      for (const id of persistedIds.current) {
        if (!keptIds.has(id)) {
          const res = await fetch(`/api/showcase-cards/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`delete HTTP ${res.status}`);
        }
      }
      const nextIds: number[] = [];
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const body = {
          title: c.title,
          bullets: c.bullets,
          href: c.href,
          sortOrder: (i + 1) * 10,
          active: c.active,
          image: c.image?.id ?? null,
        };
        const res = await fetch(c.docId ? `/api/showcase-cards/${c.docId}` : "/api/showcase-cards", {
          method: c.docId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `HTTP ${res.status}`);
        }
        const data = await res.json();
        const id = c.docId ?? data?.doc?.id;
        if (!c.docId && id) patchCard(i, { docId: id });
        if (id) nextIds.push(id);
      }
      persistedIds.current = nextIds;
      setSaveState("saved");
      setSavedAt(new Date());
      router.refresh();
    } catch (e) {
      setSaveState("error");
      setSaveError(e instanceof Error ? e.message : "Network error");
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-studio-ink-3">
          <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-studio-ink font-medium">Homepage slider</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <LivePreviewShell
          previewSrc="/studio-preview/showcase"
          livePath="/"
          scope="showcase"
          draft={previewCards}
          headerRight={
            <span className="inline-flex items-center gap-3">
              <SaveStatus state={saveState} savedAt={savedAt} error={saveError} />
              <Button variant="dark" size="sm" type="button" onClick={handleSave}>
                Save
              </Button>
            </span>
          }
        >
          <div className="space-y-4 pb-10 pr-1">
            <p className="text-xs text-studio-ink-3">
              Cards appear on the homepage in this order. Deactivated cards stay here but are hidden
              from the site. Bullets: one per line.
            </p>
            {cards.map((card, i) => (
              <div key={card.docId ?? `new-${i}`} className="rounded-xl border border-studio-border bg-studio-panel p-4">
                <div className="flex items-start gap-3">
                  <label className="relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-studio-border bg-studio-soft cursor-pointer group">
                    {card.image?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.image.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-studio-ink-3">
                        {uploadingIdx === i ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingIdx === i ? "Uploading…" : "Change"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadImage(i, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={card.title}
                        placeholder="Card title"
                        onChange={(e) => patchCard(i, { title: e.target.value })}
                        className="font-semibold"
                      />
                      <div className="flex items-center flex-shrink-0">
                        <IconBtn label="Move up" onClick={() => move(i, -1)}><ChevronUp className="w-4 h-4" /></IconBtn>
                        <IconBtn label="Move down" onClick={() => move(i, 1)}><ChevronDown className="w-4 h-4" /></IconBtn>
                        <IconBtn label="Remove" danger onClick={() => { setCards(cards.filter((_, j) => j !== i)); setSaveState("idle"); }}>
                          <Trash2 className="w-4 h-4" />
                        </IconBtn>
                      </div>
                    </div>
                    <textarea
                      value={card.bullets}
                      placeholder={"Up to 10% p.a. interest\nFlexible tenure from 3 months"}
                      onChange={(e) => patchCard(i, { bullets: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-studio-border bg-studio-panel text-sm text-studio-ink placeholder:text-studio-ink-3 focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none"
                    />
                    <div className="flex items-center gap-3">
                      <Input
                        value={card.href}
                        placeholder="/personal-banking#jasiri"
                        onChange={(e) => patchCard(i, { href: e.target.value })}
                      />
                      <label className="inline-flex items-center gap-1.5 text-xs text-studio-ink-2 whitespace-nowrap cursor-pointer">
                        <input
                          type="checkbox"
                          checked={card.active}
                          onChange={(e) => patchCard(i, { active: e.target.checked })}
                          className="w-3.5 h-3.5 accent-cb-green"
                        />
                        Live
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setCards([...cards, { title: "", bullets: "", href: "", active: true }]);
                setSaveState("idle");
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add card
            </Button>
          </div>
        </LivePreviewShell>
      </div>
    </div>
  );
}

function IconBtn({ label, danger, onClick, children }: { label: string; danger?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`p-1.5 rounded-md text-studio-ink-3 hover:bg-studio-soft transition-colors ${danger ? "hover:text-rose-600" : "hover:text-studio-ink"}`}
    >
      {children}
    </button>
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
    return (
      <span className="text-xs text-emerald-700 inline-flex items-center gap-1.5">
        <CheckCircle2 className="w-3 h-3" /> Saved
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
