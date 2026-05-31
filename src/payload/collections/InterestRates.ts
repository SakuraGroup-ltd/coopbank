import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Published deposit + loan rates. Treasury maintains; surfaced site-wide
// wherever current rates are quoted (savings page, loan-products, etc.).
export const InterestRates: CollectionConfig = {
  slug: "interest-rates",
  admin: {
    group: "Treasury",
    description:
      "Current deposit and lending rates published to customers. Update on the day they change — `effectiveFrom` drives which rate is current.",
    useAsTitle: "productName",
    defaultColumns: ["productName", "kind", "rate", "effectiveFrom", "active"],
    listSearchableFields: ["productName", "kind"],
  },
  access: {
    read: () => true,
    create: editorOf("treasury"),
    update: editorOf("treasury"),
    delete: isAdmin,
  },
  fields: [
    { name: "productName", type: "text", required: true, admin: { description: "e.g. Mama Africa Savings, Mortgage Loan, Fixed Deposit 12-month." } },
    {
      name: "kind",
      type: "select",
      required: true,
      options: [
        { label: "Deposit", value: "deposit" },
        { label: "Loan", value: "loan" },
        { label: "Fixed Deposit", value: "fixed-deposit" },
        { label: "Treasury", value: "treasury" },
      ],
    },
    {
      name: "rateLabel",
      type: "text",
      required: true,
      admin: { description: "Displayed rate text — e.g. \"4.5% p.a.\", \"From 12% p.a.\", \"Up to 9%\"." },
    },
    {
      name: "rateValue",
      type: "number",
      admin: { description: "Numeric rate used for sorting + comparison. Optional but recommended." },
    },
    {
      name: "tenor",
      type: "text",
      admin: { description: "e.g. 6 months, 12 months, Open-ended. Optional." },
    },
    {
      name: "minimumAmount",
      type: "number",
      admin: { description: "Minimum balance / loan amount, in TZS. Optional." },
    },
    { name: "effectiveFrom", type: "date", required: true },
    { name: "notes", type: "textarea" },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Uncheck to retire a rate row without deleting." },
    },
  ],
};
