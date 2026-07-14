-- Additive migration: contact-messages collection (public contact form).
-- Apply manually to Neon (push:false). Mirrors media_coverage conventions.
-- payload_locked_documents_rels column is REQUIRED (lock query joins it).

BEGIN;

CREATE TYPE enum_contact_messages_status AS ENUM ('new', 'read', 'handled');

CREATE TABLE IF NOT EXISTS contact_messages (
  id serial PRIMARY KEY,
  name character varying NOT NULL,
  email character varying NOT NULL,
  phone character varying,
  subject character varying NOT NULL,
  message character varying NOT NULL,
  status enum_contact_messages_status DEFAULT 'new',
  internal_notes character varying,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_messages_updated_at_idx ON contact_messages USING btree (updated_at);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages USING btree (created_at);

ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS contact_messages_id integer;
ALTER TABLE payload_locked_documents_rels
  DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_contact_messages_fk;
ALTER TABLE payload_locked_documents_rels
  ADD CONSTRAINT payload_locked_documents_rels_contact_messages_fk
  FOREIGN KEY (contact_messages_id) REFERENCES contact_messages(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_contact_messages_id_idx
  ON payload_locked_documents_rels USING btree (contact_messages_id);

-- SiteSettings gains contact.contactFormEmail (verify column-name convention
-- against existing site_settings columns, e.g. contact_email):
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_contact_form_email character varying;

COMMIT;
