import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf, publicReadPublished } from "../access/editorOf";

// Drives /tenders. Status is auto-derived from closingDate at read time on the
// frontend — editors set draft/open/closed manually for unusual cases.
export const Tenders: CollectionConfig = {
  slug: "tenders",
  versions: { drafts: true, maxPerDoc: 20 },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["tenderRef", "title", "category", "closingDate", "_status"],
    listSearchableFields: ["tenderRef", "title", "category"],
  },
  access: {
    read: publicReadPublished,
    create: editorOf("operations"),
    update: editorOf("operations"),
    delete: isAdmin,
  },
  fields: [
    {
      name: "tenderRef",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "Reference number, e.g. TB-2026-001." },
      validate: (val: unknown) => {
        if (typeof val !== "string") return "Required";
        return /^TB-\d{4}-\d{3,}$/.test(val) || "Must match pattern TB-YYYY-### (e.g. TB-2026-001).";
      },
    },
    { name: "title", type: "text", required: true },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "IT Equipment", value: "it-equipment" },
        { label: "IT Services", value: "it-services" },
        { label: "Construction", value: "construction" },
        { label: "Services", value: "services" },
        { label: "Goods", value: "goods" },
        { label: "Consultancy", value: "consultancy" },
      ],
    },
    {
      name: "contractType",
      type: "select",
      options: [
        { label: "Supply", value: "supply" },
        { label: "Supply & Installation", value: "supply-install" },
        { label: "Service Contract", value: "service" },
        { label: "Construction Works", value: "construction" },
        { label: "Consulting Services", value: "consulting" },
      ],
    },
    { name: "publishedDate", type: "date", required: true },
    {
      name: "closingDate",
      type: "date",
      required: true,
      admin: { description: "Past closingDate auto-displays as Closed on the frontend." },
    },
    { name: "description", type: "richText" },
    {
      name: "document",
      type: "upload",
      relationTo: "media",
      admin: { description: "Tender PDF (specs, requirements). Optional but expected." },
    },
  ],
};
