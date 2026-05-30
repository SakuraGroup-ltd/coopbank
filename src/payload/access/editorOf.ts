import type { Access } from "payload";

// Department slug a user must own to edit a given collection.
export type DepartmentSlug =
  | "treasury"
  | "hr"
  | "operations"
  | "busdev"
  | "marketing";

// Allows admins + users whose `departments` array contains the given slug.
export const editorOf = (slug: DepartmentSlug): Access =>
  ({ req: { user } }) => {
    if (!user || user.collection !== "users") return false;
    const u = user as { role?: string; departments?: string[] };
    if (u.role === "admin") return true;
    return Array.isArray(u.departments) && u.departments.includes(slug);
  };

// Public read: returns a constraint that only matches published items;
// admins/editors get everything via the parent collection's `read` access stack.
export const publicReadPublished: Access = ({ req: { user } }) => {
  if (user?.collection === "users") return true;
  return { _status: { equals: "published" } };
};
