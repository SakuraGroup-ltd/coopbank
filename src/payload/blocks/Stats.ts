import type { Block } from "payload";

// "30+ years", "2M+ customers", "165 branches & agents" — the trust strip.
export const StatsBlock: Block = {
  slug: "stats",
  labels: { singular: "Stats strip", plural: "Stats strips" },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "stats",
      type: "array",
      required: true,
      minRows: 2,
      maxRows: 6,
      labels: { singular: "Stat", plural: "Stats" },
      fields: [
        { name: "value", type: "text", required: true, admin: { description: "e.g. 30+, 2M+, ₦9.2B." } },
        { name: "label", type: "text", required: true, admin: { description: "e.g. Years serving Tanzania." } },
      ],
    },
  ],
};
