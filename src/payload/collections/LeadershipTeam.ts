import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Board + executive leadership profiles for /about-us / governance pages.
export const LeadershipTeam: CollectionConfig = {
  slug: "leadership-team",
  admin: {
    group: "Investor Relations",
    description: "Board and executive leadership profiles surfaced on /about-us / governance.",
    useAsTitle: "name",
    defaultColumns: ["name", "title", "category", "sortOrder", "active"],
    listSearchableFields: ["name", "title"],
  },
  access: {
    read: () => true,
    create: editorOf("marketing"),
    update: editorOf("marketing"),
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "title", type: "text", required: true, admin: { description: "e.g. Group Managing Director, Independent Non-Executive Director." } },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "executive",
      options: [
        { label: "Board of Directors", value: "board" },
        { label: "Executive Management", value: "executive" },
        { label: "Senior Management", value: "senior" },
        { label: "Advisory", value: "advisory" },
      ],
    },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "bio", type: "textarea", admin: { description: "Short professional biography for the public profile." } },
    { name: "email", type: "email", admin: { description: "Optional public contact." } },
    {
      name: "linkedin",
      type: "text",
      admin: { description: "Optional LinkedIn URL." },
    },
    { name: "sortOrder", type: "number", defaultValue: 100, admin: { description: "Lower = appears first within the category." } },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Uncheck on departures without deleting historical records." },
    },
  ],
};
