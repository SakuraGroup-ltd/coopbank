// Source of truth: Payload. Whatever HR publishes in /studio/jobs shows up
// here on the next request. No Sheet round-trip, no hardcoded fallbacks in
// CareersClient — the rich Requirements block is now `requirementsHtml` on
// the job document.
import { getPayload } from "payload";
import config from "../../../../payload.config";
import CareersClient, { type ClientJob } from "./CareersClient";

export const dynamic = "force-dynamic";

const JOB_TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  consultancy: "Consultancy",
  internship: "Internship",
};

const DEPT_LABEL: Record<string, string> = {
  technology: "Technology",
  "ict-security": "ICT Security",
  "it-digital": "IT & Digital Transformation",
  operations: "Operations",
  credit: "Credit",
  marketing: "Marketing",
  treasury: "Treasury",
  hr: "Human Resources",
  finance: "Finance",
  other: "Other",
};

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function CareersPage() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "job-listings",
    limit: 200,
    depth: 0,
    sort: "-applyByDate",
    where: { _status: { equals: "published" } },
  });

  const today = Date.now();
  const jobs: ClientJob[] = result.docs
    .map((d) => {
      const r = d as unknown as {
        id: string | number;
        jobTitle: string;
        department?: string;
        location?: string;
        jobType?: string;
        applyByDate?: string;
        summary?: string;
        descriptionHtml?: string;
        requirementsHtml?: string;
      };
      return {
        id: String(r.id),
        job_title: r.jobTitle,
        department: DEPT_LABEL[r.department || "other"] || r.department || "Other",
        location: r.location || "",
        job_type: JOB_TYPE_LABEL[r.jobType || "full-time"] || r.jobType || "Full-time",
        apply_by_date: r.applyByDate || "",
        description: r.summary || stripHtml(r.descriptionHtml),
        description_html: r.descriptionHtml || "",
        requirements_html: r.requirementsHtml || "",
      };
    })
    .filter((j) => !j.apply_by_date || new Date(j.apply_by_date).getTime() >= today);

  return <CareersClient jobs={jobs} />;
}
