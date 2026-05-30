import type { Block } from "payload";

// The 6-card carousel today shows account types (Mama Africa, Kilimo Tija, Jasiri,
// Fixed Deposit, Msomi, Group Accounts) with EXPLORE CTAs. Marketers control the set.
export const ProductCarouselBlock: Block = {
  slug: "product-carousel",
  labels: { singular: "Product carousel", plural: "Product carousels" },
  fields: [
    { name: "heading", type: "text" },
    { name: "subhead", type: "text" },
    {
      name: "cards",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Card", plural: "Cards" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "image", type: "upload", relationTo: "media" },
        { name: "icon", type: "text", admin: { description: "Lucide icon name (optional)." } },
        { name: "ctaLabel", type: "text", defaultValue: "EXPLORE" },
        { name: "ctaHref", type: "text", required: true },
        { name: "badge", type: "text", admin: { description: "Optional badge text e.g. NEW, POPULAR." } },
      ],
    },
    {
      name: "cardsPerRow",
      type: "select",
      defaultValue: "3",
      options: [
        { label: "2 per row", value: "2" },
        { label: "3 per row", value: "3" },
        { label: "4 per row", value: "4" },
      ],
    },
  ],
};
