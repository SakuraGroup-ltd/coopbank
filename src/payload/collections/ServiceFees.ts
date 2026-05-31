import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Publicly disclosed schedule of fees + charges under BoT regulatory rules.
// Operations / Finance updates these whenever the schedule changes.
export const ServiceFees: CollectionConfig = {
  slug: "service-fees",
  admin: {
    group: "Operations",
    description: "Public fees and charges schedule. Required disclosure under BoT customer-protection rules.",
    useAsTitle: "serviceName",
    defaultColumns: ["serviceName", "category", "feeLabel", "effectiveFrom", "active"],
    listSearchableFields: ["serviceName", "category"],
  },
  access: {
    read: () => true,
    create: editorOf("operations"),
    update: editorOf("operations"),
    delete: isAdmin,
  },
  fields: [
    { name: "serviceName", type: "text", required: true, admin: { description: "e.g. ATM withdrawal (on-us), Cheque book, RTGS transfer." } },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Account services", value: "account" },
        { label: "Cards", value: "cards" },
        { label: "Transfers", value: "transfers" },
        { label: "ATM", value: "atm" },
        { label: "Cheques", value: "cheques" },
        { label: "Statements & confirmations", value: "statements" },
        { label: "Loans", value: "loans" },
        { label: "Trade finance", value: "trade" },
        { label: "Other", value: "other" },
      ],
    },
    { name: "feeLabel", type: "text", required: true, admin: { description: "e.g. \"TZS 500 per transaction\", \"Free\", \"0.5% of value\"." } },
    { name: "feeValue", type: "number", admin: { description: "Numeric fee in TZS for sortable views. Optional." } },
    { name: "vatInclusive", type: "checkbox", defaultValue: true },
    { name: "effectiveFrom", type: "date", required: true },
    { name: "notes", type: "textarea" },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Uncheck to retire a fee row without deleting." },
    },
  ],
};
