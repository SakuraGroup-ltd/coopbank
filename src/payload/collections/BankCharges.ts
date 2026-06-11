import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Bank charges / rates: just a downloadable PDF or JPEG. Staff upload the file
// (and replace it whenever rates change) — nothing else to fill in. The public
// /bank-charges page simply displays the active document(s).
export const BankCharges: CollectionConfig = {
  slug: "bank-charges",
  admin: {
    group: "Treasury",
    description: "Upload the bank charges / rates as a PDF or JPEG. Replace the file whenever rates change.",
    useAsTitle: "title",
    defaultColumns: ["title", "active", "updatedAt"],
  },
  access: {
    read: () => true,
    create: editorOf("treasury"),
    update: editorOf("treasury"),
    delete: isAdmin,
  },
  fields: [
    {
      name: "document",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: "The bank charges / rates PDF or JPEG. This is exactly what customers see and download. Re-upload here to update.",
      },
    },
    {
      name: "title",
      type: "text",
      admin: { description: 'Optional label (e.g. "Tariff Guide 2026"). Shown above the document.' },
    },
    { name: "active", type: "checkbox", defaultValue: true, admin: { description: "Uncheck to hide from the public page." } },
  ],
};
