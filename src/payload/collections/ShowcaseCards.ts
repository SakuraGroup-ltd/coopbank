import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Cards for the dark homepage products carousel. Managed from /studio/showcase;
// the public ProductsCarousel falls back to its hardcoded set when this
// collection is empty. NOTE (schema managed by hand on Neon — push:false):
// table showcase_cards + payload_locked_documents_rels.showcase_cards_id,
// DDL in docs/superpowers/migrations/2026-07-13-showcase-cards.sql.
export const ShowcaseCards: CollectionConfig = {
  slug: "showcase-cards",
  admin: {
    group: "Content",
    description: "Product cards in the dark homepage carousel.",
    useAsTitle: "title",
    defaultColumns: ["title", "href", "sortOrder", "active"],
    listSearchableFields: ["title"],
  },
  access: {
    read: () => true,
    create: editorOf("marketing"),
    update: editorOf("marketing"),
    delete: isAdmin,
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "bullets",
      type: "textarea",
      admin: { description: "One bullet per line — up to three short selling points." },
    },
    { name: "image", type: "upload", relationTo: "media" },
    {
      name: "href",
      type: "text",
      admin: { description: 'Where "Explore" goes, e.g. /personal-banking#jasiri' },
    },
    { name: "sortOrder", type: "number", defaultValue: 100, admin: { description: "Lower = appears first." } },
    { name: "active", type: "checkbox", defaultValue: true },
  ],
};
