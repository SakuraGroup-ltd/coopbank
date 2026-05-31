"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";

export type Fee = {
  id?: string | number;
  serviceName: string;
  category: string;
  feeLabel: string;
  feeValue?: number;
  vatInclusive: boolean;
  effectiveFrom: string;
  notes?: string;
  active: boolean;
};

const CATEGORIES = [
  { value: "account", label: "Account services" },
  { value: "cards", label: "Cards" },
  { value: "transfers", label: "Transfers" },
  { value: "atm", label: "ATM" },
  { value: "cheques", label: "Cheques" },
  { value: "statements", label: "Statements" },
  { value: "loans", label: "Loans" },
  { value: "trade", label: "Trade finance" },
  { value: "other", label: "Other" },
];

type RowState = "idle" | "saving" | "saved" | "error";

export function FeesGrid({ initial }: { initial: Fee[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Fee[]>(initial);
  const [state, setState] = useState<Record<string, RowState>>({});

  function patch(idx: number, p: Partial<Fee>) {
    setRows((cur) => cur.map((r, i) => (i === idx ? { ...r, ...p } : r)));
    setState((s) => ({ ...s, [String(rows[idx]?.id ?? `new-${idx}`)]: "idle" }));
  }

  function addRow() {
    const today = new Date().toISOString().slice(0, 10);
    setRows((cur) => [{ serviceName: "", category: "other", feeLabel: "", vatInclusive: true, effectiveFrom: today, active: true }, ...cur]);
  }

  const save = useCallback(async (idx: number) => {
    const r = rows[idx];
    if (!r) return;
    const key = String(r.id ?? `new-${idx}`);
    setState((s) => ({ ...s, [key]: "saving" }));
    try {
      const body: Record<string, unknown> = {
        serviceName: r.serviceName,
        category: r.category,
        feeLabel: r.feeLabel,
        vatInclusive: r.vatInclusive,
        effectiveFrom: r.effectiveFrom,
        active: r.active,
      };
      if (r.feeValue !== undefined) body.feeValue = r.feeValue;
      if (r.notes) body.notes = r.notes;
      const url = r.id ? `/api/service-fees/${r.id}` : "/api/service-fees";
      const method = r.id ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { setState((s) => ({ ...s, [key]: "error" })); return; }
      const data = await res.json();
      if (!r.id && data?.doc?.id) setRows((cur) => cur.map((x, i) => (i === idx ? { ...x, id: data.doc.id } : x)));
      setState((s) => ({ ...s, [key]: "saved" }));
      setTimeout(() => setState((s) => ({ ...s, [key]: "idle" })), 2000);
    } catch { setState((s) => ({ ...s, [key]: "error" })); }
  }, [rows]);

  async function deleteRow(idx: number) {
    const r = rows[idx];
    if (!r?.id) return setRows((cur) => cur.filter((_, i) => i !== idx));
    if (!confirm(`Delete "${r.serviceName}"?`)) return;
    const res = await fetch(`/api/service-fees/${r.id}`, { method: "DELETE" });
    if (res.ok) {
      setRows((cur) => cur.filter((_, i) => i !== idx));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={addRow}><Plus className="w-3.5 h-3.5" />Add fee</Button>
      </div>
      <div className="rounded-2xl border border-studio-border bg-studio-panel overflow-hidden">
        <div className="grid grid-cols-[2fr_1.2fr_1.5fr_1.1fr_auto] gap-3 px-5 py-3 border-b border-studio-border text-[11px] font-semibold uppercase tracking-[0.08em] text-studio-ink-3">
          <span>Service</span>
          <span>Category</span>
          <span>Fee</span>
          <span>Effective</span>
          <span className="w-[120px] text-right">Action</span>
        </div>
        {rows.length === 0 && <div className="px-5 py-12 text-center text-sm text-studio-ink-3">No fees yet.</div>}
        {rows.map((r, idx) => {
          const key = String(r.id ?? `new-${idx}`);
          const st = state[key] || "idle";
          return (
            <div key={key} className={`grid grid-cols-[2fr_1.2fr_1.5fr_1.1fr_auto] gap-3 px-5 py-3 items-center border-b border-studio-border last:border-b-0 hover:bg-studio-soft/40 ${st === "saved" ? "bg-emerald-50/30" : st === "error" ? "bg-rose-50/30" : ""} ${!r.active ? "opacity-60" : ""}`}>
              <Input value={r.serviceName} onChange={(e) => patch(idx, { serviceName: e.target.value })} placeholder="e.g. ATM withdrawal (on-us)" />
              <Select value={r.category} onChange={(e) => patch(idx, { category: e.target.value })}>{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</Select>
              <Input value={r.feeLabel} onChange={(e) => patch(idx, { feeLabel: e.target.value })} placeholder="TZS 500 per txn" />
              <Input type="date" value={r.effectiveFrom} onChange={(e) => patch(idx, { effectiveFrom: e.target.value })} />
              <div className="w-[120px] flex items-center justify-end gap-1">
                {st === "saving" && <Loader2 className="w-3.5 h-3.5 animate-spin text-studio-ink-3" />}
                {st === "saved" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {st === "error" && <AlertCircle className="w-4 h-4 text-rose-600" />}
                {st === "idle" && <button onClick={() => save(idx)} className="text-xs font-medium text-cb-navy hover:text-cb-green px-2 py-1 rounded-md hover:bg-cb-navy/5">Save</button>}
                <button onClick={() => deleteRow(idx)} className="w-7 h-7 rounded-md text-studio-ink-3 hover:bg-rose-50 hover:text-rose-600 inline-flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
