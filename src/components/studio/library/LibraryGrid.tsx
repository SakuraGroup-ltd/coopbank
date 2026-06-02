"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Search,
} from "lucide-react";

export type LibraryItem = {
  name: string;
  size: number;
  contentType: string;
  updated: string;
  publicUrl: string;
};

function readableSize(bytes: number): string {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function LibraryGrid({ items, bucket }: { items: LibraryItem[]; bucket: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [uploads, setUploads] = useState<Array<{ name: string; state: "uploading" | "done" | "error" }>>([]);
  const [selected, setSelected] = useState<LibraryItem | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = query
    ? items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    : items;
  const images = filtered.filter((i) => i.contentType.startsWith("image/"));
  const docs = filtered.filter((i) => !i.contentType.startsWith("image/"));

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const queue = Array.from(files).map((f) => ({ name: f.name, state: "uploading" as const }));
    setUploads(queue);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/library/upload", { method: "POST", body: fd });
        setUploads((cur) =>
          cur.map((u, idx) => (idx === i ? { ...u, state: res.ok ? "done" : "error" } : u)),
        );
      } catch {
        setUploads((cur) => cur.map((u, idx) => (idx === i ? { ...u, state: "error" } : u)));
      }
    }
    setTimeout(() => {
      setUploads([]);
      router.refresh();
    }, 1500);
  }

  async function deleteItem(name: string) {
    if (!confirm(`Delete "${name}" from gs://${bucket}? This is permanent.`)) return;
    const res = await fetch(`/api/library/object?name=${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSelected(null);
      router.refresh();
    } else {
      alert("Delete failed: " + (await res.text().catch(() => "")));
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-studio-ink-3" />
          <input
            type="search"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-9 pr-3 rounded-lg border border-studio-border bg-studio-panel text-sm w-64 focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none"
          />
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Upload queue */}
      {uploads.length > 0 && (
        <div className="mb-6 rounded-2xl border border-studio-border bg-studio-panel p-4 space-y-2">
          {uploads.map((u, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              {u.state === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-studio-ink-3" />}
              {u.state === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {u.state === "error" && <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span className="flex-1 truncate text-studio-ink">{u.name}</span>
              <span className="text-xs text-studio-ink-3 capitalize">{u.state}</span>
            </div>
          ))}
        </div>
      )}

      {/* Images */}
      {images.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider mb-4">
            Images <span className="text-studio-ink-3 font-normal">· {images.length}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {images.map((it) => (
              <button
                key={it.name}
                onClick={() => setSelected(it)}
                className="group rounded-xl border border-studio-border bg-studio-panel overflow-hidden hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all text-left"
              >
                <div className="aspect-square bg-studio-soft relative overflow-hidden">
                  <img
                    src={it.publicUrl}
                    alt={it.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="px-3 py-2">
                  <p className="text-xs font-medium text-studio-ink truncate" title={it.name}>
                    {it.name}
                  </p>
                  <p className="text-[10px] text-studio-ink-3 mt-0.5">{readableSize(it.size)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Docs */}
      {docs.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider mb-4">
            Documents <span className="text-studio-ink-3 font-normal">· {docs.length}</span>
          </h2>
          <div className="rounded-2xl border border-studio-border bg-studio-panel divide-y divide-studio-border overflow-hidden">
            {docs.map((it) => (
              <div key={it.name} className="flex items-center gap-3 px-5 py-3 hover:bg-studio-soft transition-colors">
                <span className="w-9 h-9 rounded-lg bg-studio-soft border border-studio-border flex items-center justify-center text-studio-ink-2 shrink-0">
                  <FileText className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-studio-ink truncate">{it.name}</p>
                  <p className="text-xs text-studio-ink-3">{it.contentType} · {readableSize(it.size)}</p>
                </div>
                <a
                  href={it.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-studio-ink-3 hover:text-cb-navy inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-cb-navy/5"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => deleteItem(it.name)}
                  className="text-xs text-studio-ink-3 hover:text-rose-600 inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <Upload className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">
            {items.length === 0 ? "Bucket is empty" : "No matches"}
          </h3>
          <p className="text-sm text-studio-ink-3 mb-6">
            {items.length === 0 ? "Upload your first file." : "Try a different search."}
          </p>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-studio-ink/40 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-studio-panel rounded-2xl border border-studio-border w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border">
              <p className="text-sm font-medium text-studio-ink truncate font-mono">{selected.name}</p>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-lg hover:bg-studio-soft text-studio-ink-3 hover:text-studio-ink inline-flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-studio-soft rounded-xl overflow-hidden flex items-center justify-center min-h-[300px]">
                <img
                  src={selected.publicUrl}
                  alt={selected.name}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-studio-ink-3 mb-2">
                    Public URL
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={selected.publicUrl}
                      className="flex-1 h-9 px-3 rounded-lg border border-studio-border bg-studio-soft text-xs font-mono text-studio-ink-2"
                    />
                    <button
                      onClick={() => copyUrl(selected.publicUrl)}
                      className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-studio-border bg-studio-panel hover:bg-studio-soft text-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-studio-ink-3 space-y-1 pt-2 border-t border-studio-border">
                  <p>{selected.contentType} · {readableSize(selected.size)}</p>
                  {selected.updated && <p>Updated {new Date(selected.updated).toLocaleString()}</p>}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-studio-border">
              <button
                onClick={() => deleteItem(selected.name)}
                className="h-9 px-3 text-sm inline-flex items-center gap-1.5 rounded-lg text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100"
              >
                <Trash2 className="w-4 h-4" />
                Delete from bucket
              </button>
              <a
                href={selected.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
              >
                Open in new tab
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
