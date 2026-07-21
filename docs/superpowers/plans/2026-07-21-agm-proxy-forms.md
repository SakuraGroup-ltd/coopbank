# AGM Proxy Form Downloads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let shareholders download the English and Kiswahili AGM proxy forms from `/press/notice-second-agm-2026`, via a new generic `attachments` field on `press-releases`.

**Architecture:** Additive Postgres migration on the live Neon DB creates the array-field child tables; a new `attachments` field is added to the `PressReleases` Payload collection; the press release page template renders one download button per attachment; a one-off script uploads the two PDFs as Media and links them to the existing AGM notice document.

**Tech Stack:** Next.js 15 (App Router), Payload CMS 3.85 (`@payloadcms/db-postgres`, `@payloadcms/storage-gcs`), Neon Postgres, `pg` (raw driver, already in `node_modules` transitively), TypeScript, `tsx` for script execution.

## Global Constraints

- Postgres schema on Neon is **hand-managed** — `payload.config.ts` sets `push: false`. No field is usable until its backing table/column exists in the DB.
- `.env.local`'s `DATABASE_URI` points at the **live database backing production coopbank.co.tz**. There is no separate dev DB — every DB-touching step in this plan affects the real system.
- Migrations are additive only: `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`. Never `ALTER`/`DROP` an existing column.
- No test framework exists in this repo (`package.json` has no `test` script). Verification is: `npx tsc --noEmit` for type-checking, `npm run lint` for style, and manual behavioral checks (script console output, browser check) — matching how this codebase's own `scripts/seed-*.ts` files are verified.
- Scripts that load Payload use the existing bootstrap: `node --require ./scripts/_bootstrap-payload.cjs --import tsx ./scripts/<name>.ts` (loads `.env.local` via `dotenv`, patches `@next/env`).
- Two steps in this plan write to the live database (migration apply, content upload) and are marked **GATE** — do not run them without the user explicitly confirming that specific step, separate from having approved this plan overall.
- Source PDFs (already on disk, confirmed to exist):
  - `/Users/jumbenylon/Downloads/PROXY  FORM (english).pdf` (note: double space before "FORM")
  - `/Users/jumbenylon/Downloads/PROXY FORM (KISWAHILI).pdf`

---

### Task 1: Read-only introspection of the live schema

**Files:**
- Create (temporary, not committed): `Cooperative Bank/scripts/_tmp-introspect.cjs`

**Interfaces:**
- Produces: console output of real column/index shapes for `press_releases`, `_press_releases_v`, `payload_locked_documents_rels` — consumed by Task 2 to finalize the migration DDL.

- [ ] **Step 1: Write the introspection script**

```js
// scripts/_tmp-introspect.cjs
// Throwaway: read-only introspection for the press_releases attachments
// migration. Delete after use — do not commit.
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });
const { Client } = require("pg");

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URI });
  await client.connect();

  const cols = await client.query(`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name IN ('press_releases', '_press_releases_v', 'payload_locked_documents_rels')
    ORDER BY table_name, ordinal_position
  `);
  console.log("=== COLUMNS ===");
  for (const row of cols.rows) console.log(row);

  const idx = await client.query(`
    SELECT tablename, indexname, indexdef FROM pg_indexes
    WHERE tablename IN ('press_releases', '_press_releases_v')
  `);
  console.log("=== INDEXES ===");
  for (const row of idx.rows) console.log(row);

  await client.end();
}

main().catch((e) => {
  console.error("[introspect] FAILED:", e);
  process.exit(1);
});
```

- [ ] **Step 2: Run it**

Run: `cd "Cooperative Bank" && node scripts/_tmp-introspect.cjs`

Expected: two sections of output — `=== COLUMNS ===` listing rows for all three tables (confirms `press_releases.id` type — `serial`/`integer` — and confirms `_press_releases_v` and `payload_locked_documents_rels` exist with the shape assumed in Task 2's draft DDL), and `=== INDEXES ===` listing existing index names on those tables (so new index names in Task 2 don't collide).

- [ ] **Step 3: Delete the throwaway script**

Run: `rm scripts/_tmp-introspect.cjs`

Do not `git add` this file at any point.

---

### Task 2: Finalize the migration SQL

**Files:**
- Create: `Cooperative Bank/docs/superpowers/migrations/2026-07-21-press-releases-attachments.sql`

**Interfaces:**
- Consumes: Task 1's introspection output.
- Produces: `press_releases_attachments` and `_press_releases_v_attachments` tables — consumed by Task 4 (the Payload field will read/write these tables) and Task 7 (the upload script writes rows here indirectly via Payload's local API).

- [ ] **Step 1: Reconcile the draft below against Task 1's output**

Starting draft (mirrors the existing `docs/superpowers/migrations/2026-07-13-showcase-cards.sql` array/FK conventions, adapted for an array field with a `versions.drafts` parent):

```sql
-- Additive migration: attachments array field on press-releases.
-- Apply manually to Neon (push:false). Conventions mirrored from the
-- showcase_cards migration (array table + FK to media) and adapted for a
-- collection with versions.drafts enabled, which needs a matching
-- _press_releases_v_attachments table. Verified via read-only
-- introspection 2026-07-21 (docs/superpowers/plans/2026-07-21-agm-proxy-forms.md, Task 1).

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

CREATE TABLE IF NOT EXISTS _press_releases_v_attachments (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id serial PRIMARY KEY,
  label character varying,
  file_id integer,
  _uuid character varying,
  CONSTRAINT _press_releases_v_attachments_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _press_releases_v(id) ON DELETE CASCADE,
  CONSTRAINT _press_releases_v_attachments_file_id_media_id_fk
    FOREIGN KEY (file_id) REFERENCES media(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS _press_releases_v_attachments_order_idx ON _press_releases_v_attachments (_order);
CREATE INDEX IF NOT EXISTS _press_releases_v_attachments_parent_id_idx ON _press_releases_v_attachments (_parent_id);
CREATE INDEX IF NOT EXISTS _press_releases_v_attachments_file_idx ON _press_releases_v_attachments (file_id);

COMMIT;
```

Reconciliation checklist (adjust the draft, then save the final file):
1. Does `press_releases.id` introspect as `integer`/`serial`? If it's something else (e.g. `character varying` for a custom ID field), change `_parent_id integer` to match in both new tables.
2. Does `_press_releases_v` exist with an `id` column? If its type differs from `integer`, adjust `_press_releases_v_attachments._parent_id` to match.
3. Do any of the new index names (`press_releases_attachments_order_idx`, etc.) already exist per Task 1's `=== INDEXES ===` output? If so, rename to avoid collision (append `_2` is fine — Payload doesn't require exact index names, only the columns/constraints it queries against).
4. Confirm `media(id)` and `payload_locked_documents_rels` both exist as referenced (they will — every other collection already depends on them).
5. `press_releases` has `versions: { drafts: true }` enabled. Payload's schema builder suppresses `NOT NULL` on every column of a drafts-enabled collection — including `required: true` fields — confirmed by Task 1's introspection showing `press_releases.headline` (`required: true` in the collection config) as `is_nullable: 'YES'` in the live DB. `label` (`required: true` on the `attachments` field) must therefore be declared `character varying` with no `NOT NULL`, matching `file_id`'s nullability in the same table.

- [ ] **Step 2: Verify payload_locked_documents_rels is NOT included**

**REMOVED (post-review):** The original draft included a Step 2 to add a `press_releases_attachments_id` column to `payload_locked_documents_rels`. This is incorrect — `payload_locked_documents_rels` only tracks top-level collections (entries in Payload's `config.collections` array). Array-field child tables like `press_releases_attachments` never appear there. The correct precedent is `docs/superpowers/migrations/2026-07-14-section-block-tables.sql`, which adds 15 new sub-tables with zero `payload_locked_documents_rels` changes. Step 2 has been removed from the final migration file.

- [ ] **Step 3: Save the final file and review it once more for `IF NOT EXISTS`/`IF EXISTS` on every statement**

File: `docs/superpowers/migrations/2026-07-21-press-releases-attachments.sql`, containing only Step 1's table-creation block inside one `BEGIN ... COMMIT`.

---

### Task 3: GATE — apply the migration to the live database

**Files:**
- Create (temporary, not committed): `Cooperative Bank/scripts/_tmp-apply-migration.cjs`

**Interfaces:**
- Consumes: `docs/superpowers/migrations/2026-07-21-press-releases-attachments.sql` (Task 2).
- Produces: the live tables/column that Task 4's Payload field and Task 7's upload script depend on.

**STOP: before Step 2, show the exact final SQL from Task 2 to the user and get explicit confirmation to run it against the live database. This is separate from the user having approved this plan — do not proceed on plan-approval alone.**

- [ ] **Step 1: Write the runner**

```js
// scripts/_tmp-apply-migration.cjs
// Throwaway: applies docs/superpowers/migrations/2026-07-21-press-releases-attachments.sql
// to the live DB. Delete after use — do not commit.
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });
const fs = require("fs");
const { Client } = require("pg");

const sql = fs.readFileSync(
  "docs/superpowers/migrations/2026-07-21-press-releases-attachments.sql",
  "utf8"
);

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URI });
  await client.connect();
  try {
    await client.query(sql);
    console.log("[migration] applied successfully");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("[migration] FAILED:", e);
  process.exit(1);
});
```

- [ ] **Step 2: Run it (after explicit user confirmation per the STOP above)**

Run: `cd "Cooperative Bank" && node scripts/_tmp-apply-migration.cjs`

Expected: `[migration] applied successfully`. If it fails, the transaction rolled back (nothing partially applied) — read the Postgres error, fix the SQL file, re-run.

- [ ] **Step 3: Verify the tables exist**

Run: `node scripts/_tmp-introspect.cjs` is already deleted — instead verify inline:

```bash
node -e "
const dotenv = require('dotenv'); dotenv.config({ path: '.env.local' });
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URI });
  await c.connect();
  const r = await c.query(\"SELECT table_name FROM information_schema.tables WHERE table_name IN ('press_releases_attachments', '_press_releases_v_attachments')\");
  console.log(r.rows);
  await c.end();
})();
"
```

Expected: both table names listed.

- [ ] **Step 4: Delete the throwaway runner**

Run: `rm scripts/_tmp-apply-migration.cjs`

---

### Task 4: Add the `attachments` field to `PressReleases`

**Files:**
- Modify: `Cooperative Bank/src/payload/collections/PressReleases.ts`

**Interfaces:**
- Consumes: `press_releases_attachments` table (Task 3).
- Produces: `attachments?: { label: string; file: string | number }[]` on press-releases documents — consumed by Task 5 (page rendering) and Task 6 (upload script).

- [ ] **Step 1: Add the field**

In `src/payload/collections/PressReleases.ts`, insert immediately after the existing `document` field (which currently reads):

```ts
    {
      name: "document",
      type: "upload",
      relationTo: "media",
      admin: { description: "Official press release PDF, where applicable." },
    },
```

add:

```ts
    {
      name: "attachments",
      type: "array",
      labels: { singular: "Attachment", plural: "Attachments" },
      admin: {
        description:
          "Extra downloadable documents (proxy forms, appendices). The official notice PDF stays in the field above.",
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          admin: { description: 'Button text, e.g. "Proxy Form (English)".' },
        },
        { name: "file", type: "upload", relationTo: "media", required: true },
      ],
    },
```

- [ ] **Step 2: Type-check**

Run: `cd "Cooperative Bank" && npx tsc --noEmit`

Expected: no new errors referencing `PressReleases.ts`.

- [ ] **Step 3: Commit**

```bash
cd "Cooperative Bank"
git add src/payload/collections/PressReleases.ts docs/superpowers/migrations/2026-07-21-press-releases-attachments.sql
git commit -m "feat(press): add attachments field to press releases

Generic label+file array, reusable beyond the AGM proxy forms.
Migration applied by hand to Neon (push:false) — see the file for
the introspection-verified DDL."
```

---

### Task 5: Render attachment buttons on the press release page

**Files:**
- Modify: `Cooperative Bank/src/app/(main)/press/[slug]/page.tsx:1-140`

**Interfaces:**
- Consumes: `attachments?: { label: string; file?: { url?: string } }[]` (Task 4).

- [ ] **Step 1: Extend the `Release` type**

Current type (near the top of the file):

```ts
type Release = {
  id: string | number;
  headline: string;
  slug: string;
  releaseDate?: string;
  category?: string;
  summary?: string;
  bodyHtml?: string;
  document?: { url?: string; filename?: string };
  mediaContact?: { name?: string; email?: string; phone?: string };
};
```

Change to:

```ts
type Release = {
  id: string | number;
  headline: string;
  slug: string;
  releaseDate?: string;
  category?: string;
  summary?: string;
  bodyHtml?: string;
  document?: { url?: string; filename?: string };
  attachments?: { label: string; file?: { url?: string } }[];
  mediaContact?: { name?: string; email?: string; phone?: string };
};
```

- [ ] **Step 2: Render one button per attachment**

Current block:

```tsx
        {r.document?.url && (
          <a
            href={r.document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-8 px-5 py-3 rounded-lg bg-[#1A56A0] text-white text-sm font-semibold hover:bg-[#0F3D7A] transition-colors"
          >
            <FileText className="w-4 h-4" />
            Download official PDF
          </a>
        )}
```

Change to:

```tsx
        {r.document?.url && (
          <a
            href={r.document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-8 px-5 py-3 rounded-lg bg-[#1A56A0] text-white text-sm font-semibold hover:bg-[#0F3D7A] transition-colors"
          >
            <FileText className="w-4 h-4" />
            Download official PDF
          </a>
        )}

        {r.attachments && r.attachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {r.attachments
              .filter((a) => a.file?.url)
              .map((a, i) => (
                <a
                  key={i}
                  href={a.file!.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#1A56A0] text-white text-sm font-semibold hover:bg-[#0F3D7A] transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {a.label}
                </a>
              ))}
          </div>
        )}
```

- [ ] **Step 3: Type-check and lint**

Run: `cd "Cooperative Bank" && npx tsc --noEmit && npm run lint`

Expected: no new errors in `press/[slug]/page.tsx`.

- [ ] **Step 4: Commit**

```bash
cd "Cooperative Bank"
git add "src/app/(main)/press/[slug]/page.tsx"
git commit -m "feat(press): render attachment download buttons on press release page"
```

---

### Task 6: Write the upload script

**Files:**
- Create: `Cooperative Bank/scripts/seed-agm-proxy-forms.ts`
- Modify: `Cooperative Bank/package.json` (add script entry)

**Interfaces:**
- Consumes: `payload.find`/`payload.create`/`payload.update` local API (Task 4's `attachments` field), the two PDF paths (Global Constraints).
- Produces: two `media` docs + an updated `press-releases` doc (slug `notice-second-agm-2026`) with two `attachments` entries — consumed by Task 5's rendering and Task 8's verification.

- [ ] **Step 1: Write the script**

```ts
/**
 * One-off: upload the two AGM proxy form PDFs and attach them to the
 * "Notice of the Second AGM" press release (slug: notice-second-agm-2026).
 *
 * Idempotent on attachment label: re-running skips labels already present.
 *
 * Usage:
 *   npm run seed:agm-proxy-forms
 */
import { getPayload } from "payload";
import config from "../payload.config";
import fs from "node:fs";
import path from "node:path";

const SLUG = "notice-second-agm-2026";

const FORMS = [
  { label: "Proxy Form (English)", path: "/Users/jumbenylon/Downloads/PROXY  FORM (english).pdf" },
  { label: "Fomu ya Uwakilishi (Kiswahili)", path: "/Users/jumbenylon/Downloads/PROXY FORM (KISWAHILI).pdf" },
];

async function main() {
  const payload = await getPayload({ config });

  const found = await payload.find({
    collection: "press-releases",
    where: { slug: { equals: SLUG } },
    limit: 1,
  });
  const release = found.docs[0] as { id: string | number; headline: string; attachments?: { label?: string }[] } | undefined;
  if (!release) {
    console.error(`[agm-proxy-forms] no press-releases doc with slug "${SLUG}" — aborting`);
    process.exit(1);
  }

  const existingLabels = new Set(
    (release.attachments || []).map((a) => a.label).filter(Boolean)
  );

  const newAttachments: { label: string; file: string | number }[] = [];

  for (const form of FORMS) {
    if (existingLabels.has(form.label)) {
      console.log(`[agm-proxy-forms] skip "${form.label}" — already attached`);
      continue;
    }
    if (!fs.existsSync(form.path)) {
      console.error(`[agm-proxy-forms] file not found: ${form.path} — aborting`);
      process.exit(1);
    }
    const data = fs.readFileSync(form.path);
    const name = path.basename(form.path);
    const media = await payload.create({
      collection: "media",
      data: { alt: form.label },
      file: { data, mimetype: "application/pdf", name, size: data.length },
    });
    console.log(`[agm-proxy-forms] uploaded "${name}" as media #${media.id}`);
    newAttachments.push({ label: form.label, file: media.id });
  }

  if (newAttachments.length === 0) {
    console.log("[agm-proxy-forms] nothing to do — both forms already attached");
    return;
  }

  await payload.update({
    collection: "press-releases",
    id: release.id,
    data: {
      attachments: [...(release.attachments || []), ...newAttachments],
    },
  });
  console.log(`[agm-proxy-forms] attached ${newAttachments.length} form(s) to "${release.headline}"`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[agm-proxy-forms] failed:", e);
    process.exit(1);
  });
```

- [ ] **Step 2: Add the package.json script entry**

In `package.json`, in the `"scripts"` block, add after `"seed:pages"`:

```json
    "seed:agm-proxy-forms": "node --require ./scripts/_bootstrap-payload.cjs --import tsx ./scripts/seed-agm-proxy-forms.ts"
```

(remember the trailing comma on the preceding `seed:pages` line changes since this is no longer the last entry).

- [ ] **Step 3: Type-check**

Run: `cd "Cooperative Bank" && npx tsc --noEmit`

Expected: no errors referencing `scripts/seed-agm-proxy-forms.ts`.

- [ ] **Step 4: Commit**

```bash
cd "Cooperative Bank"
git add scripts/seed-agm-proxy-forms.ts package.json
git commit -m "feat(scripts): add seed-agm-proxy-forms — uploads and links the two proxy form PDFs"
```

---

### Task 7: GATE — run the upload script against the live database

**Files:** none (execution only)

**Interfaces:**
- Consumes: `scripts/seed-agm-proxy-forms.ts` (Task 6), which requires Task 3's migration to already be applied (the `attachments` field's backing table must exist or `payload.update` will error).

**STOP: confirm with the user before running this — it writes real content (two PDFs + a press release update) to the live production database, visible to real site visitors once this branch's code is deployed.**

- [ ] **Step 1: Run it (after explicit user confirmation per the STOP above)**

Run: `cd "Cooperative Bank" && npm run seed:agm-proxy-forms`

Expected output (first run):
```
[agm-proxy-forms] uploaded "PROXY  FORM (english).pdf" as media #<id>
[agm-proxy-forms] uploaded "PROXY FORM (KISWAHILI).pdf" as media #<id>
[agm-proxy-forms] attached 2 form(s) to "Notice of the Second Annual General Meeting"
```

- [ ] **Step 2: Confirm idempotency**

Run: `npm run seed:agm-proxy-forms` again.

Expected output:
```
[agm-proxy-forms] skip "Proxy Form (English)" — already attached
[agm-proxy-forms] skip "Fomu ya Uwakilishi (Kiswahili)" — already attached
[agm-proxy-forms] nothing to do — both forms already attached
```

---

### Task 8: End-to-end local verification and final commit

**Files:** none (verification only, plus the `docs/superpowers/plans/` file itself)

**Interfaces:** none — this task validates Tasks 1–7 together.

- [ ] **Step 1: Start the dev server**

Run: `cd "Cooperative Bank" && npm run dev`

Expected: starts without errors on `http://localhost:3000` (or whatever port it reports).

- [ ] **Step 2: Load the AGM press release page**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/press/notice-second-agm-2026`

Expected: `200`

- [ ] **Step 3: Confirm both buttons are in the HTML**

Run: `curl -s http://localhost:3000/press/notice-second-agm-2026 | grep -o "Proxy Form (English)\|Fomu ya Uwakilishi (Kiswahili)"`

Expected: both strings printed (one per line).

- [ ] **Step 4: Manually open the page in a browser and click both download links**

Open `http://localhost:3000/press/notice-second-agm-2026`, click each new button, confirm the correct PDF downloads and opens (English form has English content, Kiswahili form has Kiswahili content — verifies the upload script didn't swap the two files).

- [ ] **Step 5: Stop the dev server, commit the plan file**

```bash
cd "Cooperative Bank"
git add docs/superpowers/plans/2026-07-21-agm-proxy-forms.md
git commit -m "docs(agm): implementation plan for proxy form downloads"
```
