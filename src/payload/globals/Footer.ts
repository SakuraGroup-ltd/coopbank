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
    {
      name: "openAccountBanner",
      type: "group",
      fields: [
        { name: "enabled", type: "checkbox", defaultValue: true },
        { name: "heading", type: "text" },
        { name: "subtext", type: "text" },
        { name: "buttonLabel", type: "text" },
        { name: "buttonHref", type: "text", admin: { description: "Defaults to the Play Store URL if blank." } },
      ],
    },
    { name: "about", type: "textarea", admin: { description: "Short paragraph under the footer logo." } },
    {
      name: "branches",
      type: "array",
      labels: { singular: "Branch", plural: "Footer branches" },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true, defaultValue: "/branches" },
      ],
    },
    { name: "branchesNote", type: "text", admin: { description: 'e.g. "+ 4 more coming soon"' } },
    {
      name: "legalLinks",
      type: "array",
      labels: { singular: "Legal link", plural: "Legal links" },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
      ],
    },
    {
      name: "developerCredit",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" },
      ],
    },
    { name: "tagline", type: "text" },
    { name: "copyright", type: "text", defaultValue: "© Cooperative Bank Tanzania Plc." },
  ],
};
