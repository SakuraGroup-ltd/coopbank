import type { Access } from "payload";
import { canEdit, CAN_EDIT } from "./roles";

// Legacy DepartmentSlug → keeps existing collection imports compiling.
export type DepartmentSlug =
  | "treasury"
  | "hr"
  | "operations"
  | "busdev"
  | "marketing"
  | "compliance";

// Map old department slugs to the new CAN_EDIT scope so collections that
// still call `editorOf("treasury")` keep working.
const SCOPE_FROM_SLUG: Record<DepartmentSlug, keyof typeof CAN_EDIT> = {
  treasury: "forex",
  hr: "jobs",
  operations: "tenders",
  busdev: "branches",
  marketing: "blog",
  compliance: "whistleblower",
};

// Editor of a given scope — admins/master always pass; the named role for
// that scope passes; everyone else is rejected.
export const editorOf = (slug: DepartmentSlug): Access =>
  ({ req: { user } }) => {
    if (!user || user.collection !== "users") return false;
    const scope = SCOPE_FROM_SLUG[slug];
    return canEdit(user as { role?: string; departments?: string[] }, scope);
  };

// Public read: only published items unless the caller is a signed-in user.
export const publicReadPublished: Access = ({ req: { user } }) => {
  if (user?.collection === "users") return true;
  return { _status: { equals: "published" } };
};
