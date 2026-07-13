-- Additive migration: new footer-global fields (Task 4 of
-- docs/superpowers/plans/2026-07-09-studio-live-preview-footer-teams.md).
-- Apply manually to Neon (push:false — Payload will NOT create these).
-- Conventions mirrored from live footer/footer_columns/footer_columns_links
-- (verified via read-only introspection 2026-07-13).
-- Safe to run before or after the code deploy: resolveFooterData falls back
-- to the hardcoded defaults until rows/values exist.

BEGIN;

-- openAccountBanner group
ALTER TABLE footer ADD COLUMN IF NOT EXISTS open_account_banner_enabled boolean DEFAULT true;
ALTER TABLE footer ADD COLUMN IF NOT EXISTS open_account_banner_heading character varying;
ALTER TABLE footer ADD COLUMN IF NOT EXISTS open_account_banner_subtext character varying;
ALTER TABLE footer ADD COLUMN IF NOT EXISTS open_account_banner_button_label character varying;
ALTER TABLE footer ADD COLUMN IF NOT EXISTS open_account_banner_button_href character varying;

-- about (textarea) + branchesNote
ALTER TABLE footer ADD COLUMN IF NOT EXISTS about character varying;
ALTER TABLE footer ADD COLUMN IF NOT EXISTS branches_note character varying;

-- developerCredit group
ALTER TABLE footer ADD COLUMN IF NOT EXISTS developer_credit_label character varying;
ALTER TABLE footer ADD COLUMN IF NOT EXISTS developer_credit_href character varying;

-- branches array
CREATE TABLE IF NOT EXISTS footer_branches (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  label character varying NOT NULL,
  href character varying NOT NULL DEFAULT '/branches',
  CONSTRAINT footer_branches_pkey PRIMARY KEY (id),
  CONSTRAINT footer_branches_parent_id_fk FOREIGN KEY (_parent_id)
    REFERENCES footer(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS footer_branches_order_idx ON footer_branches USING btree (_order);
CREATE INDEX IF NOT EXISTS footer_branches_parent_id_idx ON footer_branches USING btree (_parent_id);

-- legalLinks array
CREATE TABLE IF NOT EXISTS footer_legal_links (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  label character varying NOT NULL,
  href character varying NOT NULL,
  CONSTRAINT footer_legal_links_pkey PRIMARY KEY (id),
  CONSTRAINT footer_legal_links_parent_id_fk FOREIGN KEY (_parent_id)
    REFERENCES footer(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS footer_legal_links_order_idx ON footer_legal_links USING btree (_order);
CREATE INDEX IF NOT EXISTS footer_legal_links_parent_id_idx ON footer_legal_links USING btree (_parent_id);

COMMIT;
