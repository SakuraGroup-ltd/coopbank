"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Input } from "@/components/studio/ui/Input";
import { Button } from "@/components/studio/ui/Button";
import {
  resolveFooterData,
  type FooterGlobal,
  type FooterData,
  type FooterLink,
} from "@/components/layout/FooterView";
import { LivePreviewShell } from "@/components/studio/preview/LivePreviewShell";

type Column = { heading: string; links: FooterLink[] };

// Global-shaped draft with every field concrete, so the form never has to
// null-check. Seeded from the *effective* footer (resolved fallbacks), so
// editors start from what the live site actually shows.
export type FooterDraft = {
  columns: Column[];
  openAccountBanner: { enabled: boolean; heading: string; subtext: string; buttonLabel: string; buttonHref: string };
  about: string;
  branches: FooterLink[];
  branchesNote: string;
  legalLinks: FooterLink[];
  developerCredit: FooterLink;
  tagline: string;
  copyright: string;
};

function seedDraft(initialFooter: FooterGlobal): FooterDraft {
  const effective = resolveFooterData({}, initialFooter);
  return {
    columns: effective.columns.map((c) => ({ heading: c.heading, links: [...c.links] })),
    openAccountBanner: { ...effective.banner },
    about: effective.about,
    branches: [...effective.branches],
    branchesNote: effective.branchesNote,
    legalLinks: [...effective.legalLinks],
    developerCredit: { ...effective.developerCredit },
    tagline: effective.tagline,
    copyright: effective.copyright,
  };
}

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function FooterEditor({ initialFooter }: { initialFooter: FooterGlobal }) {
  const router = useRouter();
  const [draft, setDraft] = useState<FooterDraft>(() => seedDraft(initialFooter));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  function patch(partial: Partial<FooterDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
    setSaveState("idle");
  }

  // The preview consumes the same resolver production uses, so what the iframe
  // shows is exactly what the live footer will render after save.
  const previewData: FooterData = resolveFooterData({}, draft);

  async function handleSave() {
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await fetch("/api/globals/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setSaveState("error");
        setSaveError(txt || `HTTP ${res.status}`);
        return;
      }
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
          <span className="text-studio-ink font-medium">Footer</span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <LivePreviewShell
          previewSrc="/studio-preview/footer"
          livePath="/"
          scope="footer"
          draft={previewData}
          headerRight={
            <span className="inline-flex items-center gap-3">
              <SaveStatus state={saveState} savedAt={savedAt} error={saveError} />
              <Button variant="dark" size="sm" type="button" onClick={handleSave}>
                Save
              </Button>
            </span>
          }
        >
          <div className="space-y-8 pb-10 pr-1">
            <Section title="Account banner" hint="The green promo block at the top of the footer">
              <ToggleRow
                label="Show banner"
                checked={draft.openAccountBanner.enabled}
                onChange={(enabled) => patch({ openAccountBanner: { ...draft.openAccountBanner, enabled } })}
              />
              <Field label="Heading">
                <Input value={draft.openAccountBanner.heading} onChange={(e) => patch({ openAccountBanner: { ...draft.openAccountBanner, heading: e.target.value } })} />
              </Field>
              <Field label="Subtext">
                <Input value={draft.openAccountBanner.subtext} onChange={(e) => patch({ openAccountBanner: { ...draft.openAccountBanner, subtext: e.target.value } })} />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Button label">
                  <Input value={draft.openAccountBanner.buttonLabel} onChange={(e) => patch({ openAccountBanner: { ...draft.openAccountBanner, buttonLabel: e.target.value } })} />
                </Field>
                <Field label="Button link" hint="Blank = Play Store">
                  <Input value={draft.openAccountBanner.buttonHref} onChange={(e) => patch({ openAccountBanner: { ...draft.openAccountBanner, buttonHref: e.target.value } })} />
                </Field>
              </div>
            </Section>

            <Section title="About & tagline">
              <Field label="About paragraph" hint="Under the footer logo">
                <textarea
                  value={draft.about}
                  onChange={(e) => patch({ about: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-studio-border bg-studio-panel text-sm text-studio-ink focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none"
                />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Tagline">
                  <Input value={draft.tagline} onChange={(e) => patch({ tagline: e.target.value })} />
                </Field>
                <Field label="Copyright line">
                  <Input value={draft.copyright} onChange={(e) => patch({ copyright: e.target.value })} />
                </Field>
              </div>
            </Section>

            <Section title="Link columns" hint="The five link lists in the middle of the footer">
              {draft.columns.map((col, ci) => (
                <div key={ci} className="rounded-xl border border-studio-border bg-studio-soft/50 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      value={col.heading}
                      placeholder="Column heading"
                      onChange={(e) => {
                        const columns = draft.columns.slice();
                        columns[ci] = { ...col, heading: e.target.value };
                        patch({ columns });
                      }}
                      className="font-semibold"
                    />
                    <RowControls
                      onUp={() => patch({ columns: move(draft.columns, ci, -1) })}
                      onDown={() => patch({ columns: move(draft.columns, ci, 1) })}
                      onRemove={() => patch({ columns: draft.columns.filter((_, i) => i !== ci) })}
                    />
                  </div>
                  <LinkList
                    items={col.links}
                    onChange={(links) => {
                      const columns = draft.columns.slice();
                      columns[ci] = { ...col, links };
                      patch({ columns });
                    }}
                    addLabel="Add link"
                  />
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                onClick={() => patch({ columns: [...draft.columns, { heading: "", links: [] }] })}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add column
              </Button>
            </Section>

            <Section title="Branches" hint="The branch list in the footer HQ block">
              <LinkList
                items={draft.branches}
                onChange={(branches) => patch({ branches })}
                addLabel="Add branch"
                labelPlaceholder="Dodoma (HQ)"
                hrefPlaceholder="/branches"
              />
              <Field label="Trailing note" hint='e.g. "+ 4 more coming soon"'>
                <Input value={draft.branchesNote} onChange={(e) => patch({ branchesNote: e.target.value })} />
              </Field>
            </Section>

            <Section title="Legal links" hint="Bottom bar — privacy, terms, cookies">
              <LinkList
                items={draft.legalLinks}
                onChange={(legalLinks) => patch({ legalLinks })}
                addLabel="Add legal link"
              />
            </Section>

            <Section title="Developer credit">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Label">
                  <Input value={draft.developerCredit.label} onChange={(e) => patch({ developerCredit: { ...draft.developerCredit, label: e.target.value } })} />
                </Field>
                <Field label="Link">
                  <Input value={draft.developerCredit.href} onChange={(e) => patch({ developerCredit: { ...draft.developerCredit, href: e.target.value } })} />
                </Field>
              </div>
            </Section>
          </div>
        </LivePreviewShell>
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-studio-ink">{title}</h2>
        {hint && <p className="text-xs text-studio-ink-3 mt-0.5">{hint}</p>}
      </div>
      {children}
    </section>
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

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="mb-4 flex items-center justify-between gap-3 p-3 rounded-xl border border-studio-border bg-studio-panel cursor-pointer hover:bg-studio-soft">
      <span className="text-sm font-medium text-studio-ink">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-cb-green" />
    </label>
  );
}

function RowControls({ onUp, onDown, onRemove }: { onUp: () => void; onDown: () => void; onRemove: () => void }) {
  const btn = "p-1.5 rounded-md text-studio-ink-3 hover:text-studio-ink hover:bg-studio-soft transition-colors";
  return (
    <div className="flex items-center flex-shrink-0">
      <button type="button" onClick={onUp} aria-label="Move up" className={btn}><ChevronUp className="w-4 h-4" /></button>
      <button type="button" onClick={onDown} aria-label="Move down" className={btn}><ChevronDown className="w-4 h-4" /></button>
      <button type="button" onClick={onRemove} aria-label="Remove" className={`${btn} hover:text-rose-600`}><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

function LinkList({
  items,
  onChange,
  addLabel,
  labelPlaceholder = "Label",
  hrefPlaceholder = "/page",
}: {
  items: FooterLink[];
  onChange: (items: FooterLink[]) => void;
  addLabel: string;
  labelPlaceholder?: string;
  hrefPlaceholder?: string;
}) {
  return (
    <div className="space-y-2 mb-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={item.label}
            placeholder={labelPlaceholder}
            onChange={(e) => {
              const next = items.slice();
              next[i] = { ...item, label: e.target.value };
              onChange(next);
            }}
          />
          <Input
            value={item.href}
            placeholder={hrefPlaceholder}
            onChange={(e) => {
              const next = items.slice();
              next[i] = { ...item, href: e.target.value };
              onChange(next);
            }}
          />
          <RowControls
            onUp={() => onChange(move(items, i, -1))}
            onDown={() => onChange(move(items, i, 1))}
            onRemove={() => onChange(items.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      <Button type="button" size="sm" onClick={() => onChange([...items, { label: "", href: "" }])}>
        <Plus className="w-3.5 h-3.5 mr-1" /> {addLabel}
      </Button>
    </div>
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
