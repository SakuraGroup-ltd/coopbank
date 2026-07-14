import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Messages from the public /contact-us form. Created ONLY by the
// /api/contact route (overrideAccess) — direct REST creates are blocked so
// the honeypot + rate limit can't be bypassed. Marketing triages in Studio.
export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  admin: {
    group: "Site Content",
    useAsTitle: "subject",
    defaultColumns: ["name", "subject", "status", "createdAt"],
    description: "Public contact-form submissions. Triage in Studio → Contact messages.",
  },
  access: {
    create: () => false, // API route uses overrideAccess
    read: editorOf("marketing"),
    update: editorOf("marketing"),
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "subject", type: "text", required: true },
    { name: "message", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Read", value: "read" },
        { label: "Handled", value: "handled" },
      ],
    },
    { name: "internalNotes", type: "textarea", admin: { description: "Triage notes — never shown publicly." } },
  ],
};
