import type { GlobalConfig } from "payload";
import { editorOf } from "../access/editorOf";
import { allBlocks } from "../blocks";

// The homepage is just an ordered list of blocks — same engine as Pages.
// Replaces the hand-coded grid+carousel+CoopEsa promo today.
export const Homepage: GlobalConfig = {
  slug: "homepage",
  access: { read: () => true, update: editorOf("marketing") },
  fields: [
    {
      name: "layout",
      type: "blocks",
      labels: { singular: "Block", plural: "Homepage blocks" },
      blocks: allBlocks,
    },
    {
      name: "featuredBlogPosts",
      type: "relationship",
      relationTo: "blog-posts",
      hasMany: true,
      maxRows: 6,
      admin: { description: "Posts to highlight in the homepage news strip." },
    },
  ],
};
