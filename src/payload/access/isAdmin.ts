import type { Access, FieldAccess } from "payload";

export const isAdmin: Access = ({ req: { user } }) =>
  user?.collection === "users" && (user as { role?: string }).role === "admin";

export const isAdminField: FieldAccess = ({ req: { user } }) =>
  user?.collection === "users" && (user as { role?: string }).role === "admin";
