import type { Block } from "payload";

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero blocks" },
  fields: [
    { name: "eyebrow", type: "text", admin: { description: "Small label above the headline." } },
    { name: "headline", type: "text", required: true },
    { name: "subhead", type: "textarea" },
    { name: "image", type: "upload", relationTo: "media" },
    {
      name: "ctas",
      type: "array",
      maxRows: 2,
      labels: { singular: "Call to action", plural: "Calls to action" },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
        {
          name: "style",
          type: "select",
          defaultValue: "primary",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
          ],
        },
      ],
    },
  ],
};
