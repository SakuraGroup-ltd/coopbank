import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf, publicReadPublished } from "../access/editorOf";
import { allBlocks } from "../blocks";

// Generic block-composed pages. Marketing builds About, Risk Disclosures,
// landing pages, campaign pages, etc. by stacking the available blocks.
export const Pages: CollectionConfig = {
  slug: "pages",
  versions: { drafts: true, maxPerDoc: 30 },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    listSearchableFields: ["title", "slug"],
  },
  access: {
    read: publicReadPublished,
    create: editorOf("marketing"),
    update: editorOf("marketing"),
    delete: isAdmin,
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "URL path segment, e.g. about-us. No leading slash." },
      hooks: {
        beforeChange: [
          ({ value, data }) => {
            if (value) return value;
            const t = (data?.title || "") as string;
            return t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
          },
        ],
      },
    },
    {
      name: "seo",
      type: "group",
      admin: { description: "Per-page SEO. Falls back to title/excerpt if blank." },
      fields: [
        { name: "metaTitle", type: "text" },
        { name: "metaDescription", type: "textarea" },
        { name: "ogImage", type: "upload", relationTo: "media" },
      ],
    },
    {
      name: "layout",
      type: "blocks",
      labels: { singular: "Block", plural: "Blocks" },
      blocks: allBlocks,
    },
  ],
};
