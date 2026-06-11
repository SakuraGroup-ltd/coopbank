import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Authorized CoopWakala agents shown on /digital-banking/coopwakala/agents.
// Managed in the Studio under "Agents" (same Network scope as Branches).
export const CoopwakalaAgents: CollectionConfig = {
  slug: "coopwakala-agents",
  labels: { singular: "CoopWakala Agent", plural: "CoopWakala Agents" },
  admin: {
    group: "Network",
    useAsTitle: "name",
    defaultColumns: ["name", "region", "district", "ward", "active"],
    description:
      "Authorized CoopWakala agents shown on the public Find-an-Agent directory. Uncheck `active` to hide an agent without deleting it.",
  },
  access: {
    read: () => true,
    create: editorOf("busdev"),
    update: editorOf("busdev"),
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "region",
      type: "text",
      required: true,
      admin: { description: "Region as shown on the map filter, e.g. Arusha, Dar Es Salaam, Dodoma." },
    },
    { name: "district", type: "text" },
    { name: "ward", type: "text" },
    { name: "street", type: "text" },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Uncheck to hide from the public agents directory without deleting." },
    },
  ],
};
