import type { GlobalConfig } from "payload";
import { editorOf } from "../access/editorOf";

// Site-wide homepage settings that don't belong to the block stack itself.
// The homepage's block composition lives in the Pages collection (slug=home).
export const Homepage: GlobalConfig = {
  slug: "homepage",
  access: { read: () => true, update: editorOf("marketing") },
  admin: {
    group: "Configuration",
    description:
      "Site-wide homepage settings — featured news rail picks. The homepage itself is composed in Pages → 'home'.",
    livePreview: {
      url: () =>
        // Homepage content lives in the Pages collection with slug=home; the
        // global is reserved for site-wide homepage modules like the featured
        // news rail. Preview points at the Pages doc so editors see the real
        // composition while editing either surface.
        `${process.env.NEXT_PUBLIC_SITE_URL || "https://dev.coopbank.co.tz"}/preview/home`,
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 375, height: 667 },
        { label: "Tablet", name: "tablet", width: 768, height: 1024 },
        { label: "Desktop", name: "desktop", width: 1280, height: 800 },
      ],
    },
  },
  fields: [
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
