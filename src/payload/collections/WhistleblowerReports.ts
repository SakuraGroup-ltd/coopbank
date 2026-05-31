import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Sensitive: anyone can SUBMIT (public form on /whistleblower POSTs here),
// only Compliance / Risk + admins can READ.
// Reports are append-only from the public form. Editors update `status` and
// `internalNotes` to track triage and resolution.
export const WhistleblowerReports: CollectionConfig = {
  slug: "whistleblower-reports",
  admin: {
    group: "Compliance",
    useAsTitle: "subject",
    defaultColumns: ["caseRef", "category", "subject", "status", "submittedAt"],
    description:
      "Submissions from the public /whistleblower form. Read-restricted to Compliance / Risk and admins. Records are append-only from the public form; only `status` and `internalNotes` should be edited during triage.",
  },
  access: {
    // Public submission via API — anyone can create a report (typically via the
    // /whistleblower form on the marketing site). Reads, updates, deletes are
    // tightly scoped.
    create: () => true,
    read: editorOf("compliance"),
    update: editorOf("compliance"),
    delete: isAdmin,
  },
  fields: [
    {
      name: "caseRef",
      type: "text",
      unique: true,
      admin: {
        readOnly: true,
        description: "Auto-generated reference (e.g. WB-2026-001) on first save.",
      },
      hooks: {
        beforeChange: [
          ({ value, operation, data }) => {
            if (operation !== "create" || value) return value;
            const year = new Date().getFullYear();
            // Random 6-char suffix — enough collision space, doesn't leak count.
            const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
            return `WB-${year}-${suffix}`;
          },
        ],
      },
    },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Fraud / Theft", value: "fraud" },
        { label: "Corruption / Bribery", value: "corruption" },
        { label: "Workplace Harassment", value: "harassment" },
        { label: "Discrimination", value: "discrimination" },
        { label: "Regulatory / Compliance Breach", value: "compliance" },
        { label: "Money Laundering", value: "aml" },
        { label: "Conflict of Interest", value: "conflict" },
        { label: "Other", value: "other" },
      ],
    },
    { name: "subject", type: "text", required: true, admin: { description: "Short headline (max 120 chars)." } },
    {
      name: "description",
      type: "textarea",
      required: true,
      admin: { description: "Detailed account of what happened, when, and who is involved." },
    },
    {
      name: "incidentDate",
      type: "date",
      admin: { description: "When did the incident occur (or start)? Optional." },
    },
    {
      name: "involvedParties",
      type: "textarea",
      admin: { description: "Names, roles, or departments involved. Optional." },
    },
    {
      name: "evidence",
      type: "array",
      labels: { singular: "Evidence file", plural: "Evidence files" },
      fields: [
        { name: "file", type: "upload", relationTo: "media", required: true },
        { name: "note", type: "text" },
      ],
    },
    {
      name: "reporter",
      type: "group",
      label: "Reporter (optional — anonymous reports allowed)",
      fields: [
        {
          name: "anonymous",
          type: "checkbox",
          defaultValue: true,
          admin: { description: "Tick if the reporter wishes to remain anonymous." },
        },
        { name: "name", type: "text", admin: { condition: (d) => !d?.reporter?.anonymous } },
        { name: "email", type: "email", admin: { condition: (d) => !d?.reporter?.anonymous } },
        { name: "phone", type: "text", admin: { condition: (d) => !d?.reporter?.anonymous } },
        {
          name: "preferredContact",
          type: "select",
          options: [
            { label: "Email", value: "email" },
            { label: "Phone", value: "phone" },
            { label: "Do not contact", value: "none" },
          ],
          defaultValue: "none",
          admin: { condition: (d) => !d?.reporter?.anonymous },
        },
      ],
    },
    {
      name: "submittedAt",
      type: "date",
      defaultValue: () => new Date().toISOString(),
      admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } },
    },
    // ─── Internal triage fields — only Compliance editors update these ───
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Under Review", value: "review" },
        { label: "Investigating", value: "investigating" },
        { label: "Resolved", value: "resolved" },
        { label: "Dismissed", value: "dismissed" },
        { label: "Escalated", value: "escalated" },
      ],
    },
    {
      name: "assignedTo",
      type: "relationship",
      relationTo: "users",
      admin: { description: "Compliance officer handling this case." },
    },
    {
      name: "internalNotes",
      type: "richText",
      admin: { description: "Investigation notes. Visible only to Compliance / Risk + admins." },
    },
    {
      name: "resolution",
      type: "richText",
      admin: {
        description: "Outcome / actions taken. Shown when status is resolved or dismissed.",
        condition: (d) => ["resolved", "dismissed"].includes(d?.status),
      },
    },
  ],
};
