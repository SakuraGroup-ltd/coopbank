# Studio ↔ Frontend Mirror: Audit & Implementation Plan

**Date:** 2026-07-09
**Repo:** Cooperative Bank Tanzania website (Next.js 16 · React 19 · Payload CMS 3.85 · Postgres/Neon · GCS)
**Objective:** Audit the entire frontend and determine exactly what must be built, updated, or
synchronized across the **database schema** and the **bespoke `/studio` backend** so the studio
becomes a "perfect CMS" that mirrors every public page — with a live, side-by-side preview.
Priority surfaces: **Footer** and **Teams (Leadership)**.

---

## 0. Method

Four parallel read-only audits covered the full `src/app/(main)` surface, all globals, all
collections, and all studio editors. Every high-impact claim was directly re-verified in code.
Constraint that shapes everything: the Postgres adapter runs `push: false` and the Neon database is
**shared with production** — so **every new field is a deliberate, additive migration**, never an
auto-push. All new fields proposed here are additive (new nullable columns / child tables) and safe
for existing rows; each degrades to the current hardcoded fallback until applied.

---

## 1. The three systemic failure modes

The studio is ~70% built. The gaps cluster into three repeatable patterns:

### 1a. Dead editors — save succeeds, page never changes
Editors persist to a CMS backing that **no public component reads**:

| Editor | Saves to | Consumer | Fix cost |
|---|---|---|---|
| Settings → **Header** tab | `header` global | Navbar is 100% hardcoded — never reads it | Wire Navbar (+ expand global) |
| Settings → **Emergency banner** tab | `site-settings.emergencyBanner` | No banner component mounted anywhere | Mount 1 component — **zero schema** |
| **Interest Rates** grid (`/studio/rates`) | `interest-rates` | No public page reads it; loan rates hardcoded | Wire 3 pages — **zero schema** |
| **Service Fees** grid (`/studio/fees`) | `service-fees` | No public page reads it | Add a public fees view — **zero schema** |
| `homepage` global | `homepage` | Home page is hardcoded; global unrendered | Convert home (Phase 5) |

### 1b. Hardcoded public pages — no CMS backing at all
The entire marketing surface is hand-coded React with inline data arrays:

- **Chrome:** `Navbar.tsx` (all mega-menus, top links, announcement strip), `Footer.tsx` (banner, about paragraph, branches list, legal links, "developed by").
- **Home:** `page.tsx` + `components/home/*` — 6 sections, only the FX ticker is live.
- **Products:** `personal-banking` (19 accounts), `loan-products` + `/calculator` (10 loans, **divergent/inconsistent** copies), `digital-banking` + 4 sub-routes (coopnet/ussd/coopwakala/qr-pay), `treasury/*` marketing halves, `open-account` (account list duplicated **3×**).
- **Corporate:** `about-us` (hero, bank prayer, story, journey, values), about-us sidebar/contact card.

### 1c. /admin bounces + missing CRUD
Editors that punt to raw Payload admin, or lack in-studio operations:

- **Bounce to `/admin`:** Leadership (add/edit), Annual Reports (create+edit), Statutory Notices (create+edit), Forex (create currency), Bank Charges (create+edit). **No editor at all:** MediaCoverage (News).
- **No in-studio delete** anywhere except Interest Rates (`delete: isAdmin` + no UI): Blog, Press, Careers, Tenders, Branches (hard), FAQs, Auctions, Forex, Agents.
- **Render / wiring bugs:** FAQ answers (`answerHtml`) printed as literal HTML text; Branches ignore saved `mapsUrl/photo/coordinates`; Press `mediaContact` not editable though rendered; Whistleblower `evidence` array never populated (link stuffed into description); Tenders cards show no teaser.
- **Public routes missing:** `/investors` (Navbar links to `#annual-reports` / `#notices` → **404**); no `(main)/[slug]` route to render Pages block docs live.

### 1d. The "mirror how they look" gap
The real postMessage WYSIWYG only runs inside **Payload's native admin** live-preview panel. The
bespoke studio's `PageComposer` is an autosave form whose "Preview" just opens `/preview/<slug>` in
a **new tab** — no iframe, no live side-by-side. The reusable half (the `/preview/[...slug]`
dispatcher + `PreviewClient` + `BlockRenderer`) exists; the studio-side postMessage **sender** does
not. Building it is the flagship deliverable.

---

## 2. Verdict scoreboard (dynamic collections)

| Feature | In-studio CRUD | Public reflection | Verdict |
|---|---|---|---|
| Careers, Tenders, Agents, Chat, Whistleblower | CRU(+publish/triage) | VERIFIED | **WORKS** |
| Blog, Press | CRU+publish, no delete | VERIFIED | PARTIAL |
| Branches | CRU+soft-delete | under-reflects 3 fields | PARTIAL |
| FAQs | CRU, no delete | HTML render bug | PARTIAL |
| Auctions | CRU, no delete | VERIFIED | PARTIAL |
| Forex | update-only; create/delete → /admin | VERIFIED | PARTIAL |
| Annual Reports | read-only; C/U → /admin | **no public page (404)** | PARTIAL |
| Statutory Notices | read-only; C/U → /admin | **no public page (404)** | PARTIAL |
| **Interest Rates** | full CRUD | **no consumer (dead)** | **BROKEN** |
| **News (MediaCoverage)** | **no editor** | VERIFIED + fallback | **NONE** |

Marketing/product pages and chrome (Navbar, Footer, Home, About-Us, personal/digital banking,
loans, treasury marketing): **NONE** (hardcoded, no backing) except the three live data tables
(bank-charges PDF, forex rates, auctions calendar).

---

## 3. The mirror architecture (cross-cutting foundation)

One reusable pattern, proven on Footer + Teams, then extended everywhere.

**`LivePreviewShell`** — two-pane studio layout: editor form (left) + resizable `<iframe>` (right,
desktop/mobile toggle, "open live page", save-status).

- **`useDraftBroadcast(draft)`** — throttled `window.postMessage({type:"studio-live-preview", data})`
  to the iframe on every field change.
- **`/preview/<scope>`** branches added to the existing `src/app/(main)/preview/[...slug]/page.tsx`
  dispatcher (`footer`, `leadership`, …) that fetch real data (`draft:true`) and render a client.
- **`useDraftListener(initial)`** — the preview client listens for the postMessage and overlays the
  draft on server-fetched initial data, re-rendering the **real presentational component**.

**Honesty refactor:** split `Footer.tsx` into a pure **`FooterView(props)`** + a thin server
wrapper that fetches. The preview route and the live site both render `FooterView` — so the studio
preview is guaranteed identical to production. `LeadershipGrid` is already presentational.

**Save model:** explicit **Save** button + dirty indicator (safer for structured arrays than the
current keystroke autosave). Preview reflects unsaved drafts; Save persists via Payload REST →
`router.refresh()`.

---

## 4. Definitive DB schema change list (`push:false` — additive Neon migrations)

### A. NO schema change — wire a consumer / fix a render (highest ROI)
1. Mount `<EmergencyBanner>` reading `site-settings.emergencyBanner` in `(main)/layout.tsx`.
2. Wire `loan-products`, `treasury/fixed-deposits`, `personal-banking` to read `interest-rates`.
3. Add a public consumer of `service-fees`.
4. Fix `FaqsClient.tsx` to render `answerHtml` via `dangerouslySetInnerHTML`.
5. Branches: consume `mapsUrl` / `photo` / `coordinates` in the page mapper + client.
6. Press: add `mediaContact.*` inputs to the composer (fields exist).
7. Whistleblower: populate the `evidence` array in `api/whistleblower/route.ts` (fields exist).
8. Footer **columns** editor (the `columns` array already exists on the global).

### B. New fields on existing globals/collections
- **`footer` global:** `openAccountBanner{heading,subtext,buttonLabel,buttonHref}`, `about` (textarea),
  `branches[]{label,href}` + `branchesNote`, `legalLinks[]{label,href}`, `developerCredit{label,href}`.
- **`header` global:** `topLinks[]{label,href}`, `announcementStrip{text,active}`,
  `authLinks{loginUrl,registerUrl}`, `mainNav[]{label,href,cta{label,href,desc},megaColumns[]{title,items[]{label,href,desc}}}`.
- **Leadership presentation:** `boardIntro`, `managementIntro`, `boardHighlightCount`,
  `managementHighlightCount` (on a global, or fold into the new `about-us` global).
- **`tenders`:** `summary` text (cards currently blank).
- **`forex-rates`:** optional `sortOrder` (replace hardcoded `ORDER` array).
- **`interest-rates`:** no columns needed — grid must expose existing `rateValue/minimumAmount/notes/active`.

### C. New collections
- **`account-products`** — dedupes the 3 hardcoded account lists; feeds `/personal-banking` + the
  `/open-account` selector + the email label map. Fields: name, slug, category, shortDesc, longDesc,
  image, features[], requirements[], channels[], order, active, openable.
- **`loan-products`** — unifies `/loan-products` + `/calculator` (fixes a live data-integrity
  inconsistency). Display fields + calculator numerics: `annualRatePct, minAmount, maxAmount, maxTenureMonths, rateNote`.
- **`digital-channels`**, **`ussd-services`** — back the digital-banking hub + USSD grid.
- **`account-applications`**, **`wakala-applications`** — persist the currently email-only submissions.

### D. New global (or Pages doc)
- **`about-us`** — hero, stats[], bankPrayer (richText), ourStory (richText), branchNetwork,
  journey[], mission, vision, bankPurpose, coreValues[], sidebar corporateNav[].

### E. Pages block-builder maturity (enables moving bespoke marketing to blocks)
- Finish 3 stub renderers: `rich-text`, `image-text` body, `faq` answer (all dump Lexical JSON today).
- Add **image pickers** to `BlockEditor` (no block exposes an image input) and **unify media** (studio
  Library manages a raw GCS bucket, disjoint from the Payload `media` collection blocks relate to).
- New blocks: **accordion/tabs**, **code-table** (USSD), **steps/how-it-works**, **currency-chips**.
- Add a `(main)/[slug]` catch-all + a home renderer so Pages docs render live (today blocks render
  **only** in the preview iframe).

### F. Missing public routes
- `/investors` (annual reports + statutory notices) — Navbar links currently 404.

---

## 5. Studio backend / editor work list

- **Foundation:** `LivePreviewShell` + `useDraftBroadcast`/`useDraftListener` + `/preview` branches.
- **Native forms to replace `/admin` bounces:** Leadership (bespoke CRUD form), Annual Reports
  (`ReportForm` + PDF/cover upload), Statutory Notices (Tiptap `bodyHtml`), Forex (create/delete/active),
  News/MediaCoverage (whole `/studio/news` surface).
- **Footer editor:** columns array (add/remove/reorder) + editors for the new banner/about/branches/
  legal/developer fields, all bound to the live preview. Fold Settings (contact/social/app) into the
  same preview shell.
- **In-studio delete** across Blog, Press, Careers, Tenders, Branches, FAQs, Auctions, Forex, Agents;
  revisit `delete: isAdmin` for section editors.
- **Consumer wiring (code only):** interest-rates, service-fees, branches fields, FAQ HTML, whistleblower
  evidence, `/investors` page.
- **New product editors:** `/studio/products`, `/studio/loans`, `/studio/digital-channels`,
  `/studio/ussd-services`, `/studio/applications` (inbox).
- **Housekeeping:** remove dead `homepage` prop from SettingsHub; resolve dead `NavbarV2.tsx` /
  `home-2` / orphaned home components; fix leadership photo-URL resolution in `src/lib/leadership.ts`.

---

## 6. Phased roadmap

Each phase is independently shippable and ordered by (priority × ROI × risk).

**Phase 0 — Live-preview foundation + Footer + Teams + Settings** *(the stated priority)*
Build `LivePreviewShell` + postMessage bridge + `/preview/footer` & `/preview/leadership`. Refactor
`Footer.tsx → FooterView`. Add footer schema (§4B) + columns editor. Teams: bespoke in-studio CRUD +
reorder + photo fix + intro/highlight fields + live `LeadershipGrid` preview. Fold Settings into the
shell. **This proves the pattern the rest of the roadmap reuses.**

**Phase 1 — Dead-editor wiring & render bugs** *(cheap, high-value, ~zero schema)*
Everything in §4A: mount EmergencyBanner, wire interest-rates + service-fees, fix FAQ HTML, Branches
fields, Press mediaContact, Whistleblower evidence, wire Header global → Navbar (mega-menu editor may
defer to Phase 2).

**Phase 2 — CRUD completeness & /admin de-bounce**
In-studio delete everywhere; native forms for Annual Reports, Statutory Notices, Forex-create,
News/MediaCoverage; build the `/investors` public page; mega-menu tree editor.

**Phase 3 — Product catalog collections** *(data-integrity + dedup)*
`loan-products` (unify page + calculator), `account-products` (dedup 3×, open-account selector),
`digital-channels`, `ussd-services`. Wire public pages.

**Phase 4 — Applications inbox**
Persist open-account + wakala submissions; `/studio/applications` triage inbox.

**Phase 5 — Block-builder maturity + hardcoded marketing → blocks**
Finish stub renderers, image pickers, media unification, 4 new blocks, `(main)/[slug]` live route;
convert Home + About-Us + bespoke marketing pages to block docs. Largest, last.

---

## 7. Operational gate (applies to every phase with schema changes)

Because `push:false` and the Neon DB is shared with production, each phase that adds fields must:
1. Add the fields to the Payload config (collection/global).
2. Generate reviewable SQL for the additive change.
3. **Hand the SQL to the repo owner to apply to Neon** (only they hold credentials) in a controlled
   window. All additive/nullable → existing rows unaffected; the public site keeps using hardcoded
   fallbacks until the columns exist, so nothing breaks mid-migration.

---

## 8. Open decisions (defaulted; flip if desired)
1. Footer branches = curated array on the `footer` global (not wired to the Branches directory).
2. Explicit **Save** over keystroke autosave for structured content.
3. About-Us & bespoke marketing → the **block-builder** (Phase 5) rather than per-page globals,
   once the block set is mature.
