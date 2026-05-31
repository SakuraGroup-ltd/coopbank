import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf, publicReadPublished } from "../access/editorOf";
import { trackEditor, auditFields } from "../hooks/trackEditor";
import { scheduledPublishField } from "../fields/scheduledPublish";

export const JobListings: CollectionConfig = {
  slug: "job-listings",
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: { beforeChange: [trackEditor] },
  admin: {
    group: "Recruitment",
    description:
      "Open vacancies. HR drafts and publishes here; once `applyByDate` passes the listing auto-hides from /careers (no need to un-publish). Set a real reply-to address in Apply Email so applications route correctly.",
    useAsTitle: "jobTitle",
    defaultColumns: ["jobTitle", "department", "location", "jobType", "applyByDate", "_status"],
    listSearchableFields: ["jobTitle", "department", "location", "slug"],
    livePreview: {
      url: ({ data }) => {
        // Prefer slug for readable URLs; fall back to id if slug isn't set yet.
        const key = (data?.slug || data?.id || "").toString();
        return `${process.env.NEXT_PUBLIC_SITE_URL || "https://dev.coopbank.co.tz"}/preview/careers/${key}`;
      },
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 375, height: 667 },
        { label: "Desktop", name: "desktop", width: 1280, height: 800 },
      ],
    },
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
      name: "slug",
      type: "text",
      unique: true,
      admin: {
        description: "Human-readable URL key. Auto-generated from the job title; edit only if you really need to.",
      },
      hooks: {
        beforeChange: [
          ({ value, data }) => {
            if (value) return value;
            const t = (data?.jobTitle || "") as string;
            return t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
          },
        ],
      },
    },
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
    {
      name: "description",
      type: "richText",
      admin: { description: "Legacy Lexical field. Studio writes to `descriptionHtml`." },
    },
    {
      name: "descriptionHtml",
      type: "textarea",
      admin: {
        description: "Role overview written via the Studio editor.",
        readOnly: true,
      },
    },
    {
      name: "requirements",
      type: "richText",
      admin: { description: "Legacy Lexical field. Studio writes to `requirementsHtml`." },
    },
    {
      name: "requirementsHtml",
      type: "textarea",
      admin: {
        description: "Qualifications/experience/skills written via the Studio editor.",
        readOnly: true,
      },
    },
    { name: "applyEmail", type: "email", defaultValue: "hr@cbtbank.co.tz" },
      ...auditFields,
    scheduledPublishField,
  ],
};
