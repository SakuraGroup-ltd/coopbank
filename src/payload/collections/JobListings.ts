import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf, publicReadPublished } from "../access/editorOf";

export const JobListings: CollectionConfig = {
  slug: "job-listings",
  versions: { drafts: true, maxPerDoc: 20 },
  admin: {
    useAsTitle: "jobTitle",
    defaultColumns: ["jobTitle", "department", "location", "jobType", "applyByDate", "_status"],
    listSearchableFields: ["jobTitle", "department", "location"],
  },
  access: {
    read: publicReadPublished,
    create: editorOf("hr"),
    update: editorOf("hr"),
    delete: isAdmin,
  },
  fields: [
    { name: "jobTitle", type: "text", required: true },
    {
      name: "department",
      type: "select",
      required: true,
      options: [
        { label: "Technology", value: "technology" },
        { label: "ICT Security", value: "ict-security" },
        { label: "IT & Digital Transformation", value: "it-digital" },
        { label: "Operations", value: "operations" },
        { label: "Credit", value: "credit" },
        { label: "Marketing", value: "marketing" },
        { label: "Treasury", value: "treasury" },
        { label: "Human Resources", value: "hr" },
        { label: "Finance", value: "finance" },
        { label: "Other", value: "other" },
      ],
    },
    { name: "location", type: "text", required: true, admin: { description: "e.g. Head Office – Dodoma, Arusha Branch, Remote/Flexible." } },
    {
      name: "jobType",
      type: "select",
      required: true,
      defaultValue: "full-time",
      options: [
        { label: "Full-time", value: "full-time" },
        { label: "Part-time", value: "part-time" },
        { label: "Contract", value: "contract" },
        { label: "Consultancy", value: "consultancy" },
        { label: "Internship", value: "internship" },
      ],
    },
    { name: "applyByDate", type: "date", required: true },
    { name: "summary", type: "textarea", admin: { description: "One-line description shown on the job card." } },
    { name: "description", type: "richText", admin: { description: "Full responsibilities, what success looks like, etc." } },
    { name: "requirements", type: "richText", admin: { description: "Qualifications, experience, skills." } },
    { name: "applyEmail", type: "email", defaultValue: "hr@cbtbank.co.tz" },
  ],
};
