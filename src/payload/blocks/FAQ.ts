import type { Block } from "payload";

export const FAQBlock: Block = {
  slug: "faq",
  labels: { singular: "FAQ", plural: "FAQ blocks" },
  fields: [
    { name: "heading", type: "text", admin: { description: "Optional section heading above the questions." } },
    {
      name: "items",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Question", plural: "Questions" },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "richText", required: true },
      ],
    },
  ],
};
