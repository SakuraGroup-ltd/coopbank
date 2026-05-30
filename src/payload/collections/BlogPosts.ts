import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf, publicReadPublished } from "../access/editorOf";

// Used for news, press releases, financial-literacy articles, AGM notices, etc.
export const BlogPosts: CollectionConfig = {
  slug: "blog-posts",
  versions: { drafts: true, maxPerDoc: 30 },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishDate", "featured", "_status"],
    listSearchableFields: ["title", "slug", "category"],
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
      admin: { description: "URL slug. Auto-generated from title on first save if blank." },
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
      name: "category",
      type: "select",
      required: true,
      defaultValue: "news",
      options: [
        { label: "News", value: "news" },
        { label: "Press Release", value: "press" },
        { label: "Financial Literacy", value: "literacy" },
        { label: "Annual / AGM", value: "agm" },
        { label: "Product Update", value: "product" },
        { label: "Insight", value: "insight" },
      ],
    },
    { name: "author", type: "relationship", relationTo: "users" },
    { name: "publishDate", type: "date", required: true },
    { name: "excerpt", type: "textarea", admin: { description: "Short summary shown on the listing card (max ~200 chars)." } },
    { name: "body", type: "richText", required: true },
    { name: "coverImage", type: "upload", relationTo: "media" },
    {
      name: "tags",
      type: "array",
      labels: { singular: "Tag", plural: "Tags" },
      fields: [{ name: "tag", type: "text", required: true }],
    },
    { name: "featured", type: "checkbox", admin: { description: "Featured posts appear on the homepage news strip." } },
    {
      name: "readTimeMins",
      type: "number",
      admin: { description: "Reading time in minutes. Auto-estimates from body length if blank." },
      min: 1,
    },
  ],
};
