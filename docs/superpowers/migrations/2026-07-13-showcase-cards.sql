-- Additive migration: showcase-cards collection (homepage products carousel).
-- Apply manually to Neon (push:false). Conventions mirrored from
-- leadership_team (upload FK) + media_coverage (scalar collection), verified
-- via read-only introspection 2026-07-13. The locked-documents rels column is
-- REQUIRED — without it every collection update 500s (the lock query joins
-- every collection's *_id column).

BEGIN;

CREATE TABLE IF NOT EXISTS showcase_cards (
  id serial PRIMARY KEY,
  title character varying NOT NULL,
  bullets character varying,
  image_id integer,
  href character varying,
  sort_order numeric DEFAULT 100,
  active boolean DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT showcase_cards_image_id_media_id_fk FOREIGN KEY (image_id)
    REFERENCES media(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS showcase_cards_image_idx ON showcase_cards USING btree (image_id);
CREATE INDEX IF NOT EXISTS showcase_cards_updated_at_idx ON showcase_cards USING btree (updated_at);
CREATE INDEX IF NOT EXISTS showcase_cards_created_at_idx ON showcase_cards USING btree (created_at);

ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS showcase_cards_id integer;
ALTER TABLE payload_locked_documents_rels
  DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_showcase_cards_fk;
ALTER TABLE payload_locked_documents_rels
  ADD CONSTRAINT payload_locked_documents_rels_showcase_cards_fk FOREIGN KEY (showcase_cards_id)
    REFERENCES showcase_cards(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_showcase_cards_id_idx
  ON payload_locked_documents_rels USING btree (showcase_cards_id);

COMMIT;
