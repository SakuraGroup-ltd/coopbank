import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf, publicReadPublished } from "../access/editorOf";
import { trackEditor, auditFields } from "../hooks/trackEditor";
import { scheduledPublishField } from "../fields/scheduledPublish";

// Formal corporate announcements — distinct from blog news. Used for:
// regulatory filings, M&A, AGM resolutions, leadership changes, dividend
// declarations. Marketing drafts, the Master Admin reviews + publishes.
export const PressReleases: CollectionConfig = {
  slug: "press-releases",
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: { beforeChange: [trackEditor] },
  admin: {
    group: "Site Content",
    description:
      "Formal corporate announcements. Maker-checker: Marketing drafts, an Admin reviews and publishes. Attach the official PDF where applicable.",
    useAsTitle: "headline",
    defaultColumns: ["headline", "releaseDate", "category", "_status"],
    listSearchableFields: ["headline", "slug"],
    livePreview: {
      url: ({ data }) => {
        const slug = (data?.slug || data?.id || "").toString();
        return `${process.env.NEXT_PUBLIC_SITE_URL || "https://dev.coopbank.co.tz"}/preview/press/${slug}`;
      },
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 375, height: 667 },
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
    { name: "headline", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      hooks: {
        beforeChange: [
          ({ value, data }) => {
            if (value) return value;
            const t = (data?.headline || "") as string;
            return t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
          },
        ],
      },
    },
    { name: "releaseDate", type: "date", required: true },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "corporate",
      options: [
        { label: "Corporate", value: "corporate" },
        { label: "Regulatory", value: "regulatory" },
        { label: "Financial Results", value: "financial" },
        { label: "Leadership", value: "leadership" },
        { label: "AGM / Dividend", value: "agm" },
        { label: "Product Launch", value: "product" },
      ],
    },
    { name: "summary", type: "textarea", required: true, admin: { description: "Brief lede shown on the press releases list page." } },
    {
      name: "bodyHtml",
      type: "textarea",
      admin: {
        description: "Full release body. Written via the Studio Tiptap editor.",
        readOnly: true,
      },
    },
    {
      name: "document",
      type: "upload",
      relationTo: "media",
      admin: { description: "Official press release PDF, where applicable." },
    },
    {
      name: "mediaContact",
      type: "group",
      fields: [
        { name: "name", type: "text", defaultValue: "Communications Office" },
        { name: "email", type: "email", defaultValue: "media@cbtbank.co.tz" },
        { name: "phone", type: "text", defaultValue: "+255 27 275 4470" },
      ],
    },
    ...auditFields,
    scheduledPublishField,
  ],
};
