import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Investor relations: annual reports + integrated reports. Each year gets
// one entry with a PDF, a short summary, and a cover image.
export const AnnualReports: CollectionConfig = {
  slug: "annual-reports",
  admin: {
    group: "Investor Relations",
    description: "Annual + integrated reports. One row per financial year.",
    useAsTitle: "title",
    defaultColumns: ["title", "year", "publishedDate", "kind"],
    listSearchableFields: ["title", "year"],
  },
  access: {
    read: () => true,
    create: editorOf("marketing"),
    update: editorOf("marketing"),
    delete: isAdmin,
  },
  fields: [
    { name: "title", type: "text", required: true, admin: { description: "e.g. \"Cooperative Bank Tanzania — Annual Report 2025\"." } },
    { name: "year", type: "number", required: true, admin: { description: "Financial year, e.g. 2025." } },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "annual",
      options: [
        { label: "Annual Report", value: "annual" },
        { label: "Integrated Report", value: "integrated" },
        { label: "Interim / Half-year", value: "interim" },
        { label: "Sustainability Report", value: "sustainability" },
      ],
    },
    { name: "publishedDate", type: "date", required: true },
    { name: "summary", type: "textarea", required: true, admin: { description: "1-2 paragraphs for the listing page." } },
    {
      name: "document",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "The PDF. This is what investors download." },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      admin: { description: "Cover image used on the listing card." },
    },
  ],
};
