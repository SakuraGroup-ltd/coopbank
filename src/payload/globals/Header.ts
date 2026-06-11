import type { GlobalConfig } from "payload";
import { editorOf } from "../access/editorOf";

export const Header: GlobalConfig = {
  slug: "header",
  admin: {
    group: "Configuration",
    description: "Primary navigation, top-bar CTA, and the mega-menu structure rendered site-wide.",
  },
  access: { read: () => true, update: editorOf("marketing") },
  fields: [
    {
      name: "topBar",
      type: "group",
      fields: [
        { name: "ctaLabel", type: "text", defaultValue: "Download CoopPesa" },
        { name: "ctaHref", type: "text", defaultValue: "/digital-banking#download" },
      ],
    },
    {
      name: "primaryNav",
      type: "array",
      labels: { singular: "Nav item", plural: "Primary nav" },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text" },
        {
          name: "children",
          type: "array",
          labels: { singular: "Sub-item", plural: "Sub-items" },
          fields: [
            { name: "label", type: "text", required: true },
            { name: "href", type: "text", required: true },
          ],
        },
      ],
    },
  ],
};
