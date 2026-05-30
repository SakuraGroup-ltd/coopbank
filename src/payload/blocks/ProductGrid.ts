import type { Block } from "payload";

// The "Banking Made Simple" 9-tile grid on the homepage and similar shorter grids
// across the site. Static cards, no rotation.
export const ProductGridBlock: Block = {
  slug: "product-grid",
  labels: { singular: "Product grid", plural: "Product grids" },
  fields: [
    { name: "heading", type: "text" },
    { name: "subhead", type: "text" },
    {
      name: "tiles",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Tile", plural: "Tiles" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "text" },
        { name: "icon", type: "text", admin: { description: "Lucide icon name." } },
        { name: "image", type: "upload", relationTo: "media" },
        { name: "href", type: "text", required: true },
      ],
    },
    {
      name: "columns",
      type: "select",
      defaultValue: "3",
      options: [
        { label: "2 columns", value: "2" },
        { label: "3 columns", value: "3" },
        { label: "4 columns", value: "4" },
      ],
    },
  ],
};
