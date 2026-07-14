# Pages-as-Blocks Phase 1 — Home, About, Contact

**Date:** 2026-07-14
**Status:** Approved by Jumbe (architecture + contact-form handling)

## Goal

Move the site's key pages into the Elementor-style CMS model that already
half-exists in this repo: every page is a Pages-collection doc composed of
stacked blocks, edited in the `/studio/pages` composer, rendered on the live
site through the block renderer. Shared elements (header/nav, footer,
emergency banner) stay as globals with their existing editors — the WordPress
split.

Phase 1 covers **Home, About Us, and a new Contact Us page**. Later phases
migrate the remaining marketing pages onto the same system.

## What already exists (reuse, don't rebuild)

- `Pages` collection (`src/payload/collections/Pages.ts`) — drafts/versions,
  slug, SEO group, `layout: blocks`.
- Block library `src/payload/blocks/` — hero, media-slider, product-carousel,
  product-grid, image-text, rich-text, stats, faq, cta-strip, featured-news.
- Studio composer `src/components/studio/pages/` — `PageComposer` (stack,
  reorder, add, delete, save via Payload REST), `BlockPicker`, `BlockEditor`
  (per-block mini-forms).
- Preview: `BlockRenderer` (`src/components/preview/BlockRenderer.tsx`) +
  `/preview/[...slug]` catch-all.
- Media upload to GCS via `POST /api/media` (used by showcase editor).
- Scheme-guard pattern for editor-saved hrefs (commit `069e092`).
- Mailer `src/lib/mailer.ts` — SMTP2GO HTTP API primary, SMTP/Resend fallback.
- `SiteSettings` global with `contact` group (phone, email, addresses).

## The gaps this phase closes

1. **No public route renders Pages docs.** Live Home (`/`) and About
   (`/about-us`) are hardcoded React components; Pages docs are reachable only
   under `/preview/`.
2. **Block library doesn't cover the real designs.** No block corresponds to
   the animated hero slider, quick links, CoopPesa promo, services grid, or
   any About/Contact section.
3. **BlockRenderer renders simplified generic markup**, not the polished
   framer-motion components — composing Home from today's blocks would look
   like a wireframe.

## Design

### 1. Section components become parameterized block views

Each live section component is refactored to accept its content as props with
today's hardcoded content as the default value. Visual output is unchanged
when props are absent.

Home (`src/components/home/`):
- `Hero.tsx` → props: `slides[]` (image, tagline, headline, desc, cta1, cta2).
- `QuickLinks.tsx` → props: `links[]` (icon, label, href, desc).
- `MobileBanking.tsx` → props: headline, copy, features, store URLs, screenshot images.
- `ServicesGrid.tsx` → props: heading, `services[]` (title, desc, href, image/icon).

About (`src/app/(main)/about-us/page.tsx`, currently one 442-line client
component) is split into section components under `src/components/about/`:
- `AboutPageHeader` (hero band: eyebrow, title, intro, image)
- `BankPrayer` (title, prayer text)
- `OurStory` (heading, rich text paragraphs, image, stat callouts)
- `BranchNetwork` (heading, copy, highlights, CTA to /branches)
- `JourneyTimeline` (milestones[]: year, title, desc)
- `MissionVision` (mission text, vision text)
- `CoreValues` (values[]: icon, name, desc)

Contact (new, `src/components/contact/`):
- `ContactDetails` (phones, emails, HQ address, working hours)
- `ContactForm` (client form; name, email, phone, subject, message + Turnstile-free basic honeypot)
- `ContactMap` (embedded map URL or coordinates)

Icon fields (quick links, core values, services) are a `select` from a curated
lucide icon list — same approach as existing studio editors — not free text.

### 2. New block schemas, 1:1 with the sections

New files in `src/payload/blocks/`, registered in `allBlocks` (`index.ts`):

| Block slug | Renders | Used on |
|---|---|---|
| `hero-slider` | Hero | Home |
| `quick-links` | QuickLinks | Home |
| `app-promo` | MobileBanking | Home |
| `services-grid` | ServicesGrid | Home |
| `page-header` | AboutPageHeader | About, Contact |
| `bank-prayer` | BankPrayer | About |
| `story` | OurStory | About |
| `branch-network` | BranchNetwork | About |
| `journey-timeline` | JourneyTimeline | About |
| `mission-vision` | MissionVision | About |
| `core-values` | CoreValues | About |
| `contact-details` | ContactDetails | Contact |
| `contact-form` | ContactForm | Contact |
| `contact-map` | ContactMap | Contact |

Existing generic blocks stay available in the picker for future pages.

Field conventions (match existing blocks/editors):
- Images: `upload` relation to `media` (GCS), uploaded from the studio via
  `POST /api/media`.
- Every href/URL field is scheme-guarded in the editor UI **and** sanitized at
  render (reuse the guard from commit `069e092`).
- Arrays capped with sensible `maxRows` (slides ≤ 6, quick links ≤ 8,
  values ≤ 8, milestones ≤ 12).

### 3. Composer + renderer wiring

- `BlockPicker`/`BLOCK_LABEL`: add the 14 new blocks, grouped by category
  (Home, About, Contact, Generic) so the picker stays navigable.
- `BlockEditor`: a mini-form per new block — text/textarea/href/image-upload/
  array-row controls, following the existing editor components in
  `src/components/studio/`.
- `BlockRenderer`: new block types delegate to the **real** section
  components (dynamic-import the framer-motion client components), so studio
  preview and the live page are identical. Existing generic block renderers
  are untouched.

### 4. Public routes read from Pages

- `/` (`src/app/(main)/page.tsx`): fetch Pages doc `slug=home` (published).
  If found → render `layout` through BlockRenderer (ForexTicker and
  ProductsCarousel remain their own CMS-driven components, inserted via the
  existing `product-carousel` block and a thin `forex-ticker` block wrapper —
  data still comes from their own collections, the block is just placement).
  If not found → render today's hardcoded composition (fallback).
- `/about-us`: same pattern with `slug=about-us`. Board/management subpages
  are untouched (leadership already CMS-driven).
- `/contact-us` (new): same pattern with `slug=contact-us`; fallback is the
  seeded default composition. Navbar “Contact Us” links (2 places in
  `Navbar.tsx`) repoint from `/about-us#contact` to `/contact-us`.
- Catch-all `src/app/(main)/[slug]/page.tsx`: renders any *other* published
  Pages doc at `/<slug>` so marketing can ship new pages without a deploy.
  Reserved-slug guard: a static list of existing route segments (about-us,
  branches, careers, news, press, tenders, treasury, faqs, whistleblower,
  digital-banking, personal-banking, loan-products, open-account,
  bank-charges, blog, home-2, preview, studio, api …) returns 404 from the
  catch-all so it can never shadow a real route. Sets page SEO metadata from
  the doc's `seo` group.
- All these routes stay `force-dynamic` (consistent with the rest of the app;
  no ISR surprises behind Cloud Run).

### 5. Seeding

A seed script (`scripts/seed-pages.ts`, run once manually) creates the three
Pages docs — `home`, `about-us`, `contact-us` — with layouts built from the
current hardcoded content, created directly in **published** status so the
live site swaps from fallback to CMS with identical output.
Seed is idempotent: skips any slug that already exists.

### 6. Contact form backend

- New collection `ContactMessages` (`src/payload/collections/ContactMessages.ts`):
  name, email, phone, subject, message, status (new/read/handled), createdAt.
  Access: create via the public API route only; read/update studio users;
  delete admin. No public read.
- API route `POST /api/contact` (public, in middleware allowlist if needed):
  validates + rate-limits (per-IP, in-memory like existing routes), honeypot
  field check, saves to `ContactMessages`, then emails a notification via
  `lib/mailer.ts` to `SiteSettings.contact.contactFormEmail` (new field,
  default `info@cbtbank.co.tz`). Mail failure does not fail the request —
  the message is already stored.
- Studio: `/studio/messages` list view (read + mark handled), added to the
  studio sidebar. Mirrors the whistleblower studio view's structure, minus
  the evidence handling.

> Note: verify the SMTP2GO sending domain still covers this FROM address at
> implementation time — recent mail work retired/changed domain setups.

### 7. Out of scope for phase 1

- Migrating other pages (personal-banking, digital-banking, treasury, …) —
  later phases, same pattern.
- home-2 (`/home-2`, V2 components) — untouched.
- Drag-drop visual canvas editing (Elementor's inline canvas) — the composer
  remains a stacked-panel editor with live preview.
- Deleting the hardcoded fallbacks — they stay as safety nets this phase.

## Error handling

- Pages fetch failure (DB down) → fallback hardcoded composition; never a 500
  on the homepage.
- Unknown block type in a layout → existing `FallbackRender` warning box in
  preview; on the live site it renders nothing (silently skipped).
- Contact form: client-side validation + server-side revalidation; 429 on
  rate-limit; generic success message (no enumeration of mail success).

## Testing

- `npm run build` green (typecheck).
- Studio: compose/save each new block type; image upload to GCS; reorder;
  draft vs publish.
- Public: `/`, `/about-us`, `/contact-us` render CMS content when seeded and
  fallback when the doc is absent (verify by slug rename in dev).
- Catch-all: new doc at `/test-page` renders; reserved slug (e.g. `branches`)
  404s from catch-all and still serves the real route.
- Contact form: submit → row in ContactMessages + email received; honeypot
  and rate-limit paths.
- XSS: attempt `javascript:` href in each editor URL field — rejected at save
  and inert at render.
