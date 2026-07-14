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
