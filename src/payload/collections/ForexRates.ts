import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// One row per currency. Treasury updates daily (weekdays).
// active=false hides a currency from the homepage ticker without deleting history.
export const ForexRates: CollectionConfig = {
  slug: "forex-rates",
  versions: { drafts: false, maxPerDoc: 100 }, // keep audit history of rate changes
  admin: {
    group: "Treasury",
    description:
      "Daily foreign-exchange board. One row per currency; Treasury updates on weekday mornings. `active=false` hides a currency from the homepage ticker without deleting its history. Per-rate version history is kept for audit.",
    useAsTitle: "currencyCode",
    defaultColumns: ["currencyCode", "currencyName", "buyRate", "sellRate", "trend", "updatedDate", "active"],
  },
  access: {
    read: () => true, // FX rates are always public
    create: editorOf("treasury"),
    update: editorOf("treasury"),
    delete: isAdmin,
  },
  fields: [
    {
      name: "currencyCode",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "ISO 4217 — USD, GBP, EUR, KES, ZAR…" },
      validate: (val: unknown) =>
        (typeof val === "string" && /^[A-Z]{3}$/.test(val)) || "Must be 3 uppercase letters.",
    },
    { name: "currencyName", type: "text", required: true },
    { name: "flagEmoji", type: "text", admin: { description: "Flag emoji for the ticker, e.g. 🇺🇸." } },
    { name: "buyRate", type: "number", required: true, min: 0 },
    { name: "sellRate", type: "number", required: true, min: 0 },
    {
      name: "trend",
      type: "select",
      required: true,
      defaultValue: "neutral",
      options: [
        { label: "Up", value: "up" },
        { label: "Down", value: "down" },
        { label: "Neutral", value: "neutral" },
      ],
    },
    { name: "updatedDate", type: "date", required: true, admin: { description: "Effective date of these rates." } },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Uncheck to hide this currency from the public ticker (without deleting the record)." },
    },
  ],
};
