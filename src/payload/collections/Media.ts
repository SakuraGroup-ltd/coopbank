import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  upload: {
    // Image variants the frontend can request. Defaults are conservative;
    // tune once we know the real layout breakpoints.
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 800, height: 600, position: "centre" },
      { name: "feature", width: 1600, height: 900, position: "centre" },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*", "application/pdf"],
  },
  admin: {
    useAsTitle: "filename",
    defaultColumns: ["filename", "alt", "mimeType", "filesize"],
  },
  access: {
    // Public read so the marketing site can serve uploaded assets.
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) =>
      user?.collection === "users" &&
      (user as { role?: string }).role === "admin",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      admin: { description: "Accessibility alt text. Required for images." },
    },
    { name: "caption", type: "text" },
    {
      name: "credit",
      type: "text",
      admin: { description: "Photo credit, if any. Shown next to images on the site." },
    },
  ],
};
