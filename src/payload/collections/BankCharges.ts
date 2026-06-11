import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Bank charges / rates: a downloadable PDF or JPEG of the bank's fees & rates
// for all transactions. Staff replace the document whenever rates change — the
// public /bank-charges page shows the active ones (newest first).
export const BankCharges: CollectionConfig = {
  slug: "bank-charges",
  admin: {
    group: "Treasury",
    description: "Bank charges & rates documents (PDF or JPEG). Replace whenever rates change.",
    useAsTitle: "title",
    defaultColumns: ["title", "effectiveDate", "active", "updatedAt"],
    listSearchableFields: ["title"],
  },
  access: {
    read: () => true,
    create: editorOf("treasury"),
    update: editorOf("treasury"),
    delete: isAdmin,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: { description: 'e.g. "Tariff Guide & Bank Charges 2026" or "Transaction Rates".' },
    },
    { name: "effectiveDate", type: "date", required: true, admin: { description: "When these charges take effect." } },
    {
      name: "document",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: "The PDF or JPEG showing the charges/rates. This is what customers view and download. Re-upload here whenever rates change.",
      },
    },
    {
      name: "summary",
      type: "textarea",
      admin: { description: "Optional note shown above the document on the public page." },
    },
    { name: "active", type: "checkbox", defaultValue: true, admin: { description: "Uncheck to hide from the public page." } },
    { name: "order", type: "number", admin: { description: "Display order (lower shows first). Optional." } },
  ],
};
