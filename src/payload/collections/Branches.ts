import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

export const Branches: CollectionConfig = {
  slug: "branches",
  admin: {
    group: "Network",
    description:
      "Branches, sub-branches, agents and ATMs — drives /branches and the locate-us map. Use `active=false` to retire a location without losing history; `comingSoon=true` shows the location with a 'Coming Soon' badge instead of operating hours.",
    useAsTitle: "name",
    defaultColumns: ["name", "type", "region", "isHq", "comingSoon", "active"],
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
      name: "type",
      type: "select",
      required: true,
      defaultValue: "branch",
      options: [
        { label: "Branch", value: "branch" },
        { label: "Agency (CoopWakala)", value: "agency" },
        { label: "Sub-branch", value: "sub-branch" },
        { label: "ATM only", value: "atm" },
      ],
    },
    {
      name: "region",
      type: "select",
      required: true,
      options: [
        { label: "Arusha", value: "arusha" },
        { label: "Dar es Salaam", value: "dar-es-salaam" },
        { label: "Dodoma", value: "dodoma" },
        { label: "Kagera", value: "kagera" },
        { label: "Kilimanjaro", value: "kilimanjaro" },
        { label: "Mbeya", value: "mbeya" },
        { label: "Mtwara", value: "mtwara" },
        { label: "Mwanza", value: "mwanza" },
        { label: "Tabora", value: "tabora" },
        { label: "Other", value: "other" },
      ],
    },
    { name: "address", type: "textarea" },
    { name: "phone", type: "text" },
    { name: "hoursWeekday", type: "text", defaultValue: "8:30AM–4:00PM" },
    { name: "hoursSaturday", type: "text", defaultValue: "8:30AM–1:30PM" },
    {
      name: "coordinates",
      type: "group",
      admin: { description: "For the map view. Lookup the precise lat/lng for each branch." },
      fields: [
        { name: "lat", type: "number", admin: { step: 0.000001 } },
        { name: "lng", type: "number", admin: { step: 0.000001 } },
      ],
    },
    { name: "mapsUrl", type: "text", admin: { description: "Direct Google Maps deep link." } },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      admin: { description: "Branch exterior photo. Used on detail pages." },
    },
    { name: "isHq", type: "checkbox", admin: { description: "Tick on the headquarters branch only." } },
    {
      name: "comingSoon",
      type: "checkbox",
      admin: { description: "If ticked, the branch shows as 'Coming Soon' with expectedOpening." },
    },
    {
      name: "expectedOpening",
      type: "text",
      admin: {
        description: "e.g. Q3 2026. Only shown when comingSoon is ticked.",
        condition: (data) => Boolean(data?.comingSoon),
      },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Uncheck to hide from the branches page without deleting." },
    },
  ],
};
