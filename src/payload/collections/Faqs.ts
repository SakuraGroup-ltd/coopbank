import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// FAQs surfaced on /faqs. Marketing owns these — they're customer-facing
// support content, same editorial scope as blog posts.
export const Faqs: CollectionConfig = {
  slug: "faqs",
  admin: {
    group: "Site Content",
    description:
      "Customer-facing Q&A on /faqs. Group by category, set sortOrder to control position within a category. `active=false` hides without deleting.",
    useAsTitle: "question",
    defaultColumns: ["question", "category", "sortOrder", "active"],
    listSearchableFields: ["question", "category"],
  },
  access: {
    read: () => true,
    create: editorOf("marketing"),
    update: editorOf("marketing"),
    delete: isAdmin,
  },
  fields: [
    { name: "question", type: "text", required: true },
    {
      name: "answerHtml",
      type: "textarea",
      required: true,
      admin: { description: "Answer rendered as HTML on /faqs." },
    },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "general",
      options: [
        { label: "General", value: "general" },
        { label: "Accounts", value: "accounts" },
        { label: "Loans", value: "loans" },
        { label: "Cards", value: "cards" },
        { label: "Digital Banking", value: "digital" },
        { label: "Branches & ATMs", value: "branches" },
        { label: "Security", value: "security" },
      ],
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 100,
      admin: { description: "Lower numbers appear first within the category." },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { description: "Uncheck to hide from /faqs without deleting." },
    },
  ],
};
