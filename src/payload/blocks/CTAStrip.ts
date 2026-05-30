import type { Block } from "payload";

export const CTAStripBlock: Block = {
  slug: "cta-strip",
  labels: { singular: "CTA strip", plural: "CTA strips" },
  fields: [
    { name: "headline", type: "text", required: true },
    { name: "subhead", type: "text" },
    {
      name: "ctas",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 3,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
      ],
    },
    {
      name: "background",
      type: "select",
      defaultValue: "brand",
      options: [
        { label: "Brand colour", value: "brand" },
        { label: "Neutral", value: "neutral" },
        { label: "Dark", value: "dark" },
      ],
    },
  ],
};
