# Studio Live-Preview: Footer + Teams + Settings — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the bespoke `/studio` a true side-by-side live-preview editor, proven on the Footer and Teams (Leadership) surfaces, so every visible piece of those surfaces is CMS-editable and the studio preview is guaranteed identical to the live site.

**Architecture:** One reusable `LivePreviewShell` (form pane + `<iframe>` pane) drives edits via `window.postMessage` into a dedicated, chrome-free preview route that renders the **exact same presentational component** the live site uses (`FooterView`, `LeadershipGrid`). Public page components are split into pure `XView(props)` + a thin server wrapper that fetches — the split is what makes drift structurally impossible. Editors persist through Payload's built-in REST (`/api/globals/footer`, `/api/leadership-team`).

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript, Tailwind v4, Payload CMS 3.85 (Postgres/Neon, `push:false`), lucide-react.

## Global Constraints

- **Database:** `push: false`. Neon is **shared with production**. Every schema change is an **additive** migration (new nullable columns / child tables only) that must be applied to Neon **by the repo owner** — never auto-pushed. Until applied, code must fall back to current hardcoded defaults so nothing breaks. (`payload.config.ts:105`)
- **No test framework exists** in this repo. The verification gate for every task is: (a) `npx tsc --noEmit` passes, and (b) the explicit manual QA in the dev app (`npm run dev`) described in that task. Do **not** add a test runner.
- **Auth:** studio server pages call `requireStudioUser()` from `@/lib/studio/auth`; mutations rely on the `payload-token` cookie + `editorOf("marketing")` access already on the Footer global and leadership-team collection.
- **Payload REST:** globals save via `POST /api/globals/<slug>` (whole global). Collections: `POST /api/<slug>`, `PATCH /api/<slug>/<id>`, `DELETE /api/<slug>/<id>`. Create returns `{ doc: { id } }`. Media upload: `POST /api/media` with `multipart/form-data` (`file` field), returns `{ doc: { id, url } }`.
- **Studio UI kit:** reuse `@/components/studio/ui/{Input,Select,Button,Badge,Card,cn}`. Studio Tailwind tokens: `studio-ink`, `studio-ink-2`, `studio-ink-3`, `studio-border`, `studio-panel`, `studio-soft`, `cb-navy`, `cb-navy-deep`, `cb-green`.
- **Copy/brand:** brand colours used by the footer/team components are literals already in the code (`#0F3D7A` navy, `#1A8A3A` green, `#00C853` hover). Do not change them.

---

## File Structure

**New (foundation):**
- `src/lib/studio/livePreview.ts` — shared message-type constant + TS types for the postMessage contract.
- `src/components/studio/preview/LivePreviewShell.tsx` — the two-pane editor shell (form slot + iframe + device toggle + save-status slot).
- `src/components/studio/preview/useDraftBroadcast.ts` — hook: posts draft → iframe (throttled).
- `src/components/preview/useDraftListener.ts` — hook used inside preview clients: overlays postMessage draft on initial data.
- `src/app/(preview)/layout.tsx` — minimal chrome-free root layout for studio previews.
- `src/app/(preview)/studio-preview/footer/page.tsx` — footer preview route.
- `src/app/(preview)/studio-preview/leadership/page.tsx` — leadership preview route.
- `src/components/preview/FooterPreviewClient.tsx`, `LeadershipPreviewClient.tsx` — client wrappers using `useDraftListener`.

**New (editors):**
- `src/components/studio/footer/FooterEditor.tsx` — footer form + preview shell.
- `src/app/(studio)/studio/footer/page.tsx` — footer studio route.
- `src/components/studio/leadership/LeadershipForm.tsx` — in-studio profile create/edit form.
- `src/app/(studio)/studio/team-leadership/[id]/page.tsx` — leadership detail route.

**Modified:**
- `src/payload/globals/Footer.ts` — add banner/about/branches/legalLinks/developerCredit fields.
- `src/components/layout/Footer.tsx` — split into `FooterView` (pure) + server wrapper; consume new fields.
- `src/app/(main)/preview/[...slug]/page.tsx` — (unchanged; new previews live in `(preview)` group).
- `src/app/(studio)/studio/team-leadership/page.tsx` — link to in-studio create/edit instead of `/admin`.
- `src/lib/leadership.ts` — relax photo-URL resolution.
- `src/components/studio/Sidebar.tsx` — add "Footer" nav item.

---

## The postMessage contract (used by every task below)

`src/lib/studio/livePreview.ts`:

```ts
// Shared contract between the studio editor (sender) and the preview iframe
// (receiver). One message type; `scope` guards against cross-wiring if two
// previews ever share an origin.
export const STUDIO_PREVIEW_MESSAGE = "studio-live-preview" as const;

export type PreviewScope = "footer" | "leadership";

export type StudioPreviewMessage<T = unknown> = {
  type: typeof STUDIO_PREVIEW_MESSAGE;
  scope: PreviewScope;
  data: T;
};
```

---

### Task 1: postMessage contract + broadcast/listen hooks + preview shell

**Files:**
- Create: `src/lib/studio/livePreview.ts`
- Create: `src/components/studio/preview/useDraftBroadcast.ts`
- Create: `src/components/preview/useDraftListener.ts`
- Create: `src/components/studio/preview/LivePreviewShell.tsx`

**Interfaces:**
- Produces: `STUDIO_PREVIEW_MESSAGE`, `StudioPreviewMessage<T>`, `PreviewScope` (types above).
- Produces: `useDraftBroadcast(iframeRef, scope, draft)` — posts `{type,scope,data:draft}` to the iframe's `contentWindow` whenever `draft` changes, throttled to animation frames; also re-posts on iframe `load`.
- Produces: `useDraftListener<T>(scope, initial)` → `T` — returns `initial`, then the latest `data` from any matching message.
- Produces: `LivePreviewShell({ previewSrc, scope, draft, children, headerRight })` — renders the left form pane (`children`), the right iframe pane (`src=previewSrc`), a desktop/mobile width toggle, and an "Open live page" affordance; wires `useDraftBroadcast` internally.

- [ ] **Step 1: Create the contract file**

Write `src/lib/studio/livePreview.ts` exactly as in "The postMessage contract" section above.

- [ ] **Step 2: Create `useDraftBroadcast`**

```ts
// src/components/studio/preview/useDraftBroadcast.ts
"use client";
import { useEffect, useRef } from "react";
import { STUDIO_PREVIEW_MESSAGE, type PreviewScope } from "@/lib/studio/livePreview";

// Posts the current draft into the preview iframe on every change (coalesced to
// one post per frame) and re-posts once the iframe finishes loading, so a
// freshly-mounted preview immediately reflects unsaved edits.
export function useDraftBroadcast<T>(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  scope: PreviewScope,
  draft: T,
) {
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const post = () => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: STUDIO_PREVIEW_MESSAGE, scope, data: draftRef.current }, "*");
  };

  useEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(post);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, scope]);

  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;
    el.addEventListener("load", post);
    return () => el.removeEventListener("load", post);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);
}
```

- [ ] **Step 3: Create `useDraftListener`**

```ts
// src/components/preview/useDraftListener.ts
"use client";
import { useEffect, useState } from "react";
import { STUDIO_PREVIEW_MESSAGE, type PreviewScope, type StudioPreviewMessage } from "@/lib/studio/livePreview";

// Inside the preview iframe: start from server-fetched `initial`, then re-render
// with whatever the studio editor posts. Scope-guarded so unrelated messages
// (or other embeds) are ignored.
export function useDraftListener<T>(scope: PreviewScope, initial: T): T {
  const [data, setData] = useState<T>(initial);
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const msg = e.data as StudioPreviewMessage<T> | undefined;
      if (!msg || msg.type !== STUDIO_PREVIEW_MESSAGE || msg.scope !== scope) return;
      setData(msg.data);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [scope]);
  return data;
}
```

- [ ] **Step 4: Create `LivePreviewShell`**

```tsx
// src/components/studio/preview/LivePreviewShell.tsx
"use client";
import { useRef, useState } from "react";
import { Monitor, Smartphone, ExternalLink } from "lucide-react";
import { cn } from "@/components/studio/ui/cn";
import { useDraftBroadcast } from "./useDraftBroadcast";
import type { PreviewScope } from "@/lib/studio/livePreview";

export function LivePreviewShell<T>({
  previewSrc,
  livePath,
  scope,
  draft,
  headerRight,
  children,
}: {
  previewSrc: string;        // iframe src, e.g. "/studio-preview/footer"
  livePath: string;          // real public URL, e.g. "/"
  scope: PreviewScope;
  draft: T;
  headerRight?: React.ReactNode;
  children: React.ReactNode; // the form pane
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  useDraftBroadcast(iframeRef, scope, draft);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(360px,460px)_1fr] gap-6 h-full">
      <div className="min-w-0 overflow-y-auto">{children}</div>
      <div className="hidden xl:flex flex-col rounded-2xl border border-studio-border bg-studio-soft overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-studio-border bg-studio-panel">
          <div className="flex items-center gap-1">
            <ToggleBtn active={device === "desktop"} onClick={() => setDevice("desktop")}><Monitor className="w-4 h-4" /></ToggleBtn>
            <ToggleBtn active={device === "mobile"} onClick={() => setDevice("mobile")}><Smartphone className="w-4 h-4" /></ToggleBtn>
            <span className="text-xs text-studio-ink-3 ml-2">Live preview</span>
          </div>
          <div className="flex items-center gap-3">
            {headerRight}
            <a href={livePath} target="_blank" rel="noopener" className="text-xs text-studio-ink-3 hover:text-studio-ink inline-flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Open live
            </a>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 flex justify-center">
          <iframe
            ref={iframeRef}
            src={previewSrc}
            title="Live preview"
            className={cn("bg-white border border-studio-border rounded-lg transition-all", device === "mobile" ? "w-[390px]" : "w-full")}
            style={{ height: "100%", minHeight: 600 }}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("p-1.5 rounded-md transition-colors", active ? "bg-studio-ink text-white" : "text-studio-ink-3 hover:bg-studio-soft")}>
      {children}
    </button>
  );
}
```

- [ ] **Step 5: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors referencing the four new files.

- [ ] **Step 6: Commit**

```bash
git add src/lib/studio/livePreview.ts src/components/studio/preview/ src/components/preview/useDraftListener.ts
git commit -m "feat(studio): live-preview foundation (postMessage bridge + shell)"
```

---

### Task 2: Chrome-free preview route group

**Files:**
- Create: `src/app/(preview)/layout.tsx`

**Interfaces:**
- Produces: a root layout for the `(preview)` route group that renders `<html>/<body>` + `globals.css` **without** Navbar/Footer/ChatWidget, so a previewed component isn't wrapped in duplicate site chrome.

**Context:** `(main)/layout.tsx` is itself a root layout (renders html/body) and there is deliberately no `src/app/layout.tsx`. A sibling `(preview)` group needs its own root layout, exactly as `(payload)` has its own.

- [ ] **Step 1: Create the layout**

```tsx
// src/app/(preview)/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = { title: "Studio preview", robots: { index: false, follow: false } };

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(preview)/layout.tsx"
git commit -m "feat(preview): chrome-free root layout for studio previews"
```

---

### Task 3: Split `Footer.tsx` into `FooterView` + server wrapper

**Files:**
- Modify: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/FooterView.tsx`

**Interfaces:**
- Produces: `type FooterData` — the fully-resolved props the footer needs (columns, contact, social, app, tagline, copyright, **banner**, **about**, **branches**, **legalLinks**, **developerCredit**).
- Produces: `FooterView(props: FooterData)` — pure presentational component (no data fetching), renders the current footer markup verbatim, driven entirely by props.
- Produces: `resolveFooterData(site, footer): FooterData` — pure mapper applying the existing fallbacks; exported so the preview route reuses identical resolution.
- Produces (default export of `Footer.tsx`): async server `Footer()` that fetches the two globals and renders `<FooterView {...resolveFooterData(...)} />`.

- [ ] **Step 1: Create `FooterView.tsx`**

Move the entire JSX return of the current `Footer.tsx` (lines 168–367) into `FooterView(props: FooterData)`, replacing the locally-computed `contact/social/app/tagline/copyright/columns` variables with `props.*`. Add the new fields:
- The green banner block: replace the hardcoded `<h3>Open your account instantly on CoopPesa</h3>` / subtext / button label with `props.banner.heading` / `props.banner.subtext` / `props.banner.buttonLabel` (href `props.banner.buttonHref`); wrap the whole banner in `{props.banner.enabled && (...)}`.
- The about paragraph (the "Empowering… since 1991" `<p>`): render `props.about`.
- The hardcoded branch `<li>` list: map `props.branches` → `<li>`; render `props.branchesNote` as the trailing muted link.
- The three inert legal `<span>`s: map `props.legalLinks` → real `<Link>`.
- "Developed by Sakurahost": render `props.developerCredit.label` with href `props.developerCredit.href`.

Define at the top of the file:

```tsx
export type FooterLink = { label: string; href: string };
export type FooterColumn = { heading: string; links: FooterLink[] };
export type FooterData = {
  columns: FooterColumn[];
  contact: { phone: string; email: string; address: string };
  social: { facebook: string; instagram: string; linkedin: string };
  app: { androidUrl: string; iosUrl: string };
  tagline: string;
  copyright: string;
  banner: { enabled: boolean; heading: string; subtext: string; buttonLabel: string; buttonHref: string };
  about: string;
  branches: FooterLink[];
  branchesNote: string;
  legalLinks: FooterLink[];
  developerCredit: FooterLink;
};
```

- [ ] **Step 2: Move the fallbacks + write `resolveFooterData` in `FooterView.tsx`**

Move `FALLBACK_COLUMNS`, `FALLBACK_CONTACT`, `FALLBACK_SOCIAL`, `FALLBACK_APP`, `FALLBACK_TAGLINE`, `FALLBACK_COPYRIGHT`, `shortAddress` into `FooterView.tsx`. Add new fallbacks matching today's hardcoded text and write the resolver:

```tsx
const FALLBACK_BANNER = { enabled: true, heading: "Open your account instantly on CoopPesa", subtext: "No branch visit needed — open your account digitally in minutes from your phone", buttonLabel: "Download CoopPesa", buttonHref: FALLBACK_APP.androidUrl };
const FALLBACK_ABOUT = "Cooperative Bank Tanzania Plc. Empowering individuals, businesses, and communities through inclusive banking since 1991.";
const FALLBACK_BRANCHES: FooterLink[] = [
  { label: "Dodoma (HQ)", href: "/branches" }, { label: "Mtwara (Tandahimba)", href: "/branches" },
  { label: "Tabora", href: "/branches" }, { label: "Moshi", href: "/branches" },
];
const FALLBACK_BRANCHES_NOTE = "+ 4 more coming soon";
const FALLBACK_LEGAL: FooterLink[] = [
  { label: "Privacy Policy", href: "#" }, { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" }, { label: "Whistleblower", href: "/whistleblower" },
];
const FALLBACK_DEV = { label: "Sakurahost", href: "https://sakurahost.co.tz/web-development/" };

export function resolveFooterData(site: Record<string, any>, footer: Record<string, any>): FooterData {
  const globalColumns: FooterColumn[] = Array.isArray(footer?.columns)
    ? footer.columns.filter((c: any) => c?.heading).map((c: any) => ({
        heading: c.heading,
        links: Array.isArray(c.links) ? c.links.filter((l: any) => l?.label && l?.href) : [],
      }))
    : [];
  return {
    columns: globalColumns.length ? globalColumns : FALLBACK_COLUMNS,
    contact: {
      phone: site?.contact?.phone || FALLBACK_CONTACT.phone,
      email: site?.contact?.email || FALLBACK_CONTACT.email,
      address: shortAddress(site?.contact?.headquartersAddress),
    },
    social: {
      facebook: site?.social?.facebook || FALLBACK_SOCIAL.facebook,
      instagram: site?.social?.instagram || FALLBACK_SOCIAL.instagram,
      linkedin: site?.social?.linkedin || FALLBACK_SOCIAL.linkedin,
    },
    app: { androidUrl: site?.appStore?.androidUrl || FALLBACK_APP.androidUrl, iosUrl: site?.appStore?.iosUrl || FALLBACK_APP.iosUrl },
    tagline: footer?.tagline || FALLBACK_TAGLINE,
    copyright: footer?.copyright || FALLBACK_COPYRIGHT,
    banner: {
      enabled: footer?.openAccountBanner?.enabled ?? FALLBACK_BANNER.enabled,
      heading: footer?.openAccountBanner?.heading || FALLBACK_BANNER.heading,
      subtext: footer?.openAccountBanner?.subtext || FALLBACK_BANNER.subtext,
      buttonLabel: footer?.openAccountBanner?.buttonLabel || FALLBACK_BANNER.buttonLabel,
      buttonHref: footer?.openAccountBanner?.buttonHref || site?.appStore?.androidUrl || FALLBACK_BANNER.buttonHref,
    },
    about: footer?.about || FALLBACK_ABOUT,
    branches: Array.isArray(footer?.branches) && footer.branches.length ? footer.branches.filter((b: any) => b?.label) : FALLBACK_BRANCHES,
    branchesNote: footer?.branchesNote || FALLBACK_BRANCHES_NOTE,
    legalLinks: Array.isArray(footer?.legalLinks) && footer.legalLinks.length ? footer.legalLinks.filter((l: any) => l?.label) : FALLBACK_LEGAL,
    developerCredit: { label: footer?.developerCredit?.label || FALLBACK_DEV.label, href: footer?.developerCredit?.href || FALLBACK_DEV.href },
  };
}
```

- [ ] **Step 3: Reduce `Footer.tsx` to a thin server wrapper**

```tsx
// src/components/layout/Footer.tsx
import { getPayload } from "payload";
import config from "../../../payload.config";
import { FooterView, resolveFooterData } from "./FooterView";

async function loadFooterData() {
  try {
    const payload = await getPayload({ config });
    const [site, footer] = await Promise.all([
      payload.findGlobal({ slug: "site-settings", depth: 0 }),
      payload.findGlobal({ slug: "footer", depth: 0 }),
    ]);
    return { site: site as Record<string, any>, footer: footer as Record<string, any> };
  } catch {
    return { site: {} as Record<string, any>, footer: {} as Record<string, any> };
  }
}

export default async function Footer() {
  const { site, footer } = await loadFooterData();
  return <FooterView {...resolveFooterData(site, footer)} />;
}
```

- [ ] **Step 4: Verify compile + visual parity**

Run: `npx tsc --noEmit` → no errors.
Run: `npm run dev`, load `http://localhost:3000/` — the footer must look **pixel-identical** to before (same banner, columns, branches, legal row, social). This proves the refactor is behaviour-preserving before any new editing is added.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Footer.tsx src/components/layout/FooterView.tsx
git commit -m "refactor(footer): split into pure FooterView + server wrapper (no behaviour change)"
```

---

### Task 4: Footer global schema — new editable fields

**Files:**
- Modify: `src/payload/globals/Footer.ts`

**Interfaces:**
- Produces: new fields on the `footer` global: `openAccountBanner` (group: `enabled` checkbox, `heading`, `subtext`, `buttonLabel`, `buttonHref` text), `about` (textarea), `branches` (array of `{label,href}`), `branchesNote` (text), `legalLinks` (array of `{label,href}`), `developerCredit` (group: `label`, `href` text). These are the keys `resolveFooterData` reads.

- [ ] **Step 1: Add the fields**

In `src/payload/globals/Footer.ts`, inside `fields`, after the existing `columns` array and before `tagline`, add:

```ts
{
  name: "openAccountBanner",
  type: "group",
  fields: [
    { name: "enabled", type: "checkbox", defaultValue: true },
    { name: "heading", type: "text" },
    { name: "subtext", type: "text" },
    { name: "buttonLabel", type: "text" },
    { name: "buttonHref", type: "text", admin: { description: "Defaults to the Play Store URL if blank." } },
  ],
},
{ name: "about", type: "textarea", admin: { description: "Short paragraph under the footer logo." } },
{
  name: "branches",
  type: "array",
  labels: { singular: "Branch", plural: "Footer branches" },
  fields: [ { name: "label", type: "text", required: true }, { name: "href", type: "text", required: true, defaultValue: "/branches" } ],
},
{ name: "branchesNote", type: "text", admin: { description: 'e.g. "+ 4 more coming soon"' } },
{
  name: "legalLinks",
  type: "array",
  labels: { singular: "Legal link", plural: "Legal links" },
  fields: [ { name: "label", type: "text", required: true }, { name: "href", type: "text", required: true } ],
},
{
  name: "developerCredit",
  type: "group",
  fields: [ { name: "label", type: "text" }, { name: "href", type: "text" } ],
},
```

- [ ] **Step 2: Regenerate Payload types + reviewable SQL**

Run: `npx payload generate:types` → updates `payload-types.ts`.
Run: `npx payload migrate:create footer_editable_fields` → generates a migration file under `src/migrations/` (or the configured dir) with the additive SQL. **Do not run `migrate` against Neon.**

- [ ] **Step 3: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors. (`resolveFooterData` already reads these keys defensively, so it compiles whether or not the DB has them yet.)

- [ ] **Step 4: Hand off the migration (operational gate)**

Print the generated SQL and stop for the repo owner to apply it to Neon. Note in the commit body that the migration is **pending manual application**. The site keeps using fallbacks until then.

- [ ] **Step 5: Commit**

```bash
git add src/payload/globals/Footer.ts payload-types.ts src/migrations/
git commit -m "feat(footer): add banner/about/branches/legal/developer fields to footer global

Additive Neon migration generated — PENDING manual application by repo owner."
```

---

### Task 5: Footer preview route

**Files:**
- Create: `src/app/(preview)/studio-preview/footer/page.tsx`
- Create: `src/components/preview/FooterPreviewClient.tsx`

**Interfaces:**
- Consumes: `FooterView`, `resolveFooterData`, `FooterData` (Task 3); `useDraftListener` (Task 1).
- Produces: route `/studio-preview/footer` that server-fetches the two globals, resolves initial `FooterData`, and renders `<FooterPreviewClient initial={...} />` which live-overlays editor drafts and renders `<FooterView {...data} />`.

- [ ] **Step 1: Create the preview client**

```tsx
// src/components/preview/FooterPreviewClient.tsx
"use client";
import { FooterView, type FooterData } from "@/components/layout/FooterView";
import { useDraftListener } from "./useDraftListener";

export default function FooterPreviewClient({ initial }: { initial: FooterData }) {
  const data = useDraftListener<FooterData>("footer", initial);
  return <FooterView {...data} />;
}
```

- [ ] **Step 2: Create the preview route**

```tsx
// src/app/(preview)/studio-preview/footer/page.tsx
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { resolveFooterData } from "@/components/layout/FooterView";
import FooterPreviewClient from "@/components/preview/FooterPreviewClient";

export const dynamic = "force-dynamic";

export default async function FooterPreviewPage() {
  const payload = await getPayload({ config });
  const [site, footer] = await Promise.all([
    payload.findGlobal({ slug: "site-settings", depth: 0 }).catch(() => ({})),
    payload.findGlobal({ slug: "footer", depth: 0 }).catch(() => ({})),
  ]);
  const initial = resolveFooterData(site as Record<string, any>, footer as Record<string, any>);
  return <FooterPreviewClient initial={initial} />;
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` → no errors.
Run: `npm run dev`, load `http://localhost:3000/studio-preview/footer` — shows the footer **only** (no navbar/chat), matching the site footer.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(preview)/studio-preview/footer/" src/components/preview/FooterPreviewClient.tsx
git commit -m "feat(preview): standalone footer preview route"
```

---

### Task 6: Footer editor (form + live preview)

**Files:**
- Create: `src/components/studio/footer/FooterEditor.tsx`
- Create: `src/app/(studio)/studio/footer/page.tsx`
- Modify: `src/components/studio/Sidebar.tsx`

**Interfaces:**
- Consumes: `LivePreviewShell` (Task 1); `FooterData`/`FooterColumn`/`FooterLink` types (Task 3); Payload `POST /api/globals/footer`.
- Produces: `/studio/footer` — a live-preview editor for the footer. Draft state mirrors the persisted footer global shape (columns, banner, about, branches, branchesNote, legalLinks, developerCredit, tagline, copyright). Save posts the whole global.

**Context:** mirror the save mechanics of `src/components/studio/agents/AgentForm.tsx` (local `draft`, explicit Save button + `SaveStatus`, `router.refresh()` on success). Here the endpoint is the global: `POST /api/globals/footer` with the draft body (like `SettingsHub.persistGlobal`).

- [ ] **Step 1: Build `FooterEditor.tsx`**

Create a `"use client"` component that:
1. Takes `initialFooter: Partial<FooterData-shaped global>` from the server page.
2. Holds `draft` in state; every field edit calls a `patch(...)` updater (set dirty, save-state idle).
3. Renders `<LivePreviewShell previewSrc="/studio-preview/footer" livePath="/" scope="footer" draft={draftAsFooterData} headerRight={<SaveButton/>}>` with the form pane as children.
4. The form pane has grouped sections using the studio UI kit (`Input`, `Select`, a small `Field` helper as in AgentForm): **Banner** (enabled checkbox, heading, subtext, buttonLabel, buttonHref), **About** (textarea + tagline + copyright), **Columns** (array editor — add/remove column, add/remove link per column, move up/down), **Branches** (array editor + branchesNote), **Legal links** (array editor), **Developer credit** (label, href).
5. `draftAsFooterData` maps the editor draft into `FooterData` using the **same** fallback resolution as `resolveFooterData` (import and reuse it: `resolveFooterData({}, draft)` where `draft` is the global-shaped object) so the preview matches production exactly.
6. Save: `POST /api/globals/footer` with the global-shaped draft (columns, openAccountBanner, about, branches, branchesNote, legalLinks, developerCredit, tagline, copyright); on ok → `SaveStatus` saved + `router.refresh()`.

Array-editor helper (reuse for columns/branches/legal):

```tsx
function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir; if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice(); [next[i], next[j]] = [next[j], next[i]]; return next;
}
```

- [ ] **Step 2: Build the studio route**

```tsx
// src/app/(studio)/studio/footer/page.tsx
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { FooterEditor } from "@/components/studio/footer/FooterEditor";

export const dynamic = "force-dynamic";

export default async function FooterStudioPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const footer = await payload.findGlobal({ slug: "footer", depth: 0 }).catch(() => ({}));
  return (
    <div className="p-8 lg:p-10 h-[calc(100vh-0px)]">
      <FooterEditor initialFooter={footer as Record<string, unknown>} />
    </div>
  );
}
```

- [ ] **Step 3: Add the sidebar nav item**

In `src/components/studio/Sidebar.tsx`, in the group that holds Settings (the "System" group, near line 92), add above the Settings item:
`{ href: "/studio/footer", label: "Footer", icon: PanelBottom, scope: "settings" },`
and import `PanelBottom` from `lucide-react` in that file's icon imports.

- [ ] **Step 4: Verify end-to-end**

Run: `npx tsc --noEmit` → no errors.
Run: `npm run dev`, log into `/studio`, open `/studio/footer`:
1. Editing the **banner heading** updates the right-pane preview within a frame. ✅
2. Adding a **column** + link shows it in the preview. ✅
3. Reordering branches reorders them in the preview. ✅
4. Click **Save**, reload `/` in a new tab → the change is live on the real site (requires the Task-4 migration to be applied on Neon; if not yet applied, Save returns 200 but new-field columns won't persist — verify at least tagline/columns which pre-exist). ✅

- [ ] **Step 5: Commit**

```bash
git add "src/app/(studio)/studio/footer/" src/components/studio/footer/ src/components/studio/Sidebar.tsx
git commit -m "feat(studio): live-preview footer editor (banner/about/columns/branches/legal)"
```

---

### Task 7: Leadership preview route

**Files:**
- Create: `src/app/(preview)/studio-preview/leadership/page.tsx`
- Create: `src/components/preview/LeadershipPreviewClient.tsx`

**Interfaces:**
- Consumes: `LeadershipGrid`, `Person` from `@/components/about/LeadershipGrid`; `useDraftListener` (Task 1).
- Produces: route `/studio-preview/leadership` that renders the board + management grids stacked, each live-overlaid by draft. Draft shape: `{ category: "board"|"executive"|..., people: Person[], intro: string, highlightCount: number }[]` keyed for both categories, or a single active category driven by a `?category=` query. Use a single active category via query param for simplicity: `{ intro, highlightCount, people }`.

- [ ] **Step 1: Create the preview client**

```tsx
// src/components/preview/LeadershipPreviewClient.tsx
"use client";
import { LeadershipGrid, type Person } from "@/components/about/LeadershipGrid";
import { useDraftListener } from "./useDraftListener";

export type LeadershipPreviewData = { intro: string; highlightCount: number; people: Person[] };

export default function LeadershipPreviewClient({ initial }: { initial: LeadershipPreviewData }) {
  const data = useDraftListener<LeadershipPreviewData>("leadership", initial);
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <LeadershipGrid intro={data.intro} people={data.people} highlightCount={data.highlightCount} />
    </div>
  );
}
```

- [ ] **Step 2: Create the preview route**

```tsx
// src/app/(preview)/studio-preview/leadership/page.tsx
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import LeadershipPreviewClient, { type LeadershipPreviewData } from "@/components/preview/LeadershipPreviewClient";
import type { Person } from "@/components/about/LeadershipGrid";

export const dynamic = "force-dynamic";

export default async function LeadershipPreviewPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category = "board" } = await searchParams;
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "leadership-team",
    where: { and: [{ category: { equals: category } }, { active: { not_equals: false } }] },
    sort: "sortOrder", depth: 1, limit: 100,
  }).catch(() => ({ docs: [] as unknown[] }));
  const people: Person[] = (res.docs as any[]).map((d) => ({ name: d.name, title: d.title, image: d.photo?.url }));
  const initial: LeadershipPreviewData = { intro: "", highlightCount: category === "board" ? 2 : 1, people };
  return <LeadershipPreviewClient initial={initial} />;
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` → no errors.
Run: `npm run dev`, load `/studio-preview/leadership?category=board` — renders the board grid in the live-site card style.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(preview)/studio-preview/leadership/" src/components/preview/LeadershipPreviewClient.tsx
git commit -m "feat(preview): standalone leadership grid preview route"
```

---

### Task 8: In-studio leadership create/edit form (replace the /admin bounce)

**Files:**
- Create: `src/components/studio/leadership/LeadershipForm.tsx`
- Create: `src/app/(studio)/studio/team-leadership/[id]/page.tsx`
- Modify: `src/app/(studio)/studio/team-leadership/page.tsx`

**Interfaces:**
- Consumes: `LivePreviewShell` (Task 1); Payload `POST /api/leadership-team`, `PATCH /api/leadership-team/:id`, `DELETE /api/leadership-team/:id`, `POST /api/media`.
- Produces: `LeadershipForm({ mode, initial })` where `initial: LeadershipDraft` = `{ id?, name, title, category, photo?: {id,url}, bio, email, linkedin, sortOrder, active }`. Live preview scope `"leadership"`, `previewSrc={`/studio-preview/leadership?category=${draft.category}`}`.

**Context:** mirror `src/components/studio/agents/AgentForm.tsx` structure exactly (draft state, debounced autosave + explicit Save, `SaveStatus`, create→`replaceState` to `/studio/team-leadership/:id`). Additions: a `category` `<Select>` (board/executive/senior/advisory), `photo` upload (POST to `/api/media`, store `{id,url}`, show thumbnail), `bio` textarea, `email`, `linkedin`, `sortOrder` number, `active` checkbox. The save body sends `photo` as the media **id**.

- [ ] **Step 1: Build `LeadershipForm.tsx`**

Copy the AgentForm skeleton; change `AgentDraft`→`LeadershipDraft` with the fields above; set endpoints to `/api/leadership-team`. Add a photo uploader:

```tsx
async function uploadPhoto(file: File) {
  const fd = new FormData(); fd.append("file", file);
  const res = await fetch("/api/media", { method: "POST", body: fd });
  if (!res.ok) throw new Error(`upload HTTP ${res.status}`);
  const data = await res.json();
  patch({ photo: { id: data.doc.id, url: data.doc.url } });
}
```

In `persist()`, the body is `{ name, title, category, bio, email, linkedin, sortOrder, active, photo: draft.photo?.id }`.

Wrap the form pane in `<LivePreviewShell previewSrc={`/studio-preview/leadership?category=${draft.category}`} livePath={draft.category === "board" ? "/about-us/board" : "/about-us/management"} scope="leadership" draft={{ intro: "", highlightCount: draft.category === "board" ? 2 : 1, people: [{ name: draft.name, title: draft.title, image: draft.photo?.url }] }}>`. (Single-profile preview showing the live card style; the full grid is visible via "Open live".)

- [ ] **Step 2: Build the detail route**

```tsx
// src/app/(studio)/studio/team-leadership/[id]/page.tsx
import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { LeadershipForm, type LeadershipDraft } from "@/components/studio/leadership/LeadershipForm";

export const dynamic = "force-dynamic";

const EMPTY: LeadershipDraft = { name: "", title: "", category: "executive", bio: "", email: "", linkedin: "", sortOrder: 100, active: true };

export default async function LeadershipDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireStudioUser();
  const { id } = await params;
  if (id === "new") return <LeadershipForm mode="create" initial={EMPTY} />;
  const payload = await getPayload({ config });
  const doc = await payload.findByID({ collection: "leadership-team", id, depth: 1 }).catch(() => null);
  if (!doc) return <LeadershipForm mode="create" initial={EMPTY} />;
  const d = doc as any;
  const initial: LeadershipDraft = { id: d.id, name: d.name, title: d.title, category: d.category, photo: d.photo ? { id: d.photo.id, url: d.photo.url } : undefined, bio: d.bio || "", email: d.email || "", linkedin: d.linkedin || "", sortOrder: d.sortOrder ?? 100, active: d.active !== false };
  return <LeadershipForm mode="edit" initial={initial} />;
}
```

- [ ] **Step 3: Repoint the list page off `/admin`**

In `src/app/(studio)/studio/team-leadership/page.tsx`, change the "Add profile" link `href="/admin/collections/leadership-team/create"` → `href="/studio/team-leadership/new"`, and each card link `href={`/admin/collections/leadership-team/${p.id}`}` → `href={`/studio/team-leadership/${p.id}`}`.

- [ ] **Step 4: Verify end-to-end**

Run: `npx tsc --noEmit` → no errors.
Run: `npm run dev`, `/studio/team-leadership` → "Add profile" opens the in-studio form (no `/admin`). Fill name/title/category, upload a photo → preview card shows it. Save → appears in the list. Open `/about-us/board` (if category board) → the new profile renders. Edit → change reflects. ✅

- [ ] **Step 5: Commit**

```bash
git add "src/app/(studio)/studio/team-leadership/" src/components/studio/leadership/
git commit -m "feat(studio): native leadership create/edit form with live preview (drops /admin bounce)"
```

---

### Task 9: Fix leadership photo resolution

**Files:**
- Modify: `src/lib/leadership.ts:34-40`

**Interfaces:**
- Consumes: nothing new.
- Produces: CMS-uploaded photos (GCS absolute URLs) render on the public board/management pages instead of falling back to initials on a name mismatch.

**Context:** current logic rejects any `/api/media/file/*` URL and, when the CMS URL is unusable, falls back to a name-matched local image or nothing. Since GCS uploads now yield absolute `https://storage.googleapis.com/...` URLs (`disablePayloadAccessControl` on media), the guard is correct but the name-match fallback silently hides valid uploads whose filename differs. Keep the GCS-absolute preference; only fall back to a local image when there is **no** usable CMS URL.

- [ ] **Step 1: Apply the change**

In `src/lib/leadership.ts`, keep the `usable` check as-is; the `.map` already prefers `url` when usable and only uses `localByName[doc.name]` otherwise — confirm that is the behaviour and add a comment. If any code path returns `undefined` for a doc that HAS a usable GCS url, fix it so `usable` wins. (Verify the existing `usable ? url : localByName[doc.name] || undefined` line already does this; if so, this task reduces to confirming + a regression note. No code change if already correct.)

- [ ] **Step 2: Verify**

Run: `npm run dev`, upload a photo via `/studio/team-leadership/new` with a filename that does NOT match any fallback name, Save, open the public page → the uploaded photo renders (not initials). ✅

- [ ] **Step 3: Commit (if changed)**

```bash
git add src/lib/leadership.ts
git commit -m "fix(leadership): prefer CMS-uploaded GCS photo over name-matched local fallback"
```

---

### Task 10: Fold Settings (contact/social/app) into the footer preview

**Files:**
- Modify: `src/components/studio/footer/FooterEditor.tsx`

**Interfaces:**
- Consumes: `POST /api/globals/site-settings` (as `SettingsHub` does today).
- Produces: the footer editor also exposes Contact (phone/email/HQ address), Social (facebook/instagram/linkedin), and App (android/ios URL) fields — edits post to `site-settings` and reflect in the same footer preview, so the whole footer story is one screen.

**Context:** these three groups already drive the footer (`resolveFooterData` reads `site.contact/social/appStore`). Add them to `FooterEditor`'s draft as a separate `site` sub-state saved to `/api/globals/site-settings`, and fold `site` into the `draftAsFooterData` mapping (`resolveFooterData(site, footerDraft)`) so the preview updates live.

- [ ] **Step 1: Extend the editor**

Add a `site` state (contact/social/appStore) seeded from a new `initialSite` prop. Add three form sections. On save, POST both globals (footer + site-settings). In `draftAsFooterData`, call `resolveFooterData(site, footerDraft)` so contact/social/app edits appear in the preview immediately. Update `/studio/footer/page.tsx` to also fetch `site-settings` and pass `initialSite`.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` → no errors.
Run: `/studio/footer` → editing the **phone** updates the footer preview's HQ block live; Save persists to site-settings; `/` reflects it. ✅

- [ ] **Step 3: Commit**

```bash
git add src/components/studio/footer/FooterEditor.tsx "src/app/(studio)/studio/footer/page.tsx"
git commit -m "feat(studio): fold contact/social/app settings into the footer live-preview editor"
```

---

## Phase-1 quick wins (independent — no dependency on Tasks 1–10)

These flip several **BROKEN/PARTIAL** items to **WORKS** with ~zero schema. Each is standalone; do in any order.

### Task 11: Mount the emergency banner (dead editor → working)

**Files:** Create `src/components/layout/EmergencyBanner.tsx`; Modify `src/app/(main)/layout.tsx`.

- [ ] **Step 1:** Create a server component that reads `site-settings.emergencyBanner` (via `getPayload().findGlobal`) and, when `active`, renders a full-width bar above `<Navbar/>` with `level`→colour (info=blue, warning=amber, urgent=red), `message`, and optional `linkLabel`/`linkHref`. Fall back to rendering nothing on error or `!active`.
- [ ] **Step 2:** In `(main)/layout.tsx`, render `<EmergencyBanner />` immediately inside `<body>` before `<Navbar />`.
- [ ] **Step 3:** Verify: toggle the banner on in `/studio/settings` → Emergency banner tab, Save, reload `/` → bar shows. `npx tsc --noEmit` clean.
- [ ] **Step 4:** Commit `feat(layout): render emergency banner from site-settings (activates the existing editor)`.

### Task 12: Fix FAQ HTML render bug

**Files:** Modify `src/components/.../FaqsClient.tsx` (the answer render, ~line 55).

- [ ] **Step 1:** Replace the plain-text `{answer}` render (currently `whitespace-pre-line`) with `<div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: answerHtml }} />`, reading the `answerHtml` field the collection already stores.
- [ ] **Step 2:** Verify: an FAQ authored with bold/links in `/studio/faqs` renders formatted (not literal tags) on `/faqs`. `npx tsc --noEmit` clean.
- [ ] **Step 3:** Commit `fix(faqs): render answerHtml as HTML instead of literal text`.

### Task 13: Wire the whistleblower evidence array

**Files:** Modify `src/app/api/whistleblower/route.ts`.

- [ ] **Step 1:** After uploading each evidence file to GCS, create a `media` doc (or reuse the existing upload) and push its id into the report's `evidence` array field on `payload.create`, instead of embedding a proxy link in `description`.
- [ ] **Step 2:** Verify: submit `/whistleblower` with a file → the case in `/studio/whistleblower/:id` shows it in the Evidence panel. `npx tsc --noEmit` clean.
- [ ] **Step 3:** Commit `fix(whistleblower): populate evidence array so studio case view shows attachments`.

### Task 14: Branches — consume saved map/photo/coordinates

**Files:** Modify `src/app/(main)/branches/page.tsx` (mapper) + `BranchesClient.tsx` (type + render).

- [ ] **Step 1:** Pass `mapsUrl`, `photo` (url), `coordinates` from the collection through the page mapper into `ClientBranch`; use saved `mapsUrl` when present (else keep the synthesized search URL); render `photo` where the card has an image slot. Fix the `"{region}, {region} Region"` duplicate.
- [ ] **Step 2:** Verify: set a branch `mapsUrl`/`photo` in `/studio/branches`, Save → `/branches` uses them. `npx tsc --noEmit` clean.
- [ ] **Step 3:** Commit `fix(branches): consume saved mapsUrl/photo/coordinates on the public page`.

---

## Self-Review notes

- **Spec coverage:** This plan implements Phase 0 (§6 of the spec: live-preview foundation + Footer + Teams + Settings) and the zero-schema Phase-1 quick wins (§4A). Phases 2–5 (interest-rates wiring, /admin de-bounce for reports/notices/forex, product collections, applications inbox, block-builder maturity, About-Us) are **out of scope** and get their own plans.
- **Interest-rates + service-fees wiring** (§4A items 2–3) are deferred to the Phase-1 plan because they touch 3 marketing pages each and are larger than a single quick-win task; not included here to keep this plan shippable.
- **Testing:** no unit tests are written because the repo has no test harness (see Global Constraints); every task gates on `npx tsc --noEmit` + explicit manual QA. Do not introduce a test runner as part of this plan.
- **Migration gate:** Task 4 is the only schema change; its SQL must be applied to Neon by the repo owner before the new footer fields persist. All other tasks work without it.
