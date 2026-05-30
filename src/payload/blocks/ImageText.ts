import type { Block } from "payload";

// Two-column image-and-text section. Expresses the CoopEsa promo block, the
// digital-account-opening section, and product feature explainers.
export const ImageTextBlock: Block = {
  slug: "image-text",
  labels: { singular: "Image + text", plural: "Image + text blocks" },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "body", type: "richText" },
    { name: "image", type: "upload", relationTo: "media", required: true },
    {
      name: "imageSide",
      type: "select",
      defaultValue: "right",
      options: [
        { label: "Image on left", value: "left" },
        { label: "Image on right", value: "right" },
      ],
    },
    {
      name: "bullets",
      type: "array",
      labels: { singular: "Bullet", plural: "Bullets" },
      fields: [
        { name: "icon", type: "text", admin: { description: "Lucide icon name (optional)." } },
        { name: "text", type: "text", required: true },
      ],
    },
    {
      name: "ctas",
      type: "array",
      maxRows: 3,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
      ],
    },
  ],
};
