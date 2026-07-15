"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";

export function ImageField({
  label,
  value,
  alt,
  onChange,
}: {
  label: string;
  value?: { id?: number; url: string } | null;
  alt?: string;
  onChange: (v: { id: number; url: string } | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("_payload", JSON.stringify({ alt: alt || label }));
      const res = await fetch("/api/media", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`upload HTTP ${res.status}`);
      const data = await res.json();
      onChange({ id: data.doc.id, url: data.doc.url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-studio-ink-3">{label}</span>
        {error && <span className="text-[10px] text-rose-600">{error}</span>}
      </div>
      <div className="flex items-center gap-3">
        {value?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt={alt || ""} className="h-14 w-20 object-cover rounded-lg border border-studio-border" />
        ) : (
          <span className="h-14 w-20 rounded-lg border border-dashed border-studio-border inline-flex items-center justify-center text-studio-ink-3">
            <ImageIcon className="w-4 h-4" />
          </span>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="h-8 px-3 text-xs rounded-lg border border-studio-border bg-studio-panel hover:bg-studio-soft font-medium inline-flex items-center gap-1.5"
        >
          {busy && <Loader2 className="w-3 h-3 animate-spin" />}
          {value?.url ? "Replace" : "Upload"}
        </button>
        {value?.url && (
          <button type="button" onClick={() => onChange(null)} className="h-8 w-8 rounded-lg text-studio-ink-3 hover:bg-rose-50 hover:text-rose-600 inline-flex items-center justify-center" title="Remove">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </div>
    </div>
  );
}
