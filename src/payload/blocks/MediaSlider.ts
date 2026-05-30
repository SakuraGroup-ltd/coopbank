import type { Block } from "payload";

// Full-bleed slider for hero-rotations, campaign banners, board portraits, etc.
export const MediaSliderBlock: Block = {
  slug: "media-slider",
  labels: { singular: "Media slider", plural: "Media sliders" },
  fields: [
    {
      name: "slides",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Slide", plural: "Slides" },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "eyebrow", type: "text" },
        { name: "headline", type: "text" },
        { name: "subhead", type: "textarea" },
        { name: "ctaLabel", type: "text" },
        { name: "ctaHref", type: "text" },
      ],
    },
    {
      name: "autoplay",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Auto-advance slides every few seconds." },
    },
    {
      name: "intervalSeconds",
      type: "number",
      defaultValue: 6,
      min: 3,
      max: 30,
      admin: { condition: (d) => Boolean(d?.autoplay) },
    },
  ],
};
