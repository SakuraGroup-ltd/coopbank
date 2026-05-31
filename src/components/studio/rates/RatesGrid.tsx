"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";

export type Rate = {
  id?: string | number;
  productName: string;
  kind: string;
  rateLabel: string;
  rateValue?: number;
  tenor?: string;
  minimumAmount?: number;
  effectiveFrom: string;
  notes?: string;
  active: boolean;
};

type RowState = "idle" | "saving" | "saved" | "error";

const KINDS = [
  { value: "deposit", label: "Deposit" },
  { value: "fixed-deposit", label: "Fixed Deposit" },
  { value: "loan", label: "Loan" },
  { value: "treasury", label: "Treasury" },
];

export function RatesGrid({ initial }: { initial: Rate[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Rate[]>(initial);
  const [state, setState] = useState<Record<string, RowState>>({});

  const today = new Date().toISOString().slice(0, 10);

  function patch(idx: number, p: Partial<Rate>) {
    setRows((cur) => cur.map((r, i) => (i === idx ? { ...r, ...p } : r)));
    setState((s) => ({ ...s, [String(rows[idx]?.id ?? `new-${idx}`)]: "idle" }));
  }

  function addRow() {
    setRows((cur) => [
      { productName: "", kind: "deposit", rateLabel: "", effectiveFrom: today, active: true },
      ...cur,
    ]);
  }

  const save = useCallback(async (idx: number) => {
    const r = rows[idx];
    if (!r) return;
    const key = String(r.id ?? `new-${idx}`);
    setState((s) => ({ ...s, [key]: "saving" }));
    try {
      const body: Record<string, unknown> = {
        productName: r.productName,
        kind: r.kind,
        rateLabel: r.rateLabel,
        effectiveFrom: r.effectiveFrom,
        active: r.active,
      };
      if (r.rateValue !== undefined) body.rateValue = r.rateValue;
      if (r.tenor) body.tenor = r.tenor;
      if (r.minimumAmount !== undefined) body.minimumAmount = r.minimumAmount;
      if (r.notes) body.notes = r.notes;
      const url = r.id ? `/api/interest-rates/${r.id}` : "/api/interest-rates";
      const method = r.id ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        setState((s) => ({ ...s, [key]: "error" }));
        return;
      }
      const data = await res.json();
      if (!r.id && data?.doc?.id) {
        setRows((cur) => cur.map((x, i) => (i === idx ? { ...x, id: data.doc.id } : x)));
      }
      setState((s) => ({ ...s, [key]: "saved" }));
      setTimeout(() => setState((s) => ({ ...s, [key]: "idle" })), 2000);
    } catch {
      setState((s) => ({ ...s, [key]: "error" }));
    }
  }, [rows]);

  async function deleteRow(idx: number) {
    const r = rows[idx];
    if (!r?.id) {
      setRows((cur) => cur.filter((_, i) => i !== idx));
      return;
    }
    if (!confirm(`Delete "${r.productName}"?`)) return;
    const res = await fetch(`/api/interest-rates/${r.id}`, { method: "DELETE" });
    if (res.ok) {
      setRows((cur) => cur.filter((_, i) => i !== idx));
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={addRow}>
          <Plus className="w-3.5 h-3.5" />
          Add rate
        </Button>
      </div>
      <div className="rounded-2xl border border-studio-border bg-studio-panel overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr_1.2fr_auto] gap-3 px-5 py-3 border-b border-studio-border text-[11px] font-semibold uppercase tracking-[0.08em] text-studio-ink-3">
          <span>Product</span>
          <span>Kind</span>
          <span>Rate label</span>
          <span>Tenor</span>
          <span>Effective from</span>
          <span className="w-[120px] text-right">Action</span>
        </div>
        {rows.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-studio-ink-3">
            No rates yet. Click <strong>Add rate</strong> above.
          </div>
        )}
        {rows.map((r, idx) => {
          const key = String(r.id ?? `new-${idx}`);
          const st = state[key] || "idle";
          return (
            <div
              key={key}
              className={`grid grid-cols-[2fr_1fr_1.2fr_1fr_1.2fr_auto] gap-3 px-5 py-3 items-center border-b border-studio-border last:border-b-0 hover:bg-studio-soft/40 ${
                st === "saved" ? "bg-emerald-50/30" : st === "error" ? "bg-rose-50/30" : ""
              } ${!r.active ? "opacity-60" : ""}`}
            >
              <Input value={r.productName} onChange={(e) => patch(idx, { productName: e.target.value })} placeholder="e.g. Mama Africa Savings" />
              <Select value={r.kind} onChange={(e) => patch(idx, { kind: e.target.value })}>
                {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </Select>
              <Input value={r.rateLabel} onChange={(e) => patch(idx, { rateLabel: e.target.value })} placeholder="4.5% p.a." />
              <Input value={r.tenor || ""} onChange={(e) => patch(idx, { tenor: e.target.value })} placeholder="12 months" />
              <Input type="date" value={r.effectiveFrom} onChange={(e) => patch(idx, { effectiveFrom: e.target.value })} />
              <div className="w-[120px] flex items-center justify-end gap-1">
                {st === "saving" && <Loader2 className="w-3.5 h-3.5 animate-spin text-studio-ink-3" />}
                {st === "saved" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {st === "error" && <AlertCircle className="w-4 h-4 text-rose-600" />}
                {st === "idle" && (
                  <button onClick={() => save(idx)} className="text-xs font-medium text-cb-navy hover:text-cb-green px-2 py-1 rounded-md hover:bg-cb-navy/5">
                    Save
                  </button>
                )}
                <button onClick={() => deleteRow(idx)} className="w-7 h-7 rounded-md text-studio-ink-3 hover:bg-rose-50 hover:text-rose-600 inline-flex items-center justify-center" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
