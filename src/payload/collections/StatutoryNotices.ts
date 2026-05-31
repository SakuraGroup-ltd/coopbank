import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Regulator-mandated public notices: rate-change notifications, T&C updates,
// AML/CFT statements, dormant account notices, etc. Compliance owns these.
export const StatutoryNotices: CollectionConfig = {
  slug: "statutory-notices",
  admin: {
    group: "Compliance",
    description: "Regulator-mandated public notices and disclosures.",
    useAsTitle: "title",
    defaultColumns: ["title", "kind", "effectiveDate", "expiryDate", "active"],
    listSearchableFields: ["title", "kind"],
  },
  access: {
    read: () => true,
    create: editorOf("compliance"),
    update: editorOf("compliance"),
    delete: isAdmin,
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "kind",
      type: "select",
      required: true,
      options: [
        { label: "Rate change", value: "rate" },
        { label: "Terms & Conditions", value: "tc" },
        { label: "AML / CFT", value: "aml" },
        { label: "Dormant accounts", value: "dormant" },
        { label: "Regulatory disclosure", value: "regulatory" },
        { label: "Data protection / privacy", value: "privacy" },
        { label: "Service availability", value: "availability" },
        { label: "Other", value: "other" },
      ],
    },
    { name: "summary", type: "textarea", required: true },
    {
      name: "bodyHtml",
      type: "textarea",
      admin: { description: "Full notice body, written via the Studio editor." },
    },
    { name: "effectiveDate", type: "date", required: true },
    { name: "expiryDate", type: "date", admin: { description: "Optional. Past expiry hides the notice." } },
    {
      name: "document",
      type: "upload",
      relationTo: "media",
      admin: { description: "Official notice PDF if applicable." },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Uncheck to retract without deleting (audit-friendly)." },
    },
  ],
};
