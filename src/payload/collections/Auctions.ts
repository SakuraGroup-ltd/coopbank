import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Government securities auction calendar surfaced on /treasury/government-securities.
// Treasury owns these — same editorial scope as forex rates.
export const Auctions: CollectionConfig = {
  slug: "auctions",
  admin: {
    group: "Treasury",
    description:
      "Treasury Bills + Bonds auction schedule. Mirrors the Bank of Tanzania calendar; updated weekly by Treasury.",
    useAsTitle: "instrument",
    defaultColumns: ["instrument", "tenor", "auctionDate", "status", "active"],
    listSearchableFields: ["instrument", "tenor"],
  },
  access: {
    read: () => true,
    create: editorOf("treasury"),
    update: editorOf("treasury"),
    delete: isAdmin,
  },
  fields: [
    { name: "instrument", type: "text", required: true, admin: { description: "e.g. Treasury Bill, Treasury Bond." } },
    { name: "tenor", type: "text", required: true, admin: { description: "e.g. 91-day, 5-year, 15-year." } },
    { name: "announcementDate", type: "date", required: true },
    { name: "auctionDate", type: "date", required: true },
    { name: "valueDate", type: "date" },
    { name: "maturityDate", type: "date" },
    { name: "notes", type: "textarea" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "upcoming",
      options: [
        { label: "Upcoming", value: "upcoming" },
        { label: "Open for bids", value: "open" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Uncheck to hide from /treasury/government-securities without deleting." },
    },
  ],
};
