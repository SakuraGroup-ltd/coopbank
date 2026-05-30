import type { Block } from "payload";

// News/press release strip. Either auto-pulls latest N from BlogPosts, or shows
// a manually-curated set.
export const FeaturedNewsBlock: Block = {
  slug: "featured-news",
  labels: { singular: "Featured news", plural: "Featured news strips" },
  fields: [
    { name: "heading", type: "text", defaultValue: "Latest News" },
    { name: "subhead", type: "text" },
    {
      name: "mode",
      type: "select",
      defaultValue: "auto",
      options: [
        { label: "Auto — latest published", value: "auto" },
        { label: "Manual — curated list", value: "manual" },
      ],
    },
    {
      name: "limit",
      type: "number",
      defaultValue: 3,
      min: 1,
      max: 9,
      admin: { condition: (d) => d?.mode === "auto" },
    },
    {
      name: "category",
      type: "select",
      options: [
        { label: "All", value: "all" },
        { label: "News", value: "news" },
        { label: "Press Release", value: "press" },
        { label: "Financial Literacy", value: "literacy" },
        { label: "Product Update", value: "product" },
      ],
      defaultValue: "all",
      admin: { condition: (d) => d?.mode === "auto" },
    },
    {
      name: "posts",
      type: "relationship",
      relationTo: "blog-posts",
      hasMany: true,
      maxRows: 9,
      admin: { condition: (d) => d?.mode === "manual" },
    },
  ],
};
