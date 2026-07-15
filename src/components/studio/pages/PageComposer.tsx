"use client";

// Page composer — stackable blocks (the most complex Studio surface).
// Each block has its own mini-form. Editors drag to reorder, hit + to
// add a new block, X to delete, eye to live-preview.
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { BlockPicker } from "./BlockPicker";
import { BlockEditor } from "./BlockEditor";
import { cn } from "../ui/cn";

type Mode = "create" | "edit";
type Status = "draft" | "published" | undefined;
type Block = { blockType: string; [k: string]: unknown };

export type PageDraft = {
  id?: string | number;
  title: string;
  slug: string;
  layout: Array<Record<string, unknown>>;
  seo?: { metaTitle?: string; metaDescription?: string };
  status?: Status;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const BLOCK_LABEL: Record<string, string> = {
  hero: "Hero",
  "media-slider": "Media slider",
  "product-carousel": "Product carousel",
  "product-grid": "Product grid",
  "image-text": "Image + text",
  "rich-text": "Rich text",
  stats: "Stats strip",
  faq: "FAQ",
  "cta-strip": "CTA strip",
  "featured-news": "Featured news",
  "hero-slider": "Hero slider",
  "quick-links": "Quick links",
  "app-promo": "App promo",
  "services-grid": "Services grid",
  "forex-ticker": "Forex ticker",
  "page-header": "Page header",
  "bank-prayer": "Bank prayer",
  story: "Story",
  "branch-network": "Branch network",
  "journey-timeline": "Journey timeline",
  "mission-vision": "Mission & vision",
  "core-values": "Core values",
  "contact-details": "Contact details",
  "contact-form": "Contact form",
  "contact-map": "Map",
};

export function PageComposer({ mode, initial }: { mode: Mode; initial: PageDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<PageDraft>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [openBlock, setOpenBlock] = useState<number | null>(null);
  const [showPicker, setShowPicker] = useState<number | null>(null);
  const idRef = useRef<string | number | undefined>(initial.id);

  function patch(partial: Partial<PageDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
    setIsDirty(true);
    setSaveState("idle");
  }

  function updateBlock(index: number, data: Record<string, unknown>) {
    setDraft((d) => ({
      ...d,
      layout: d.layout.map((b, i) => (i === index ? { ...b, ...data } : b)),
    }));
    setIsDirty(true);
    setSaveState("idle");
  }

  function moveBlock(from: number, to: number) {
    if (to < 0 || to >= draft.layout.length) return;
    setDraft((d) => {
      const next = [...d.layout];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...d, layout: next };
    });
    setIsDirty(true);
    setOpenBlock(to);
  }

  function deleteBlock(index: number) {
    if (!confirm("Delete this block?")) return;
    setDraft((d) => ({
      ...d,
      layout: d.layout.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
    setOpenBlock(null);
  }

  function addBlock(blockType: string, insertAt: number) {
    const newBlock = { blockType };
    setDraft((d) => {
      const next = [...d.layout];
      next.splice(insertAt, 0, newBlock);
      return { ...d, layout: next };
    });
    setIsDirty(true);
    setShowPicker(null);
    setOpenBlock(insertAt);
  }

  // Auto-slug
  useEffect(() => {
    if (!draft.slug && draft.title) {
      const slug = draft.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setDraft((d) => ({ ...d, slug }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.title]);

  const persist = useCallback(
    async (status?: Status): Promise<boolean> => {
      setSaveState("saving");
      setSaveError(null);
      try {
        const body: Record<string, unknown> = {
          title: draft.title,
          slug: draft.slug,
          layout: draft.layout,
        };
        if (draft.seo) body.seo = draft.seo;
        if (status) body._status = status;
        const currentId = idRef.current;
        const url = currentId
          ? `/api/pages/${currentId}?draft=true`
          : "/api/pages?draft=true";
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
          window.history.replaceState(null, "", `/studio/pages/${data.doc.id}`);
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
    if (!idRef.current && (!draft.title || !draft.slug)) return;
    const t = setTimeout(() => persist(), 2000);
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

  return (
    <div className="p-8 lg:p-10 max-w-[960px] mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2 text-xs text-studio-ink-3">
          <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/studio/pages" className="hover:text-studio-ink">Pages</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-studio-ink font-medium truncate max-w-[280px]">
            {draft.title || (mode === "create" ? "New page" : "Untitled")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SaveStatus state={saveState} savedAt={savedAt} error={saveError} />
          {draft.slug && (
            <Link
              href={`/preview/${draft.slug}`}
              target="_blank"
              className="h-9 px-3 text-sm inline-flex items-center gap-2 rounded-lg border border-studio-border bg-studio-panel hover:bg-studio-soft text-studio-ink font-medium"
            >
              <Eye className="w-4 h-4" />
              Preview
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg border border-studio-border bg-studio-panel hover:bg-studio-soft text-studio-ink font-medium"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
          >
            {draft.status === "published" ? "Update page" : "Publish"}
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <Badge tone={draft.status === "published" ? "success" : "neutral"}>
          {draft.status === "published" ? "Published" : "Draft"}
        </Badge>
        <span className="text-xs text-studio-ink-3">{draft.layout.length} block{draft.layout.length === 1 ? "" : "s"}</span>
      </div>

      {/* Title + slug */}
      <input
        type="text"
        placeholder="Page title"
        value={draft.title}
        onChange={(e) => patch({ title: e.target.value })}
        className="block w-full text-3xl font-semibold tracking-tight text-studio-ink bg-transparent border-none focus:outline-none placeholder:text-studio-ink-3/60 mb-2"
      />
      <div className="flex items-center gap-2 mb-8 text-sm text-studio-ink-3">
        <span className="font-mono">/</span>
        <input
          type="text"
          placeholder="url-slug"
          value={draft.slug}
          onChange={(e) =>
            patch({
              slug: e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, "-")
                .replace(/^-+/, ""),
            })
          }
          className="font-mono text-studio-ink-3 bg-transparent border-none focus:outline-none focus:text-studio-ink"
        />
      </div>

      {/* Block stack */}
      <div className="space-y-3">
        <BlockInsertSlot index={0} onAdd={(t) => addBlock(t, 0)} show={showPicker} setShow={setShowPicker} />
        {draft.layout.map((block, i) => (
          <div key={i}>
            <BlockCard
              block={block as Block}
              index={i}
              total={draft.layout.length}
              isOpen={openBlock === i}
              onToggle={() => setOpenBlock(openBlock === i ? null : i)}
              onChange={(data) => updateBlock(i, data)}
              onDelete={() => deleteBlock(i)}
              onMoveUp={() => moveBlock(i, i - 1)}
              onMoveDown={() => moveBlock(i, i + 1)}
            />
            <BlockInsertSlot index={i + 1} onAdd={(t) => addBlock(t, i + 1)} show={showPicker} setShow={setShowPicker} />
          </div>
        ))}
        {draft.layout.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-studio-border bg-studio-panel/50 p-12 text-center">
            <p className="text-sm text-studio-ink-3 mb-4">No blocks yet. Stack them in any order.</p>
            <button
              onClick={() => setShowPicker(0)}
              className="inline-flex h-9 px-4 text-sm items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
            >
              <Plus className="w-4 h-4" />
              Add your first block
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BlockInsertSlot({
  index,
  onAdd,
  show,
  setShow,
}: {
  index: number;
  onAdd: (blockType: string) => void;
  show: number | null;
  setShow: (n: number | null) => void;
}) {
  if (show === index) {
    return <BlockPicker onPick={onAdd} onClose={() => setShow(null)} />;
  }
  return (
    <div className="relative h-0 group/slot">
      <button
        onClick={() => setShow(index)}
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-7 px-3 rounded-full bg-studio-panel border border-studio-border text-studio-ink-3 hover:text-cb-navy hover:border-cb-navy/30 inline-flex items-center gap-1 text-xs opacity-0 group-hover/slot:opacity-100 hover:opacity-100 transition-opacity shadow-[0_1px_2px_rgba(15,15,15,0.06)]"
      >
        <Plus className="w-3 h-3" />
        Add block
      </button>
    </div>
  );
}

function BlockCard({
  block,
  index,
  total,
  isOpen,
  onToggle,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  block: Block;
  index: number;
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (data: Record<string, unknown>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const label = BLOCK_LABEL[block.blockType] || block.blockType;
  return (
    <div className="rounded-2xl border border-studio-border bg-studio-panel overflow-hidden shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-studio-ink-3 cursor-grab">
          <GripVertical className="w-4 h-4" />
        </span>
        <button
          onClick={onToggle}
          className="flex-1 flex items-center gap-3 text-left min-w-0"
        >
          <span className="w-8 h-8 rounded-lg bg-studio-soft border border-studio-border flex items-center justify-center text-studio-ink-2 shrink-0 text-[10px] font-semibold uppercase">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-studio-ink truncate">{label}</p>
            <p className="text-xs text-studio-ink-3 truncate">{summarizeBlock(block)}</p>
          </div>
        </button>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="w-7 h-7 rounded-md text-studio-ink-3 hover:bg-studio-soft hover:text-studio-ink inline-flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="w-7 h-7 rounded-md text-studio-ink-3 hover:bg-studio-soft hover:text-studio-ink inline-flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-md text-studio-ink-3 hover:bg-rose-50 hover:text-rose-600 inline-flex items-center justify-center"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="border-t border-studio-border bg-studio-soft/50 p-5">
          <BlockEditor block={block} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

function summarizeBlock(block: Block): string {
  if (block.blockType === "hero") return (block.headline as string) || "—";
  if (block.blockType === "media-slider") {
    const slides = (block.slides as unknown[]) || [];
    return `${slides.length} slide${slides.length === 1 ? "" : "s"}`;
  }
  if (block.blockType === "product-grid") {
    const tiles = (block.tiles as unknown[]) || [];
    return `${(block.heading as string) || "Grid"} · ${tiles.length} tile${tiles.length === 1 ? "" : "s"}`;
  }
  if (block.blockType === "product-carousel") {
    const cards = (block.cards as unknown[]) || [];
    return `${(block.heading as string) || "Carousel"} · ${cards.length} card${cards.length === 1 ? "" : "s"}`;
  }
  if (block.blockType === "stats") {
    const stats = (block.stats as unknown[]) || [];
    return `${stats.length} stat${stats.length === 1 ? "" : "s"}`;
  }
  if (block.blockType === "faq") {
    const items = (block.items as unknown[]) || [];
    return `${items.length} question${items.length === 1 ? "" : "s"}`;
  }
  if (block.blockType === "image-text") return (block.heading as string) || "—";
  if (block.blockType === "cta-strip") return (block.headline as string) || "—";
  if (block.blockType === "featured-news") return (block.heading as string) || "Latest News";
  if (block.blockType === "rich-text") return "Rich text content";

  const data = (block.data as Record<string, unknown>) || {};
  if (block.blockType === "hero-slider") {
    const n = ((data.slides as unknown[]) || []).length;
    return `${n} slide${n === 1 ? "" : "s"}`;
  }
  if (block.blockType === "quick-links") {
    const n = ((data.links as unknown[]) || []).length;
    return `${(data.heading as string) || "Quick links"} · ${n} link${n === 1 ? "" : "s"}`;
  }
  if (block.blockType === "page-header") return (data.title as string) || "—";
  if (["app-promo", "story", "bank-prayer", "branch-network", "journey-timeline", "mission-vision", "core-values", "contact-details", "contact-form", "contact-map"].includes(block.blockType)) {
    return (data.heading as string) || "—";
  }
  if (block.blockType === "forex-ticker") return "FX rates strip";
  if (block.blockType === "services-grid") {
    const n = ((data.tabs as unknown[]) || []).length;
    return `${n} tab${n === 1 ? "" : "s"}`;
  }
  return "—";
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
