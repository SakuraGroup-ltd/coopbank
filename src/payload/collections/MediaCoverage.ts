import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// External press coverage shown on /news ("what journalists are writing about
// the bank"). Distinct from `press-releases` (the bank's OWN announcements on
// /press). Each row links OUT to the original article.
// NOTE: the DB table + payload_locked_documents_rels.media_coverage_id column
// were created manually on Neon (Payload schema-push is off in prod). Keep the
// field names in sync with those columns (camelCase -> snake_case).
export const MediaCoverage: CollectionConfig = {
  slug: "media-coverage",
  admin: {
    group: "Site Content",
    useAsTitle: "title",
    defaultColumns: ["title", "source", "category", "publishedDate", "active"],
    listSearchableFields: ["title", "source"],
    description:
      "Press clippings shown on /news. Marketing owns these. Each entry links out to the original article on the publisher's site.",
  },
  access: {
    read: () => true,
    create: editorOf("marketing"),
    update: editorOf("marketing"),
    delete: isAdmin,
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "url", type: "text", required: true, admin: { description: "Link to the original article on the publisher's site." } },
    { name: "source", type: "text", required: true, admin: { description: "Publication name, e.g. The Citizen." } },
    { name: "sourceUrl", type: "text", admin: { description: "Publication homepage URL (for the logos strip)." } },
    { name: "sourceLogo", type: "text", admin: { description: "Path/URL of the publication logo, e.g. /images/news/sources/the-citizen.jpg." } },
    { name: "author", type: "text", admin: { description: "Byline, optional." } },
    {
      // Plain text (matches the varchar column) rather than a select, which
      // Payload would back with a pgEnum the manual table doesn't have.
      name: "category",
      type: "text",
      defaultValue: "News",
      admin: { description: "One of: News, Press, Insights, Agriculture (drives the filter tabs on /news)." },
    },
    { name: "image", type: "text", admin: { description: "Thumbnail path/URL, e.g. /images/news/articles/....jpg." } },
    { name: "publishedDate", type: "date", admin: { description: "Publication date (controls ordering)." } },
    { name: "sortOrder", type: "number", defaultValue: 100, admin: { description: "Tie-breaker; lower shows first when dates match." } },
    { name: "active", type: "checkbox", defaultValue: true, admin: { description: "Uncheck to hide without deleting." } },
  ],
};
