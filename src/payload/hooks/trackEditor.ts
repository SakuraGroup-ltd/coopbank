import type { CollectionBeforeChangeHook, Field } from "payload";

// Stamps `updatedBy` with the currently authenticated user id on every save.
// Combined with Payload's existing version history this gives full audit:
// who edited what, when, including across multiple versions.
export const trackEditor: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  if (!req.user) return data;
  return {
    ...data,
    updatedBy: req.user.id,
    ...(operation === "create" ? { createdBy: req.user.id } : {}),
  };
};

// Schema fragment to spread into a collection's `fields` array — surfaces
// the audit trail so editors can see who last touched a record, and so
// queries can populate the user via `depth`.
export const auditFields: Field[] = [
  {
    name: "updatedBy",
    type: "relationship",
    relationTo: "users",
    admin: { readOnly: true, position: "sidebar", description: "Auto-stamped on every save." },
  },
  {
    name: "createdBy",
    type: "relationship",
    relationTo: "users",
    admin: { readOnly: true, position: "sidebar", description: "Stamped on first save." },
  },
];
