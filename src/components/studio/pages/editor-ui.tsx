"use client";

// Shared mini-form building blocks for block editors — used by both the
// legacy BlockEditor.tsx (hero, product-grid, etc.) and
// SectionBlockEditors.tsx (the Task 7 section blocks). Extracted so both
// files render the same visual language without duplicating it.
import { Plus, X } from "lucide-react";

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-studio-ink-3">{children}</span>
      {hint && <span className="text-[10px] text-studio-ink-3">{hint}</span>}
    </div>
  );
}

export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>;
}

export function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-studio-border pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
      <p className="text-xs font-semibold text-studio-ink-2 mb-3">{title}</p>
      {children}
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 rounded-lg border border-studio-border bg-studio-panel text-sm focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none resize-none"
    />
  );
}

export function updateArr<T>(
  field: string,
  arr: T[],
  i: number,
  patch: Partial<T>,
  onChange: (d: Record<string, unknown>) => void,
) {
  const next = arr.map((item, idx) => (idx === i ? { ...item, ...patch } : item));
  onChange({ [field]: next });
}

export function removeArr<T>(field: string, arr: T[], i: number, onChange: (d: Record<string, unknown>) => void) {
  const next = arr.filter((_, idx) => idx !== i);
  onChange({ [field]: next });
}

export function AddBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-cb-navy hover:text-cb-green px-2 py-1 rounded-md hover:bg-cb-navy/5"
    >
      <Plus className="w-3 h-3" />
      {children}
    </button>
  );
}

export function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-7 h-7 rounded-md text-studio-ink-3 hover:bg-rose-50 hover:text-rose-600 inline-flex items-center justify-center shrink-0"
      title="Remove"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  );
}
