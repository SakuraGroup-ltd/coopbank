import type { GlobalConfig } from "payload";
import { isAdmin } from "../access/isAdmin";

// Site-wide config: contact details, social links, the global emergency banner.
// Used by EVERY page, so it stays in one global rather than scattered constants.
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: {
    group: "Configuration",
    description: "Contact details, social handles, emergency banner — referenced across every page.",
  },
  access: { read: () => true, update: isAdmin },
  fields: [
    {
      name: "contact",
      type: "group",
      fields: [
        { name: "phone", type: "text", defaultValue: "+255 27 275 4470" },
        { name: "email", type: "email", defaultValue: "info@cbtbank.co.tz" },
        { name: "contactFormEmail", type: "email", defaultValue: "info@cbtbank.co.tz", admin: { description: "Where /contact-us form submissions are emailed." } },
        { name: "hrEmail", type: "email", defaultValue: "hr@cbtbank.co.tz" },
        { name: "tendersEmail", type: "email", defaultValue: "tenders@cbtbank.co.tz" },
        { name: "headquartersAddress", type: "textarea", defaultValue: "Sikukuu Street, P.O. Box 201, Dodoma" },
      ],
    },
    {
      name: "social",
      type: "group",
      fields: [
        { name: "facebook", type: "text" },
        { name: "twitter", type: "text" },
        { name: "instagram", type: "text" },
        { name: "linkedin", type: "text" },
        { name: "youtube", type: "text" },
      ],
    },
    {
      name: "emergencyBanner",
      type: "group",
      admin: {
        description:
          "Shows a banner at the top of every page when active. Use for outages, fraud alerts, or important notices.",
      },
      fields: [
        { name: "active", type: "checkbox", defaultValue: false },
        {
          name: "level",
          type: "select",
          defaultValue: "info",
          options: [
            { label: "Info", value: "info" },
            { label: "Warning", value: "warning" },
            { label: "Urgent", value: "urgent" },
          ],
          admin: { condition: (d) => Boolean(d?.emergencyBanner?.active) },
        },
        { name: "message", type: "text", admin: { condition: (d) => Boolean(d?.emergencyBanner?.active) } },
        { name: "linkLabel", type: "text", admin: { condition: (d) => Boolean(d?.emergencyBanner?.active) } },
        { name: "linkHref", type: "text", admin: { condition: (d) => Boolean(d?.emergencyBanner?.active) } },
      ],
    },
    {
      name: "announcementCard",
      type: "group",
      admin: {
        description:
          "A dismissible card that slides in at the bottom-right of every page. Use for an AGM, dividend notice, or event. It appears while active and comes down on its own after the event day.",
      },
      fields: [
        { name: "active", type: "checkbox", defaultValue: false },
        {
          name: "eventDate",
          type: "date",
          admin: {
            description:
              "The date of the event being announced. The card automatically comes down after this day.",
            date: { pickerAppearance: "dayAndTime" },
            condition: (d) => Boolean(d?.announcementCard?.active),
          },
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Poster / artwork shown as the card thumbnail.",
            condition: (d) => Boolean(d?.announcementCard?.active),
          },
        },
        { name: "eyebrow", type: "text", admin: { description: 'Small label above the title, e.g. "Announcement" or "Tangazo".', condition: (d) => Boolean(d?.announcementCard?.active) } },
        { name: "title", type: "text", admin: { condition: (d) => Boolean(d?.announcementCard?.active) } },
        { name: "subtitle", type: "text", admin: { description: "One line: date · venue.", condition: (d) => Boolean(d?.announcementCard?.active) } },
        { name: "ctaLabel", type: "text", admin: { description: 'Button text, e.g. "Read the full notice".', condition: (d) => Boolean(d?.announcementCard?.active) } },
        { name: "ctaHref", type: "text", admin: { description: "Where the button links, e.g. /press/notice-second-agm-2026.", condition: (d) => Boolean(d?.announcementCard?.active) } },
      ],
    },
    {
      name: "appStore",
      type: "group",
      label: "CoopPesa app links",
      fields: [
        { name: "iosUrl", type: "text" },
        { name: "androidUrl", type: "text" },
        { name: "ussdCode", type: "text", defaultValue: "*150*72#" },
      ],
    },
  ],
};
