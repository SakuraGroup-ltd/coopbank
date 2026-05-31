"use client";

// Daily-update grid for FX rates. Each row is its own optimistic edit
// island — typing/saving one row doesn't refetch or rerender the others.
// Treasury's mental model: walk down the list, type the new Buy and Sell,
// pick the trend arrow, hit Enter (or Save All at the top).
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { cn } from "../ui/cn";

type Rate = {
  id: string | number;
  currencyCode: string;
  currencyName: string;
  flagEmoji?: string;
  buyRate: number;
  sellRate: number;
  trend: "up" | "down" | "neutral";
  updatedDate: string;
  active: boolean;
};

type RowState = "idle" | "saving" | "saved" | "error";

function trendIcon(t: Rate["trend"]) {
  if (t === "up") return <ArrowUpRight className="w-3.5 h-3.5" />;
  if (t === "down") return <ArrowDownRight className="w-3.5 h-3.5" />;
  return <Minus className="w-3.5 h-3.5" />;
}

export function ForexGrid({ initialRates }: { initialRates: Rate[] }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [rows, setRows] = useState(initialRates);
  const [stateMap, setStateMap] = useState<Record<string, RowState>>({});
  const [error, setError] = useState<Record<string, string>>({});
  const [bulkBusy, startBulk] = useTransition();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function patch(id: Rate["id"], partial: Partial<Rate>) {
    setRows((current) =>
      current.map((r) => (r.id === id ? { ...r, ...partial } : r)),
    );
    // Any edit moves the row back to idle so the user can save again
    setStateMap((s) => ({ ...s, [String(id)]: "idle" }));
  }

  async function saveRow(rate: Rate) {
    const key = String(rate.id);
    setStateMap((s) => ({ ...s, [key]: "saving" }));
    setError((e) => ({ ...e, [key]: "" }));
    try {
      const res = await fetch(`/api/forex-rates/${rate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyRate: rate.buyRate,
          sellRate: rate.sellRate,
          trend: rate.trend,
          updatedDate: rate.updatedDate || today,
        }),
      });
      if (!res.ok) {
        setStateMap((s) => ({ ...s, [key]: "error" }));
        setError((e) => ({ ...e, [key]: "Save failed" }));
        return;
      }
      setStateMap((s) => ({ ...s, [key]: "saved" }));
      // Reset to idle after 2s for visual confirmation
      setTimeout(() => {
        setStateMap((s) => (s[key] === "saved" ? { ...s, [key]: "idle" } : s));
      }, 2000);
    } catch {
      setStateMap((s) => ({ ...s, [key]: "error" }));
      setError((e) => ({ ...e, [key]: "Network error" }));
    }
  }

  function saveAll() {
    startBulk(async () => {
      for (const r of rows) {
        // Only save rows the user has touched (state set to idle by `patch`)
        // OR rows whose state is anything but `saved`.
        if (stateMap[String(r.id)] === "saved") continue;
        await saveRow(r);
      }
      router.refresh();
    });
  }

  function stampToday() {
    setRows((current) => current.map((r) => ({ ...r, updatedDate: today })));
    setStateMap((s) => {
      const next: Record<string, RowState> = {};
      for (const r of rows) next[String(r.id)] = "idle";
      return { ...s, ...next };
    });
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>, rate: Rate) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveRow(rate);
    }
  }

  const dirtyCount = Object.values(stateMap).filter((v) => v === "idle").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Bulk bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 rounded-2xl border border-studio-border bg-studio-panel p-4">
        <div>
          <p className="text-sm font-medium text-studio-ink">
            Set effective date for all rates
          </p>
          <p className="text-xs text-studio-ink-3 mt-0.5">
            Stamps today ({today}) on every active row.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={stampToday}>
            Stamp today
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={saveAll}
            disabled={bulkBusy || rows.length === 0}
          >
            {bulkBusy ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              `Save all${dirtyCount ? ` (${dirtyCount})` : ""}`
            )}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-2xl border border-studio-border bg-studio-panel overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1.4fr_1fr_1fr_0.9fr_0.9fr_auto] gap-3 px-5 py-3 border-b border-studio-border text-[11px] font-semibold uppercase tracking-[0.08em] text-studio-ink-3">
          <span>Currency</span>
          <span>Buy</span>
          <span>Sell</span>
          <span>Trend</span>
          <span>Effective</span>
          <span className="w-[88px] text-right">Save</span>
        </div>
        {rows.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-studio-ink-3">
            No forex rates yet. Add the first currency from Payload Admin.
          </div>
        )}
        {rows.map((r, i) => {
          const key = String(r.id);
          const status = stateMap[key] || "idle";
          return (
            <div
              key={key}
              className={cn(
                "grid grid-cols-[1.4fr_1fr_1fr_0.9fr_0.9fr_auto] gap-3 px-5 py-3 items-center",
                "border-b border-studio-border last:border-b-0",
                "hover:bg-studio-soft/40 transition-colors",
                status === "saved" && "bg-emerald-50/30",
                status === "error" && "bg-rose-50/30",
              )}
            >
              {/* Currency cell */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg leading-none w-7 text-center">
                  {r.flagEmoji || "·"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-studio-ink">
                    {r.currencyCode}
                  </p>
                  <p className="text-xs text-studio-ink-3 truncate">
                    {r.currencyName}
                  </p>
                </div>
                {!r.active && <Badge tone="neutral">paused</Badge>}
              </div>

              {/* Buy */}
              <Input
                ref={(el) => {
                  inputRefs.current[`buy-${key}`] = el;
                }}
                type="number"
                step="0.0001"
                inputMode="decimal"
                value={r.buyRate}
                onChange={(e) =>
                  patch(r.id, { buyRate: Number(e.target.value) })
                }
                onKeyDown={(e) => handleKey(e, r)}
                className="text-right tabular-nums font-medium"
              />

              {/* Sell */}
              <Input
                ref={(el) => {
                  inputRefs.current[`sell-${key}`] = el;
                }}
                type="number"
                step="0.0001"
                inputMode="decimal"
                value={r.sellRate}
                onChange={(e) =>
                  patch(r.id, { sellRate: Number(e.target.value) })
                }
                onKeyDown={(e) => handleKey(e, r)}
                className="text-right tabular-nums font-medium"
              />

              {/* Trend */}
              <Select
                value={r.trend}
                onChange={(e) =>
                  patch(r.id, { trend: e.target.value as Rate["trend"] })
                }
              >
                <option value="up">↑ Up</option>
                <option value="down">↓ Down</option>
                <option value="neutral">— Neutral</option>
              </Select>

              {/* Effective date */}
              <Input
                type="date"
                value={r.updatedDate?.slice(0, 10) || ""}
                onChange={(e) => patch(r.id, { updatedDate: e.target.value })}
              />

              {/* Save / status */}
              <div className="w-[88px] flex items-center justify-end">
                {status === "saving" && (
                  <span className="text-xs text-studio-ink-3 inline-flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving
                  </span>
                )}
                {status === "saved" && (
                  <span className="text-xs text-emerald-700 inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Saved
                  </span>
                )}
                {status === "error" && (
                  <span
                    title={error[key]}
                    className="text-xs text-rose-700 inline-flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Retry
                  </span>
                )}
                {status === "idle" && (
                  <button
                    onClick={() => saveRow(r)}
                    className="text-xs font-medium text-cb-navy hover:text-cb-green inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-cb-navy/5"
                  >
                    {trendIcon(r.trend)}
                    Save
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper hint */}
      <p className="text-xs text-studio-ink-3 px-1">
        Press <kbd className="px-1.5 py-0.5 rounded border border-studio-border bg-studio-soft text-[10px]">Enter</kbd> in any field to save that row, or use{" "}
        <span className="font-semibold text-studio-ink-2">Save all</span> at the top when you&apos;re done.
      </p>
    </div>
  );
}
