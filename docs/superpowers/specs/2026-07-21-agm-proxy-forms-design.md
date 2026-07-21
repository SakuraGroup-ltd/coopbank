# AGM Proxy Form Downloads — Design

**Date:** 2026-07-21
**Branch:** spike/payload-3
**Status:** Approved design, pending spec review

## Goal

The Second AGM notice (`/press/notice-second-agm-2026`, added in the
[AGM announcement card work](2026-07-17-agm-announcement-card-design.md)) tells
shareholders to submit a signed proxy form by 27 July 2026, 16:00 — but the
site has no way to serve that form. Two signed PDFs exist (English +
Kiswahili). Shareholders need to download either from the notice page before
the deadline.

The `press-releases` collection currently supports exactly one PDF
(`document`, rendered as a single "Download official PDF" button). This adds
support for **multiple, labelled** downloadable attachments per release —
generic enough to reuse for future notices (dividend notices, AGM #3), not a
one-off proxy-form field.

## Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Field shape | New `attachments` array field (label + upload) on `PressReleases` | Mirrors the existing `WhistleblowerReports.evidence` array (`file` upload + text field) — an established pattern in this codebase, not a new idiom. Reusable for any future release needing more than one download. |
| Relationship to `document` | Additive — `document` stays as-is (the official notice PDF); `attachments` is a separate, optional list | No migration of existing data; zero risk to the one release that already has a `document` set. |
| Database | Hand-write DDL for `press_releases_attachments`, verified against **live read-only introspection** before drafting, applied only after explicit go-ahead | This repo's Postgres schema on Neon is hand-managed (`push: false` in `payload.config.ts` — Payload never auto-migrates). `.env.local`'s `DATABASE_URI` points at the live database backing production coopbank.co.tz — there is no separate throwaway dev DB. Mirrors this repo's own migration convention (`docs/superpowers/migrations/*.sql`), which requires introspection first and gates the actual apply as a distinct step. |
| Content upload | One-off script via Payload local API (`getPayload({ config })`), mirroring `scripts/seed-assets.ts` | Uploads the two PDFs from `~/Downloads` as Media, appends them to the existing `notice-second-agm-2026` press release's new `attachments` field, by slug. Idempotent-ish: re-running should not duplicate (match on label + release). |
| Rendering | Reuse the existing "Download official PDF" button style in `press/[slug]/page.tsx`, one button per attachment, below the `document` button | Visual consistency; no new component needed for two buttons. |

## Part A — Schema Change (code)

`src/payload/collections/PressReleases.ts` — add after the existing `document`
field:

```ts
{
  name: "attachments",
  type: "array",
  labels: { singular: "Attachment", plural: "Attachments" },
  admin: { description: "Extra downloadable documents (proxy forms, appendices). The official notice PDF stays in the field above." },
  fields: [
    { name: "label", type: "text", required: true, admin: { description: 'Button text, e.g. "Proxy Form (English)".' } },
    { name: "file", type: "upload", relationTo: "media", required: true },
  ],
},
```

## Part B — Database Migration

New file: `docs/superpowers/migrations/2026-07-21-press-releases-attachments.sql`.

Before drafting the DDL, run a **read-only** introspection against the live
Neon DB to confirm real column/table shapes (do not assume from the
`showcase_cards` migration alone — that migration is for a top-level
collection, this is an array field on an existing collection with
`versions.drafts` enabled, so both `press_releases_attachments` and
`_press_releases_v_version_attachments` tables are needed, plus the version-table
foreign key):

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name IN ('press_releases', '_press_releases_v', 'payload_locked_documents_rels')
ORDER BY table_name, ordinal_position;

SELECT indexname, indexdef FROM pg_indexes
WHERE tablename IN ('press_releases', '_press_releases_v');
```

Draft DDL shape (to be corrected against the introspection output before
applying), following the `showcase_cards` migration's conventions — array
tables get `_order`/`_parent_id`/`_path`, FK to `media` for the upload,
`ON DELETE CASCADE` from the parent:

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS press_releases_attachments (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying PRIMARY KEY,
  label character varying,
  file_id integer,
  CONSTRAINT press_releases_attachments_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES press_releases(id) ON DELETE CASCADE,
  CONSTRAINT press_releases_attachments_file_id_media_id_fk
    FOREIGN KEY (file_id) REFERENCES media(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS press_releases_attachments_order_idx ON press_releases_attachments (_order);
CREATE INDEX IF NOT EXISTS press_releases_attachments_parent_id_idx ON press_releases_attachments (_parent_id);
CREATE INDEX IF NOT EXISTS press_releases_attachments_file_idx ON press_releases_attachments (file_id);

CREATE TABLE IF NOT EXISTS _press_releases_v_version_attachments (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id serial PRIMARY KEY,
  label character varying,
  file_id integer,
  _uuid character varying,
  CONSTRAINT _press_releases_v_version_attachments_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _press_releases_v(id) ON DELETE CASCADE,
  CONSTRAINT _press_releases_v_version_attachments_file_id_media_id_fk
    FOREIGN KEY (file_id) REFERENCES media(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS _press_releases_v_version_attachments_order_idx ON _press_releases_v_version_attachments (_order);
CREATE INDEX IF NOT EXISTS _press_releases_v_version_attachments_parent_id_idx ON _press_releases_v_version_attachments (_parent_id);
CREATE INDEX IF NOT EXISTS _press_releases_v_version_attachments_file_idx ON _press_releases_v_version_attachments (file_id);

COMMIT;
```

**Gate:** this SQL is shown to the user for explicit approval before it is
run against the live database. This is a separate approval from the design
approval above.

## Part C — Upload Script

New file: `scripts/seed-agm-proxy-forms.ts`, modeled on `scripts/seed-assets.ts`:

1. Read the two PDFs from `~/Downloads` (paths supplied by the user).
2. Upload each as a `media` doc via `payload.create({ collection: "media", ... })`.
3. Find the `press-releases` doc where `slug = "notice-second-agm-2026"`.
4. Append two entries to its `attachments` array: `{ label: "Proxy Form (English)", file: <media id> }` and `{ label: "Fomu ya Uwakilishi (Kiswahili)", file: <media id> }`.
5. Update the doc via `payload.update(...)`.
6. Guard against duplicate runs: skip appending an attachment whose `label` already exists on the doc.

Run once, manually, against `.env.local` (the live DB) after the migration is
applied and the code is deployed (or at least schema-present) — Payload will
500 on writes to a field whose table doesn't exist yet.

## Part D — Rendering

`src/app/(main)/press/[slug]/page.tsx`:
- Extend the `Release` type with `attachments?: { label: string; file?: { url?: string } }[]`.
- After the existing `document.url` button block, map over `attachments` and
  render one button per entry, same style, using `label` as the button text
  instead of the hardcoded "Download official PDF".

## Risks / Out of Scope

- **Production database.** This is the one part of the change with real
  blast radius — a bad migration on a live bank site's DB is not a "just
  redeploy" fix. Mitigated by: introspect-before-draft, explicit gate before
  apply, `IF NOT EXISTS`/`BEGIN`/`COMMIT` throughout, additive-only (no
  `ALTER`/`DROP` on existing columns).
- Not building a generic multi-file uploader UI in Studio beyond what
  Payload's array field already provides out of the box.
- Not localizing the rest of the site (`html lang="en"` stays as-is, per the
  original AGM card spec) — only the attachment *labels* are bilingual.
- Not touching the existing `document` field or its rendering.

## Testing

- Local: run `npm run dev`, confirm the press release page renders both new
  buttons and both PDFs download correctly, before touching the live DB.
- After migration + script run against the live DB: verify in `/studio` that
  the `notice-second-agm-2026` release shows both attachments, and check the
  live page in a browser.
