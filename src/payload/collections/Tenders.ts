import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf, publicReadPublished } from "../access/editorOf";
import { trackEditor, auditFields } from "../hooks/trackEditor";
import { scheduledPublishField } from "../fields/scheduledPublish";

// Drives /tenders. Status is auto-derived from closingDate at read time on the
// frontend — editors set draft/open/closed manually for unusual cases.
export const Tenders: CollectionConfig = {
  slug: "tenders",
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: { beforeChange: [trackEditor] },
  admin: {
    group: "Procurement",
    description:
      "Public tender notices on /tenders. Each tender has open and close dates; past `closingDate` auto-shows as Closed on the public site. Attach the bid document via Media. Always include a tenders@ reply-to so vendors can request clarifications.",
    useAsTitle: "title",
    defaultColumns: ["tenderRef", "title", "category", "closingDate", "_status"],
    listSearchableFields: ["tenderRef", "title", "category"],
    livePreview: {
      url: ({ data }) => {
        const ref = (data?.tenderRef || data?.id || "").toString();
        return `${process.env.NEXT_PUBLIC_SITE_URL || "https://dev.coopbank.co.tz"}/preview/tenders/${ref}`;
      },
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 375, height: 667 },
        { label: "Desktop", name: "desktop", width: 1280, height: 800 },
      ],
    },
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
    {
      name: "description",
      type: "richText",
      admin: { description: "Legacy Lexical field. Studio writes to `descriptionHtml`." },
    },
    {
      name: "descriptionHtml",
      type: "textarea",
      admin: {
        description: "Tender brief written via the Studio editor.",
        readOnly: true,
      },
    },
    {
      name: "document",
      type: "upload",
      relationTo: "media",
      admin: { description: "Tender PDF (specs, requirements). Optional but expected." },
    },
      ...auditFields,
    scheduledPublishField,
  ],
};
