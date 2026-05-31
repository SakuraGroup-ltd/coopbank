import type { CollectionConfig } from "payload";
import { isAdmin, isAdminField, isMasterAdminAccess } from "../access/isAdmin";
import { ROLE_LABEL } from "../access/roles";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    group: "System",
    description:
      "Admin / editor accounts. Role + departments determine permission scope. Admins can manage everyone; editors can only update their own profile. Add new staff here; reset passwords from the user detail page.",
    useAsTitle: "email",
    defaultColumns: ["name", "email", "role", "departments"],
  },
  access: {
    // Anyone authenticated can read user list (lets editors @-mention each other in version history).
    read: ({ req: { user } }) => Boolean(user),
    create: isAdmin,
    update: ({ req: { user }, id }) => {
      if (!user || user.collection !== "users") return false;
      const u = user as { role?: string };
      if (u.role === "master_admin" || u.role === "admin") return true;
      // Non-admins can update their own profile only.
      return user.id === id;
    },
    // Only master admins can delete users (deleting an admin can cascade).
    delete: isMasterAdminAccess,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "viewer",
      options: [
        { label: ROLE_LABEL.master_admin, value: "master_admin" },
        { label: ROLE_LABEL.admin, value: "admin" },
        { label: ROLE_LABEL.marketer, value: "marketer" },
        { label: ROLE_LABEL.hr, value: "hr" },
        { label: ROLE_LABEL.procurement, value: "procurement" },
        { label: ROLE_LABEL.treasurer, value: "treasurer" },
        { label: ROLE_LABEL.compliance, value: "compliance" },
        { label: ROLE_LABEL.network, value: "network" },
        { label: ROLE_LABEL.viewer, value: "viewer" },
        // Legacy values kept so existing rows still validate.
        { label: "Editor (legacy)", value: "editor" },
      ],
      admin: {
        description:
          "Role = scope. Each named role owns one collection. Admin owns all; Master Admin additionally manages users.",
      },
      access: {
        // Only admins can change roles. Master admin role itself can only be
        // assigned by an existing master admin (enforced in the Studio UI).
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
          "Legacy department tags. New users should use the named role above instead — departments are kept for backwards compatibility with older accounts.",
      },
      access: { update: isAdminField },
    },
  ],
};
