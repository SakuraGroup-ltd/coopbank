import type { CollectionConfig } from "payload";
import { isAdmin, isAdminField } from "../access/isAdmin";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "role", "departments"],
  },
  access: {
    // Anyone authenticated can read user list (lets editors @-mention each other in version history).
    read: ({ req: { user } }) => Boolean(user),
    create: isAdmin,
    update: ({ req: { user }, id }) => {
      if (!user || user.collection !== "users") return false;
      if ((user as { role?: string }).role === "admin") return true;
      // Non-admins can update their own profile only.
      return user.id === id;
    },
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "viewer",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Viewer", value: "viewer" },
      ],
      access: {
        // Only admins can change someone's role (including their own).
        update: isAdminField,
      },
    },
    {
      name: "departments",
      type: "select",
      hasMany: true,
      options: [
        { label: "Treasury / Finance", value: "treasury" },
        { label: "Human Resources", value: "hr" },
        { label: "Operations / Procurement", value: "operations" },
        { label: "Business Development", value: "busdev" },
        { label: "Marketing", value: "marketing" },
        { label: "Compliance / Risk", value: "compliance" },
      ],
      admin: {
        description:
          "Department scope for editor role. Treasury edits forex rates, HR edits jobs, Operations edits tenders, BusDev edits branches, Marketing edits blog + pages, Compliance handles whistleblower reports + risk disclosures.",
      },
      access: { update: isAdminField },
    },
  ],
};
