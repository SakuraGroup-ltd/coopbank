# AGM Announcement Card + Press Release — Design

**Date:** 2026-07-17
**Branch:** spike/payload-3
**Status:** Approved design, pending spec review

## Goal

Announce the Second Annual General Meeting on the CoopBank public site in a way
that is **noticeable to shareholders but ignorable to the retail-banking
majority**. A polite bottom-right slide-in card, driven from the CMS, that links
to a full press release. It appears as soon as it is switched on and
**auto-hides after the AGM day ends** — no human cleanup and no invented dates.
The one date the admin enters is the real event date from the notice.

The AGM is Friday 31 July 2026, 08:00, Mabeyo Social Hall, Dodoma. That event
date is the only date driving the card; after it passes, the card comes down.

## Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Surface | Bottom-right slide-in card | Popup impact without blocking the retail majority; the Swahili poster is the click driver. |
| Data source | CMS-driven, reusable | `announcementCard` group on `SiteSettings`, mirroring the existing `emergencyBanner`. Reusable for AGM #3, dividend notices. No deploy to change. |
| Press release language | English notice + Swahili poster | Site is English-primary (no i18n framework, `html lang="en"`). Legal text stays verbatim as signed. |
| Dismissal | Forever, until the AGM day passes | `localStorage`, keyed to the announcement identity so a future card gets a clean slate. |
| Date model | One admin-entered event date | The AGM date is a fact from the notice, not a value the developer invents. Card shows while active and auto-hides after that day. |
| Date evaluation | Server-side, EAT (UTC+3) | Avoids browser-timezone drift showing/hiding the card early or late. |

## Part A — Press Release (content only, NO code)

The existing `/press/[slug]` template (`src/app/(main)/press/[slug]/page.tsx`)
already renders everything needed:
- `summary` — lede
- `bodyHtml` — full notice, readable inline
- `document.url` — optional "Download official PDF" button
- `mediaContact` — Company Secretary contact block

**Action:** create one `press-releases` document in `/studio`:

| Field | Value |
|---|---|
| headline | Notice of the Second Annual General Meeting |
| slug | `notice-second-agm-2026` |
| category | `agm` (AGM / Dividend) |
| releaseDate | 2026-07-06 (date the Company Secretary signed) |
| lead image | Swahili AGM poster (uploaded to Media → GCS) |
| summary | One-paragraph lede: date, venue, time, who it's for |
| bodyHtml | Full English notice: agenda items 1–12, all six NOTES verbatim |
| document | Official notice as PDF (optional download) |
| mediaContact | Company Secretary, +255 23 241 0093 / 0784 694 212 / 0754 649 372 / 0677 081 211, cs_office@cbtbank.co.tz |

**Content assets required:**
1. Swahili poster JPG (`PHOTO-2026-07-17-16-24-39.jpg`) → upload to Media.
2. PDF of the notice (convert the supplied `.doc`, or use an official signed PDF).

**Body source verbatim (from the signed notice):**
- Agenda: 12 items (Reading of Notice → Closing of the Meeting).
- Notes: registration 25–31 July (closes 07:30 on the 31st); proposals by
  25 July 16:00; documents available from 25 July at branches/website/email;
  proxy form by 27 July 16:00; one representative per institution; attendees
  cover own transport/accommodation.

## Part B — CMS Field Group: `announcementCard`

Added to `SiteSettings` (`src/payload/globals/SiteSettings.ts`), mirroring the
`emergencyBanner` group so studio users see a familiar shape. All fields after
`active` use `admin.condition` to hide until active.

```
announcementCard (group)
  active     checkbox            default false
  eventDate  date  (dayAndTime)  ← the AGM date, entered by the admin (2026-07-31)
  image      upload → media       ← poster
  eyebrow    text                 ← "Tangazo" / "Announcement"
  title      text                 ← "Mkutano Mkuu wa Pili wa Wanahisa"
  subtitle   text                 ← "31 Julai 2026 · Mabeyo Social Hall, Dodoma"
  ctaLabel   text                 ← "Soma Taarifa Kamili"
  ctaHref    text                 ← "/press/notice-second-agm-2026"
```

Field-level notes:
- `eventDate` is the real event date from the notice — the developer does not
  hardcode any date. The card shows while `active` and hides once this day has
  passed. There is no separate start date: the card goes up when the admin turns
  `active` on and comes down after the event day.
- `eventDate` is treated as inclusive through 23:59:59 EAT of that calendar day,
  so the card stays up for the whole of AGM day and disappears the next morning.
- `image` is an `upload` relationship to the `media` collection (resolved at
  `depth: 1`).
- `admin.description` on `eventDate`: "The date of the event being announced. The
  card automatically comes down after this day."
- Only `active` shows unconditionally; the rest gate on `active` like the banner.

## Part C — Components

Server + client split so the card ships **zero client JS when not showing**.

### `AnnouncementCard.tsx` (server component)
Location: `src/components/layout/AnnouncementCard.tsx`. Mirrors
`EmergencyBanner.tsx`.
- Reads `site-settings` global at `depth: 1` (resolves the image URL).
- On any error → returns `null` (a DB hiccup must never break the shell).
- Evaluates the window server-side in EAT: compute "now in UTC+3", render only
  when `active && now ≤ eventDate` (inclusive to 23:59:59 EAT of the event day).
  There is no start check — `active` being on is the start.
- Inactive / past the event day / no image / no title / no eventDate → `null`.
- When open, passes plain serializable props (image url + alt, eyebrow, title,
  subtitle, ctaLabel, ctaHref, and a stable `dismissKey`) to the client child.
- `dismissKey` = a short hash of `title + eventDate`, so re-using the group for a
  future announcement produces a new key and a clean slate.

### `AnnouncementCardClient.tsx` (client component)
Location: `src/components/layout/AnnouncementCardClient.tsx`. `"use client"`.
- On mount: if `localStorage["coopbank-announcement-dismissed"] === dismissKey`,
  render nothing.
- Else: mount hidden, then slide in from bottom-right after ~1.2s.
  `prefers-reduced-motion` → appear with no slide.
- Layout: poster thumbnail (left), eyebrow + title + subtitle (right), CTA
  button, dismiss `X` (top-right). Container `fixed bottom-6 right-6 z-40`,
  `max-w-[360px]`, `w-[calc(100vw-2rem)]` cap on mobile. Bottom-left chat widget
  (`bottom-16 left-4 z-50`) is clear — no collision.
- Brand: white card, `#0F3D7A`/`#1A56A0` accents, `next/image` for the poster.
- `X` → write `dismissKey` to localStorage, animate out, unmount.
- CTA → `next/link` to `ctaHref`.

### Wiring
Add `<AnnouncementCard />` to `src/app/(main)/layout.tsx` beside `<ChatWidget />`
(inside `<body>`). Position in the DOM is irrelevant — the card is `fixed`.

## Error Handling
- Global read failure → server component returns `null`; page shell unaffected.
- Missing image or title → `null` (nothing half-rendered).
- localStorage unavailable (privacy mode) → treat as "not dismissed"; the card
  shows and the `X` is a no-op-persistence dismiss for that session.
- Window math is fail-safe: an admin who sets `active` with no `eventDate` is
  treated as **not in window** (eventDate required to show), preventing an
  accidental permanent card that never comes down.

## Testing / Verification
1. Set `active` + `eventDate` = 2026-07-31 → card slides in bottom-right ~1.2s.
2. Click CTA → lands on `/press/notice-second-agm-2026`, notice readable inline,
   PDF download present.
3. Dismiss → reload → card stays gone. New tab/session → still gone.
4. Set `eventDate` to yesterday → card does not render (server returns null,
   confirm zero announcement JS in the network tab).
5. Set `active` on but leave `eventDate` empty → card does not render (fail-safe).
6. Change `title` (simulating a future announcement) → previously-dismissed
   user sees the new card (new dismissKey).
7. Mobile ≤375px → card fits within viewport, no horizontal scroll, doesn't
   cover the chat widget.
8. `prefers-reduced-motion` → card appears without slide.
9. DB/global read error path → page still renders, no card, no crash.

## Out of Scope (flagged, not built)
- **Meeting documents + proxy form** the notice promises on the website from
  25 July (proxy deadline 27 July 16:00). Separate deliverable, own timeline.
- Any Swahili translation of the notice body (English body + Swahili poster
  is the decision).
- Touching or extending the existing `emergencyBanner`.

## Files
- **New:** `src/components/layout/AnnouncementCard.tsx`
- **New:** `src/components/layout/AnnouncementCardClient.tsx`
- **Edit:** `src/payload/globals/SiteSettings.ts` (add `announcementCard` group)
- **Edit:** `src/app/(main)/layout.tsx` (render `<AnnouncementCard />`)
- **Content:** 1 press-releases doc + poster upload + PDF upload (via studio)
