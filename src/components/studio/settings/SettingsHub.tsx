"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Globe,
  AlertTriangle,
  Smartphone,
  Layout,
  PanelBottom,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { cn } from "../ui/cn";

type Tab = "contact" | "social" | "banner" | "app" | "header" | "footer";

type Site = {
  contact?: {
    phone?: string;
    email?: string;
    hrEmail?: string;
    tendersEmail?: string;
    headquartersAddress?: string;
  };
  social?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  emergencyBanner?: {
    active?: boolean;
    level?: string;
    message?: string;
    linkLabel?: string;
    linkHref?: string;
  };
  appStore?: {
    iosUrl?: string;
    androidUrl?: string;
    ussdCode?: string;
  };
};

type Header = {
  topBar?: { ctaLabel?: string; ctaHref?: string };
};

type Footer = {
  tagline?: string;
  copyright?: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const TABS: Array<{ value: Tab; label: string; icon: typeof Phone }> = [
  { value: "contact", label: "Contact", icon: Phone },
  { value: "social", label: "Social", icon: Globe },
  { value: "banner", label: "Emergency banner", icon: AlertTriangle },
  { value: "app", label: "Mobile / USSD", icon: Smartphone },
  { value: "header", label: "Header", icon: Layout },
  { value: "footer", label: "Footer", icon: PanelBottom },
];

export function SettingsHub({
  siteSettings,
  header,
  footer,
}: {
  siteSettings: Record<string, unknown>;
  header: Record<string, unknown>;
  footer: Record<string, unknown>;
  homepage: Record<string, unknown>;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("contact");
  const [site, setSite] = useState<Site>(siteSettings as Site);
  const [hdr, setHdr] = useState<Header>(header as Header);
  const [ftr, setFtr] = useState<Footer>(footer as Footer);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Debounced saves: update local state immediately for a responsive UI, but
  // POST the *latest* full global once typing pauses (800ms). Refs hold the
  // latest value so rapid edits can't fire out-of-order requests that clobber
  // each other (the old code POSTed the whole global on every keystroke).
  const siteRef = useRef(site);
  const hdrRef = useRef(hdr);
  const ftrRef = useRef(ftr);
  const siteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hdrTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ftrTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function persistGlobal(url: string, data: unknown) {
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        setSaveState("error");
        setSaveError(`HTTP ${res.status}`);
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

  function saveSite(partial: Partial<Site>) {
    const next = { ...siteRef.current, ...partial };
    siteRef.current = next;
    setSite(next);
    if (siteTimer.current) clearTimeout(siteTimer.current);
    siteTimer.current = setTimeout(() => persistGlobal("/api/globals/site-settings", siteRef.current), 800);
  }

  function saveHeader(partial: Partial<Header>) {
    const next = { ...hdrRef.current, ...partial };
    hdrRef.current = next;
    setHdr(next);
    if (hdrTimer.current) clearTimeout(hdrTimer.current);
    hdrTimer.current = setTimeout(() => persistGlobal("/api/globals/header", hdrRef.current), 800);
  }

  function saveFooter(partial: Partial<Footer>) {
    const next = { ...ftrRef.current, ...partial };
    ftrRef.current = next;
    setFtr(next);
    if (ftrTimer.current) clearTimeout(ftrTimer.current);
    ftrTimer.current = setTimeout(() => persistGlobal("/api/globals/footer", ftrRef.current), 800);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
      {/* Tabs */}
      <nav className="space-y-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                active
                  ? "bg-studio-ink/5 text-studio-ink font-medium"
                  : "text-studio-ink-2 hover:bg-studio-soft hover:text-studio-ink",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Panel */}
      <div className="rounded-2xl border border-studio-border bg-studio-panel p-6 lg:p-8">
        {tab === "contact" && (
          <Pane title="Contact details" hint="Surfaces in footer + contact page">
            <Field label="Main phone">
              <Input
                type="tel"
                value={site.contact?.phone || ""}
                onChange={(e) => saveSite({ contact: { ...site.contact, phone: e.target.value } })}
              />
            </Field>
            <Field label="Info email">
              <Input
                type="email"
                value={site.contact?.email || ""}
                onChange={(e) => saveSite({ contact: { ...site.contact, email: e.target.value } })}
              />
            </Field>
            <Field label="HR email">
              <Input
                type="email"
                value={site.contact?.hrEmail || ""}
                onChange={(e) => saveSite({ contact: { ...site.contact, hrEmail: e.target.value } })}
              />
            </Field>
            <Field label="Tenders email">
              <Input
                type="email"
                value={site.contact?.tendersEmail || ""}
                onChange={(e) => saveSite({ contact: { ...site.contact, tendersEmail: e.target.value } })}
              />
            </Field>
            <Field label="HQ address">
              <textarea
                value={site.contact?.headquartersAddress || ""}
                onChange={(e) => saveSite({ contact: { ...site.contact, headquartersAddress: e.target.value } })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-studio-border bg-studio-panel text-sm focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none resize-none"
              />
            </Field>
          </Pane>
        )}

        {tab === "social" && (
          <Pane title="Social profiles" hint="Footer icons + share metadata">
            {(["facebook", "twitter", "instagram", "linkedin", "youtube"] as const).map((k) => (
              <Field key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
                <Input
                  type="url"
                  placeholder="https://…"
                  value={(site.social?.[k] || "") as string}
                  onChange={(e) =>
                    saveSite({ social: { ...site.social, [k]: e.target.value } })
                  }
                />
              </Field>
            ))}
          </Pane>
        )}

        {tab === "banner" && (
          <Pane title="Emergency banner" hint="Pinned across the entire site when active">
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-studio-border bg-studio-panel cursor-pointer hover:bg-studio-soft mb-4">
              <div>
                <p className="text-sm font-medium text-studio-ink">Show banner</p>
                <p className="text-xs text-studio-ink-3 mt-0.5">Renders at the top of every page</p>
              </div>
              <input
                type="checkbox"
                checked={!!site.emergencyBanner?.active}
                onChange={(e) =>
                  saveSite({ emergencyBanner: { ...site.emergencyBanner, active: e.target.checked } })
                }
                className="w-4 h-4 accent-cb-green"
              />
            </label>
            {site.emergencyBanner?.active && (
              <>
                <Field label="Level">
                  <Select
                    value={site.emergencyBanner?.level || "info"}
                    onChange={(e) =>
                      saveSite({ emergencyBanner: { ...site.emergencyBanner, level: e.target.value } })
                    }
                  >
                    <option value="info">Info (blue)</option>
                    <option value="warning">Warning (amber)</option>
                    <option value="urgent">Urgent (red)</option>
                  </Select>
                </Field>
                <Field label="Message">
                  <Input
                    type="text"
                    value={site.emergencyBanner?.message || ""}
                    onChange={(e) =>
                      saveSite({ emergencyBanner: { ...site.emergencyBanner, message: e.target.value } })
                    }
                    placeholder="System outage — services may be disrupted"
                  />
                </Field>
                <Field label="Action label">
                  <Input
                    type="text"
                    value={site.emergencyBanner?.linkLabel || ""}
                    onChange={(e) =>
                      saveSite({ emergencyBanner: { ...site.emergencyBanner, linkLabel: e.target.value } })
                    }
                    placeholder="Read more"
                  />
                </Field>
                <Field label="Action URL">
                  <Input
                    type="text"
                    value={site.emergencyBanner?.linkHref || ""}
                    onChange={(e) =>
                      saveSite({ emergencyBanner: { ...site.emergencyBanner, linkHref: e.target.value } })
                    }
                  />
                </Field>
              </>
            )}
          </Pane>
        )}

        {tab === "app" && (
          <Pane title="CoopPesa app links" hint="Mobile downloads and USSD shortcut">
            <Field label="iOS App Store URL">
              <Input
                type="url"
                value={site.appStore?.iosUrl || ""}
                onChange={(e) => saveSite({ appStore: { ...site.appStore, iosUrl: e.target.value } })}
              />
            </Field>
            <Field label="Google Play URL">
              <Input
                type="url"
                value={site.appStore?.androidUrl || ""}
                onChange={(e) => saveSite({ appStore: { ...site.appStore, androidUrl: e.target.value } })}
              />
            </Field>
            <Field label="USSD code">
              <Input
                type="text"
                value={site.appStore?.ussdCode || ""}
                onChange={(e) => saveSite({ appStore: { ...site.appStore, ussdCode: e.target.value } })}
                placeholder="*150*72#"
              />
            </Field>
          </Pane>
        )}

        {tab === "header" && (
          <Pane title="Header top bar" hint="Primary CTA in the top-right">
            <Field label="CTA label">
              <Input
                type="text"
                value={hdr.topBar?.ctaLabel || ""}
                onChange={(e) => saveHeader({ topBar: { ...hdr.topBar, ctaLabel: e.target.value } })}
                placeholder="Download CoopPesa"
              />
            </Field>
            <Field label="CTA URL">
              <Input
                type="text"
                value={hdr.topBar?.ctaHref || ""}
                onChange={(e) => saveHeader({ topBar: { ...hdr.topBar, ctaHref: e.target.value } })}
                placeholder="/digital-banking#download"
              />
            </Field>
            <p className="text-xs text-studio-ink-3 mt-4 leading-relaxed">
              Primary nav structure (mega menus) is edited through Payload Admin for now — adding a
              tree editor is on the list.
            </p>
          </Pane>
        )}

        {tab === "footer" && (
          <Pane title="Footer" hint="Tagline + copyright shown in the site footer">
            <Field label="Tagline">
              <Input
                type="text"
                value={ftr.tagline || ""}
                onChange={(e) => saveFooter({ tagline: e.target.value })}
                placeholder="Ustawi kwa wote"
              />
            </Field>
            <Field label="Copyright line">
              <Input
                type="text"
                value={ftr.copyright || ""}
                onChange={(e) => saveFooter({ copyright: e.target.value })}
                placeholder="© 2026 Cooperative Bank Tanzania Plc. All rights reserved."
              />
            </Field>
            <p className="text-xs text-studio-ink-3 mt-4 leading-relaxed">
              Contact details, social links, and app-store URLs shown in the footer are edited under
              the <strong>Contact</strong>, <strong>Social</strong>, and <strong>Mobile / USSD</strong> tabs.
              Footer nav-link columns fall back to the built-in set and can be overridden in Payload
              Admin (Footer global) — a column editor here is on the list.
            </p>
          </Pane>
        )}

        {/* Save status footer */}
        <div className="flex items-center justify-end gap-2 mt-6 pt-6 border-t border-studio-border min-h-[36px]">
          {saveState === "saving" && (
            <span className="text-xs text-studio-ink-3 inline-flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving…
            </span>
          )}
          {saveState === "saved" && savedAt && (
            <span className="text-xs text-emerald-700 inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              Saved {savedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {saveState === "error" && (
            <span className="text-xs text-rose-700 inline-flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" />
              {saveError || "Save failed"}
            </span>
          )}
          <span className="text-xs text-studio-ink-3 ml-auto inline-flex items-center gap-1.5">
            <Save className="w-3 h-3" />
            Auto-saves on every change
          </span>
        </div>
      </div>
    </div>
  );
}

function Pane({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="text-base font-semibold text-studio-ink mb-1">{title}</h2>
      {hint && <p className="text-xs text-studio-ink-3 mb-6">{hint}</p>}
      <div className="space-y-4">{children}</div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-xs font-semibold text-studio-ink-2 uppercase tracking-wider mb-2">
        {label}
      </span>
      {children}
    </div>
  );
}
