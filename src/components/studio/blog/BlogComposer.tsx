"use client";

// Blog composer client. Owns the post draft locally so the editor doesn't
// lag against the network, debounces auto-save every 1.5s of idle, and
// surfaces an explicit Save Draft / Publish flow at the top right.
/* eslint-disable @next/next/no-img-element */
import "../editor/tiptap.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { Tiptap } from "../editor/Tiptap";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { cn } from "../ui/cn";

type Mode = "create" | "edit";
type Status = "draft" | "published" | undefined;

type CoverImage = { id?: string | number; url?: string; alt?: string };

export type BlogDraft = {
  id?: string | number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  bodyHtml: string;
  coverImage?: CoverImage;
  tags: string[];
  featured: boolean;
  publishDate: string;
  readTimeMins?: number;
  author?: { id?: string | number; name?: string; email?: string };
  status?: Status;
};

const CATEGORIES = [
  { value: "news", label: "News" },
  { value: "press", label: "Press Release" },
  { value: "literacy", label: "Financial Literacy" },
  { value: "agm", label: "Annual / AGM" },
  { value: "product", label: "Product Update" },
  { value: "insight", label: "Insight" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export function BlogComposer({ mode, initial }: { mode: Mode; initial: BlogDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<BlogDraft>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const idRef = useRef<string | number | undefined>(initial.id);

  function patch(partial: Partial<BlogDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
    setIsDirty(true);
    setSaveState("idle");
  }

  // Auto-slugify the slug when blank as user types title.
  useEffect(() => {
    if (!draft.slug && draft.title) {
      const slug = draft.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setDraft((d) => ({ ...d, slug }));
    }
    // We deliberately only auto-fill when slug is empty — once the user
    // edits the slug field we leave it alone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.title]);

  // Reading-time estimate from bodyHtml (200wpm baseline).
  useEffect(() => {
    const text = draft.bodyHtml.replace(/<[^>]+>/g, " ").trim();
    if (!text) return;
    const words = text.split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    if (mins !== draft.readTimeMins) {
      setDraft((d) => ({ ...d, readTimeMins: mins }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.bodyHtml]);

  const persist = useCallback(
    async (status?: Status): Promise<boolean> => {
      setSaveState("saving");
      setSaveError(null);
      try {
        const body = {
          title: draft.title,
          slug: draft.slug,
          category: draft.category,
          excerpt: draft.excerpt,
          bodyHtml: draft.bodyHtml,
          publishDate: draft.publishDate,
          tags: draft.tags.map((tag) => ({ tag })),
          featured: draft.featured,
          readTimeMins: draft.readTimeMins,
          ...(draft.author?.id ? { author: draft.author.id } : {}),
          ...(draft.coverImage?.id ? { coverImage: draft.coverImage.id } : {}),
          ...(status ? { _status: status } : {}),
        };
        const currentId = idRef.current;
        const url = currentId
          ? `/api/blog-posts/${currentId}?draft=true`
          : "/api/blog-posts?draft=true";
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
        // For new posts, capture the new id so subsequent saves PATCH it.
        if (!currentId && data?.doc?.id) {
          idRef.current = data.doc.id;
          // Replace URL without re-mounting.
          window.history.replaceState(null, "", `/studio/blog/${data.doc.id}`);
        }
        if (status) {
          setDraft((d) => ({ ...d, status }));
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
    },
    [draft],
  );

  // Auto-save (debounced) — only after the post exists or user has typed
  // at least a title for a brand-new post.
  useEffect(() => {
    if (!isDirty) return;
    if (!idRef.current && !draft.title) return;
    const t = setTimeout(() => {
      persist();
    }, 1500);
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
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-0 min-h-screen">
      {/* Center column */}
      <div className="p-8 lg:p-10 max-w-[820px] mx-auto w-full animate-fade-up">
        {/* Breadcrumb + status header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-studio-ink-3">
            <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/studio/blog" className="hover:text-studio-ink">Blog &amp; news</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-studio-ink font-medium truncate max-w-[280px]">
              {draft.title || (mode === "create" ? "New post" : "Untitled")}
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
              className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium transition-colors"
            >
              {draft.status === "published" ? "Publish changes" : "Publish"}
            </button>
          </div>
        </div>

        {/* Title + meta */}
        <div className="mb-2 flex items-center gap-2">
          <Badge tone={draft.status === "published" ? "success" : "neutral"}>
            {draft.status === "published" ? "Published" : "Draft"}
          </Badge>
          <Badge tone="neutral">
            {CATEGORIES.find((c) => c.value === draft.category)?.label || draft.category}
          </Badge>
          {draft.featured && <Badge tone="warning">Featured</Badge>}
        </div>
        <input
          type="text"
          placeholder="Headline. What's the story?"
          value={draft.title}
          onChange={(e) => patch({ title: e.target.value })}
          className="block w-full text-3xl font-semibold tracking-tight text-studio-ink bg-transparent border-none focus:outline-none placeholder:text-studio-ink-3/60 mb-3"
        />
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
          className="block w-full text-sm font-mono text-studio-ink-3 bg-transparent border-none focus:outline-none mb-6"
        />

        {/* Cover */}
        <CoverPicker
          value={draft.coverImage}
          onChange={(coverImage) => patch({ coverImage })}
        />

        {/* Excerpt */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-studio-ink-2 mb-2 uppercase tracking-wider">
            Featured excerpt
          </label>
          <textarea
            placeholder="One or two sentences — this is what readers see on the news rail."
            value={draft.excerpt}
            onChange={(e) => patch({ excerpt: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-studio-border bg-studio-panel text-base text-studio-ink leading-relaxed placeholder:text-studio-ink-3 focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none resize-none"
          />
        </div>

        {/* Body */}
        <label className="block text-xs font-semibold text-studio-ink-2 mb-2 uppercase tracking-wider">
          Body
        </label>
        <Tiptap
          initialHtml={draft.bodyHtml}
          placeholder="Tell the story. Use headings to break it up."
          onChange={(html) => patch({ bodyHtml: html })}
        />
      </div>

      {/* Right rail */}
      <aside className="bg-studio-panel/50 border-l border-studio-border p-6 lg:p-8 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
        <div className="space-y-5">
          {/* Author */}
          <SidebarBlock label="Author">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-studio-border bg-studio-panel">
              <Avatar name={draft.author?.name || draft.author?.email} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-studio-ink truncate">
                  {draft.author?.name || "Editor"}
                </p>
                <p className="text-xs text-studio-ink-3 truncate">
                  {draft.author?.email}
                </p>
              </div>
            </div>
          </SidebarBlock>

          {/* Publish date */}
          <SidebarBlock label="Publish date">
            <Input
              type="date"
              value={draft.publishDate}
              onChange={(e) => patch({ publishDate: e.target.value })}
            />
          </SidebarBlock>

          {/* Category */}
          <SidebarBlock label="Category">
            <Select
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </SidebarBlock>

          {/* Tags */}
          <SidebarBlock label="Tags" hint="Press Enter to add">
            <TagInput
              value={draft.tags}
              onChange={(tags) => patch({ tags })}
            />
          </SidebarBlock>

          {/* Featured toggle */}
          <SidebarBlock label="Visibility">
            <label className="flex items-center justify-between p-3 rounded-xl border border-studio-border bg-studio-panel cursor-pointer hover:bg-studio-soft transition-colors">
              <div>
                <p className="text-sm font-medium text-studio-ink">Featured</p>
                <p className="text-xs text-studio-ink-3 mt-0.5">Pin to the homepage news rail.</p>
              </div>
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => patch({ featured: e.target.checked })}
                className="w-4 h-4 accent-cb-green"
              />
            </label>
          </SidebarBlock>

          {/* Stats */}
          <SidebarBlock label="Stats">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl border border-studio-border bg-studio-panel">
                <p className="text-[10px] uppercase tracking-[0.08em] text-studio-ink-3 font-semibold">Read time</p>
                <p className="text-base font-semibold text-studio-ink">
                  {draft.readTimeMins ? `${draft.readTimeMins} min` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-studio-border bg-studio-panel">
                <p className="text-[10px] uppercase tracking-[0.08em] text-studio-ink-3 font-semibold">Words</p>
                <p className="text-base font-semibold text-studio-ink">
                  {draft.bodyHtml
                    ? draft.bodyHtml.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length
                    : 0}
                </p>
              </div>
            </div>
          </SidebarBlock>

          {/* Preview link */}
          {draft.slug && (
            <SidebarBlock label="Preview">
              <Link
                href={`/preview/news/${draft.slug}`}
                target="_blank"
                className="flex items-center gap-2 p-3 rounded-xl border border-studio-border bg-studio-panel hover:bg-studio-soft transition-colors text-sm text-studio-ink"
              >
                <Eye className="w-4 h-4 text-studio-ink-3" />
                <span className="flex-1">Open live preview</span>
                <ExternalLink className="w-3.5 h-3.5 text-studio-ink-3" />
              </Link>
            </SidebarBlock>
          )}
        </div>
      </aside>
    </div>
  );
}

function SidebarBlock({
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
    return (
      <span className="text-xs text-emerald-700 inline-flex items-center gap-1.5">
        <CheckCircle2 className="w-3 h-3" />
        Saved {timeAgoShort(savedAt)}
      </span>
    );
  }
  if (state === "error") {
    return (
      <span
        title={error || "save failed"}
        className="text-xs text-rose-700 inline-flex items-center gap-1.5"
      >
        <AlertCircle className="w-3 h-3" />
        Save failed
      </span>
    );
  }
  return null;
}

function timeAgoShort(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [pending, setPending] = useState("");
  function commit() {
    const t = pending.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setPending("");
  }
  return (
    <div className="rounded-xl border border-studio-border bg-studio-panel p-2 flex flex-wrap gap-1.5 min-h-[40px]">
      {value.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded-md bg-studio-soft border border-studio-border px-2 py-0.5 text-xs text-studio-ink"
        >
          {t}
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== t))}
            className="text-studio-ink-3 hover:text-studio-ink"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={pending}
        onChange={(e) => setPending(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Backspace" && !pending && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder={value.length === 0 ? "add tags…" : ""}
        className="flex-1 min-w-[80px] text-xs bg-transparent border-none focus:outline-none px-1"
      />
    </div>
  );
}

function CoverPicker({
  value,
  onChange,
}: {
  value?: CoverImage;
  onChange: (next?: CoverImage) => void;
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
        alt: data?.doc?.alt,
      });
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  if (value?.url) {
    return (
      <div className="mb-6 relative rounded-2xl overflow-hidden border border-studio-border group">
        <img
          src={value.url}
          alt={value.alt || ""}
          className="w-full aspect-[16/8] object-cover"
        />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-studio-ink/80 backdrop-blur text-white text-xs hover:bg-studio-ink transition-colors"
        >
          <X className="w-3 h-3" />
          Remove
        </button>
      </div>
    );
  }

  return (
    <label
      className={cn(
        "mb-6 block cursor-pointer rounded-2xl border-2 border-dashed border-studio-border bg-studio-panel/50",
        "hover:border-cb-navy/30 hover:bg-cb-navy/2 transition-colors",
        "px-6 py-12 text-center",
      )}
    >
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
        disabled={busy}
      />
      <ImageIcon className="w-8 h-8 mx-auto text-studio-ink-3 mb-3" />
      <p className="text-sm font-medium text-studio-ink">
        {busy ? "Uploading…" : "Add a cover image"}
      </p>
      <p className="text-xs text-studio-ink-3 mt-1">
        16:9 looks best. Click to choose or drop a file.
      </p>
      {err && <p className="text-xs text-rose-600 mt-2">{err}</p>}
    </label>
  );
}
