import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf, publicReadPublished } from "../access/editorOf";
import { allBlocks } from "../blocks";
import { trackEditor, auditFields } from "../hooks/trackEditor";
import { scheduledPublishField } from "../fields/scheduledPublish";

// Generic block-composed pages. Marketing builds About, Risk Disclosures,
// landing pages, campaign pages, etc. by stacking the available blocks.
export const Pages: CollectionConfig = {
  slug: "pages",
  versions: { drafts: true, maxPerDoc: 30 },
  hooks: { beforeChange: [trackEditor] },
  admin: {
    group: "Site Content",
    description:
      "Compose any marketing page by stacking blocks — Hero, Stats, Product Grid, Image+Text, FAQ, etc. Live Preview shows the result as you edit. The page is reachable at /<slug>; publish to make it live.",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    listSearchableFields: ["title", "slug"],
    livePreview: {
      url: ({ data }) => {
        const slug = (data?.slug || "").toString().replace(/^\/+/, "");
        return `${process.env.NEXT_PUBLIC_SITE_URL || "https://dev.coopbank.co.tz"}/preview/${slug}`;
      },
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 375, height: 667 },
        { label: "Tablet", name: "tablet", width: 768, height: 1024 },
        { label: "Desktop", name: "desktop", width: 1280, height: 800 },
      ],
    },
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
      ...auditFields,
    scheduledPublishField,
  ],
};
