import type { Block } from "payload";

export const RichTextBlock: Block = {
  slug: "rich-text",
  labels: { singular: "Rich text", plural: "Rich text blocks" },
  fields: [
    { name: "content", type: "richText", required: true },
    {
      name: "width",
      type: "select",
      defaultValue: "narrow",
      options: [
        { label: "Narrow (prose)", value: "narrow" },
        { label: "Wide", value: "wide" },
        { label: "Full bleed", value: "full" },
      ],
    },
  ],
};
