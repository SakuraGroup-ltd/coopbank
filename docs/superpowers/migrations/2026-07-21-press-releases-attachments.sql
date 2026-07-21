-- Additive migration: attachments array field on press-releases.
-- Apply manually to Neon (push:false). Conventions mirrored from the
-- showcase_cards migration (array table + FK to media) and adapted for a
-- collection with versions.drafts enabled, which needs a matching
-- _press_releases_v_version_attachments table. Verified via read-only
-- introspection 2026-07-21 (docs/superpowers/plans/2026-07-21-agm-proxy-forms.md, Task 1).
-- Reconciliation complete: press_releases.id and _press_releases_v.id are both integer;
-- no index name collisions detected.
-- NOTE: payload_locked_documents_rels column intentionally omitted — it only tracks
-- top-level collections. See docs/superpowers/migrations/2026-07-14-section-block-tables.sql
-- for the correct precedent (15 new sub-tables, zero payload_locked_documents_rels changes).

BEGIN;

-- Step 1: Create attachment tables for press_releases collection

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
