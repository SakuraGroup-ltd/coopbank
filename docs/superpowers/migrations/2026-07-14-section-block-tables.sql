-- Additive migration: 15 new section block types (Task 7 of the
-- pages-as-blocks phase 1 plan, docs/superpowers/plans/2026-07-14-pages-blocks-phase1.md).
-- Each block is a Payload Block with a single `data jsonb` field — the
-- Studio composer owns the editing UX, the site renderers own the data ->
-- props mapping, so the Neon schema only needs one tiny uniform table pair
-- per block type instead of a web of typed field + array tables.
--
-- Apply manually to Neon (push:false stays). DO NOT APPLY YET — this file
-- is a Task 7 deliverable only; Task 12 (gated) introspects Neon and
-- applies it.
--
-- ============================================================================
-- MANDATORY BEFORE APPLYING: this template was written WITHOUT live
-- introspection (this task is not permitted to run SQL against any
-- database). Column shapes, types, and index names below follow the
-- documented Payload 3 + @payloadcms/db-postgres drizzle conventions for
-- block tables (mirrored from the existing hero block), but the applying
-- task MUST re-verify against a fresh read-only introspection of the
-- existing `pages_blocks_hero` / `_pages_v_blocks_hero` tables before
-- running anything below, and adjust column types/names/constraints to
-- match reality if they differ:
--
--   SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--   WHERE table_name IN ('pages_blocks_hero', '_pages_v_blocks_hero')
--   ORDER BY table_name, ordinal_position;
--
--   SELECT indexname, indexdef FROM pg_indexes
--   WHERE tablename IN ('pages_blocks_hero', '_pages_v_blocks_hero');
-- ============================================================================

BEGIN;

-- hero-slider
CREATE TABLE IF NOT EXISTS pages_blocks_hero_slider (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_hero_slider_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_hero_slider_order_idx ON pages_blocks_hero_slider (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_hero_slider_parent_id_idx ON pages_blocks_hero_slider (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_hero_slider_path_idx ON pages_blocks_hero_slider (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_hero_slider (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_hero_slider_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_hero_slider_order_idx ON _pages_v_blocks_hero_slider (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_hero_slider_parent_id_idx ON _pages_v_blocks_hero_slider (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_hero_slider_path_idx ON _pages_v_blocks_hero_slider (_path);

-- quick-links
CREATE TABLE IF NOT EXISTS pages_blocks_quick_links (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_quick_links_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_quick_links_order_idx ON pages_blocks_quick_links (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_quick_links_parent_id_idx ON pages_blocks_quick_links (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_quick_links_path_idx ON pages_blocks_quick_links (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_quick_links (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_quick_links_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_quick_links_order_idx ON _pages_v_blocks_quick_links (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_quick_links_parent_id_idx ON _pages_v_blocks_quick_links (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_quick_links_path_idx ON _pages_v_blocks_quick_links (_path);

-- app-promo
CREATE TABLE IF NOT EXISTS pages_blocks_app_promo (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_app_promo_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_app_promo_order_idx ON pages_blocks_app_promo (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_app_promo_parent_id_idx ON pages_blocks_app_promo (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_app_promo_path_idx ON pages_blocks_app_promo (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_app_promo (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_app_promo_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_app_promo_order_idx ON _pages_v_blocks_app_promo (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_app_promo_parent_id_idx ON _pages_v_blocks_app_promo (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_app_promo_path_idx ON _pages_v_blocks_app_promo (_path);

-- services-grid
CREATE TABLE IF NOT EXISTS pages_blocks_services_grid (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_services_grid_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_services_grid_order_idx ON pages_blocks_services_grid (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_services_grid_parent_id_idx ON pages_blocks_services_grid (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_services_grid_path_idx ON pages_blocks_services_grid (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_services_grid (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_services_grid_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_services_grid_order_idx ON _pages_v_blocks_services_grid (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_services_grid_parent_id_idx ON _pages_v_blocks_services_grid (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_services_grid_path_idx ON _pages_v_blocks_services_grid (_path);

-- forex-ticker
CREATE TABLE IF NOT EXISTS pages_blocks_forex_ticker (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_forex_ticker_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_forex_ticker_order_idx ON pages_blocks_forex_ticker (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_forex_ticker_parent_id_idx ON pages_blocks_forex_ticker (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_forex_ticker_path_idx ON pages_blocks_forex_ticker (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_forex_ticker (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_forex_ticker_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_forex_ticker_order_idx ON _pages_v_blocks_forex_ticker (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_forex_ticker_parent_id_idx ON _pages_v_blocks_forex_ticker (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_forex_ticker_path_idx ON _pages_v_blocks_forex_ticker (_path);

-- page-header
CREATE TABLE IF NOT EXISTS pages_blocks_page_header (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_page_header_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_page_header_order_idx ON pages_blocks_page_header (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_page_header_parent_id_idx ON pages_blocks_page_header (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_page_header_path_idx ON pages_blocks_page_header (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_page_header (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_page_header_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_page_header_order_idx ON _pages_v_blocks_page_header (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_page_header_parent_id_idx ON _pages_v_blocks_page_header (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_page_header_path_idx ON _pages_v_blocks_page_header (_path);

-- bank-prayer
CREATE TABLE IF NOT EXISTS pages_blocks_bank_prayer (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_bank_prayer_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_bank_prayer_order_idx ON pages_blocks_bank_prayer (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_bank_prayer_parent_id_idx ON pages_blocks_bank_prayer (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_bank_prayer_path_idx ON pages_blocks_bank_prayer (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_bank_prayer (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_bank_prayer_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_bank_prayer_order_idx ON _pages_v_blocks_bank_prayer (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_bank_prayer_parent_id_idx ON _pages_v_blocks_bank_prayer (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_bank_prayer_path_idx ON _pages_v_blocks_bank_prayer (_path);

-- story
CREATE TABLE IF NOT EXISTS pages_blocks_story (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_story_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_story_order_idx ON pages_blocks_story (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_story_parent_id_idx ON pages_blocks_story (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_story_path_idx ON pages_blocks_story (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_story (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_story_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_story_order_idx ON _pages_v_blocks_story (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_story_parent_id_idx ON _pages_v_blocks_story (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_story_path_idx ON _pages_v_blocks_story (_path);

-- branch-network
CREATE TABLE IF NOT EXISTS pages_blocks_branch_network (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_branch_network_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_branch_network_order_idx ON pages_blocks_branch_network (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_branch_network_parent_id_idx ON pages_blocks_branch_network (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_branch_network_path_idx ON pages_blocks_branch_network (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_branch_network (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_branch_network_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_branch_network_order_idx ON _pages_v_blocks_branch_network (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_branch_network_parent_id_idx ON _pages_v_blocks_branch_network (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_branch_network_path_idx ON _pages_v_blocks_branch_network (_path);

-- journey-timeline
CREATE TABLE IF NOT EXISTS pages_blocks_journey_timeline (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_journey_timeline_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_journey_timeline_order_idx ON pages_blocks_journey_timeline (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_journey_timeline_parent_id_idx ON pages_blocks_journey_timeline (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_journey_timeline_path_idx ON pages_blocks_journey_timeline (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_journey_timeline (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_journey_timeline_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_journey_timeline_order_idx ON _pages_v_blocks_journey_timeline (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_journey_timeline_parent_id_idx ON _pages_v_blocks_journey_timeline (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_journey_timeline_path_idx ON _pages_v_blocks_journey_timeline (_path);

-- mission-vision
CREATE TABLE IF NOT EXISTS pages_blocks_mission_vision (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_mission_vision_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_mission_vision_order_idx ON pages_blocks_mission_vision (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_mission_vision_parent_id_idx ON pages_blocks_mission_vision (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_mission_vision_path_idx ON pages_blocks_mission_vision (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_mission_vision (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_mission_vision_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_mission_vision_order_idx ON _pages_v_blocks_mission_vision (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_mission_vision_parent_id_idx ON _pages_v_blocks_mission_vision (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_mission_vision_path_idx ON _pages_v_blocks_mission_vision (_path);

-- core-values
CREATE TABLE IF NOT EXISTS pages_blocks_core_values (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_core_values_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_core_values_order_idx ON pages_blocks_core_values (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_core_values_parent_id_idx ON pages_blocks_core_values (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_core_values_path_idx ON pages_blocks_core_values (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_core_values (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_core_values_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_core_values_order_idx ON _pages_v_blocks_core_values (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_core_values_parent_id_idx ON _pages_v_blocks_core_values (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_core_values_path_idx ON _pages_v_blocks_core_values (_path);

-- contact-details
CREATE TABLE IF NOT EXISTS pages_blocks_contact_details (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_contact_details_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_contact_details_order_idx ON pages_blocks_contact_details (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_contact_details_parent_id_idx ON pages_blocks_contact_details (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_contact_details_path_idx ON pages_blocks_contact_details (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_contact_details (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_contact_details_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_contact_details_order_idx ON _pages_v_blocks_contact_details (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_contact_details_parent_id_idx ON _pages_v_blocks_contact_details (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_contact_details_path_idx ON _pages_v_blocks_contact_details (_path);

-- contact-form
CREATE TABLE IF NOT EXISTS pages_blocks_contact_form (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_contact_form_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_contact_form_order_idx ON pages_blocks_contact_form (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_contact_form_parent_id_idx ON pages_blocks_contact_form (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_contact_form_path_idx ON pages_blocks_contact_form (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_contact_form (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_contact_form_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_contact_form_order_idx ON _pages_v_blocks_contact_form (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_contact_form_parent_id_idx ON _pages_v_blocks_contact_form (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_contact_form_path_idx ON _pages_v_blocks_contact_form (_path);

-- contact-map
CREATE TABLE IF NOT EXISTS pages_blocks_contact_map (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_contact_map_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_contact_map_order_idx ON pages_blocks_contact_map (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_contact_map_parent_id_idx ON pages_blocks_contact_map (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_contact_map_path_idx ON pages_blocks_contact_map (_path);

CREATE TABLE IF NOT EXISTS _pages_v_blocks_contact_map (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_contact_map_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_contact_map_order_idx ON _pages_v_blocks_contact_map (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_contact_map_parent_id_idx ON _pages_v_blocks_contact_map (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_contact_map_path_idx ON _pages_v_blocks_contact_map (_path);

COMMIT;
