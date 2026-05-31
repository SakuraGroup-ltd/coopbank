import type { GlobalConfig } from "payload";
import { editorOf } from "../access/editorOf";

export const Footer: GlobalConfig = {
  slug: "footer",
  admin: {
    group: "Configuration",
    description: "Footer columns, tagline, and bottom-bar links — shared across every page.",
  },
  access: { read: () => true, update: editorOf("marketing") },
  fields: [
    {
      name: "columns",
      type: "array",
      maxRows: 5,
      labels: { singular: "Column", plural: "Footer columns" },
      fields: [
        { name: "heading", type: "text", required: true },
        {
          name: "links",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "href", type: "text", required: true },
          ],
        },
      ],
    },
    { name: "tagline", type: "text" },
    { name: "copyright", type: "text", defaultValue: "© Cooperative Bank Tanzania Plc." },
  ],
};
