import type { Access, FieldAccess } from "payload";
import { isAnyAdmin, isMasterAdmin } from "./roles";

// Admin or master_admin — broadest collection editing. master_admin
// additionally controls user role assignments.
export const isAdmin: Access = ({ req: { user } }) => {
  if (!user || user.collection !== "users") return false;
  return isAnyAdmin(user as { role?: string; departments?: string[] });
};

export const isAdminField: FieldAccess = ({ req: { user } }) => {
  if (!user || user.collection !== "users") return false;
  return isAnyAdmin(user as { role?: string; departments?: string[] });
};

export const isMasterAdminAccess: Access = ({ req: { user } }) => {
  if (!user || user.collection !== "users") return false;
  return isMasterAdmin(user as { role?: string });
};
