import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { JobComposer } from "@/components/studio/jobs/JobComposer";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ id: string }> };

export default async function JobComposerPage({ params }: Args) {
  await requireStudioUser();
  const { id } = await params;

  if (id === "new") {
    return (
      <JobComposer
        mode="create"
        initial={{
          jobTitle: "",
          department: "operations",
          location: "",
          jobType: "full-time",
          applyByDate: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
          summary: "",
          descriptionHtml: "",
          requirementsHtml: "",
          applyEmail: "hr@cbtbank.co.tz",
        }}
      />
    );
  }

  const payload = await getPayload({ config });
  const result = await payload.findByID({
    collection: "job-listings",
    id,
    depth: 0,
    draft: true,
  });

  const job = result as unknown as {
    id: string | number;
    jobTitle: string;
    department?: string;
    location?: string;
    jobType?: string;
    applyByDate?: string;
    summary?: string;
    descriptionHtml?: string;
    requirementsHtml?: string;
    applyEmail?: string;
    _status?: "draft" | "published";
  };

  return (
    <JobComposer
      mode="edit"
      initial={{
        id: job.id,
        jobTitle: job.jobTitle || "",
        department: job.department || "operations",
        location: job.location || "",
        jobType: job.jobType || "full-time",
        applyByDate: job.applyByDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        summary: job.summary || "",
        descriptionHtml: job.descriptionHtml || "",
        requirementsHtml: job.requirementsHtml || "",
        applyEmail: job.applyEmail || "hr@cbtbank.co.tz",
        status: job._status,
      }}
    />
  );
}
