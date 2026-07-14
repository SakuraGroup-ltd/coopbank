import type { Block } from "payload";

// Section blocks — the CMS mirror of the real site components (Hero,
// QuickLinks, About sections, Contact sections…). Each carries ONE json
// field: the Studio composer owns the editing UX and the renderers own the
// mapping, so Payload stores an opaque `data` blob. This is deliberate: the
// Neon schema is hand-managed (push:false) and a json column per block type
// keeps the SQL surface to one tiny uniform table per block instead of a
// web of typed field + array tables. Data shapes are documented in
// docs/superpowers/plans/2026-07-14-pages-blocks-phase1.md (Task 7).
const section = (slug: string, singular: string): Block => ({
  slug,
  labels: { singular, plural: `${singular} blocks` },
  fields: [{ name: "data", type: "json" }],
});

export const HeroSliderBlock = section("hero-slider", "Hero slider");
export const QuickLinksBlock = section("quick-links", "Quick links");
export const AppPromoBlock = section("app-promo", "App promo (CoopPesa)");
export const ServicesGridBlock = section("services-grid", "Services grid");
export const ForexTickerBlock = section("forex-ticker", "Forex ticker");
export const PageHeaderBlock = section("page-header", "Page header");
export const BankPrayerBlock = section("bank-prayer", "Bank prayer");
export const StoryBlock = section("story", "Story");
export const BranchNetworkBlock = section("branch-network", "Branch network");
export const JourneyTimelineBlock = section("journey-timeline", "Journey timeline");
export const MissionVisionBlock = section("mission-vision", "Mission & vision");
export const CoreValuesBlock = section("core-values", "Core values");
export const ContactDetailsBlock = section("contact-details", "Contact details");
export const ContactFormBlock = section("contact-form", "Contact form");
export const ContactMapBlock = section("contact-map", "Contact map");

export const sectionBlocks = [
  HeroSliderBlock, QuickLinksBlock, AppPromoBlock, ServicesGridBlock,
  ForexTickerBlock, PageHeaderBlock, BankPrayerBlock, StoryBlock,
  BranchNetworkBlock, JourneyTimelineBlock, MissionVisionBlock,
  CoreValuesBlock, ContactDetailsBlock, ContactFormBlock, ContactMapBlock,
];

export const SECTION_BLOCK_SLUGS = sectionBlocks.map((b) => b.slug);
