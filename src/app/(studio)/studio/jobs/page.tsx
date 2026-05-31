import Link from "next/link";
import { ChevronRight, Plus, Briefcase, MapPin, Calendar, AlertCircle } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";
import { cn } from "@/components/studio/ui/cn";

export const dynamic = "force-dynamic";

type Job = {
  id: string | number;
  jobTitle: string;
  department?: string;
  location?: string;
  jobType?: string;
  applyByDate?: string;
  summary?: string;
  updatedAt?: string;
  _status?: "draft" | "published";
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

const TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  consultancy: "Consultancy",
  internship: "Internship",
};

function daysUntil(date?: string): number | null {
  if (!date) return null;
  return Math.floor((new Date(date).getTime() - Date.now()) / 86_400_000);
}

export default async function JobsListPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "job-listings",
    limit: 100,
    depth: 0,
    draft: true,
    sort: "-updatedAt",
  });

  const jobs = result.docs.map((d) => d as unknown as Job);
  const today = Date.now();
  const active = jobs.filter(
    (j) => j.applyByDate && new Date(j.applyByDate).getTime() >= today,
  );
  const expired = jobs.filter(
    (j) => j.applyByDate && new Date(j.applyByDate).getTime() < today,
  );
  const drafts = jobs.filter((j) => j._status === "draft");

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Job listings</span>
      </div>

      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Job listings</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {active.length} accepting applications · {drafts.length} draft{drafts.length === 1 ? "" : "s"} · {expired.length} expired · Human Resources
            </p>
          </div>
        </div>
        <Link
          href="/studio/jobs/new"
          className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post a job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No job listings yet</h3>
          <p className="text-sm text-studio-ink-3 mb-6">Post your first vacancy.</p>
          <Link
            href="/studio/jobs/new"
            className="inline-flex h-9 px-4 text-sm items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
          >
            <Plus className="w-4 h-4" />
            Post your first job
          </Link>
        </div>
      ) : (
        <>
          {drafts.length > 0 && (
            <Section title="Drafts" hint="Not yet published" jobs={drafts.filter((j) => j._status === "draft")} />
          )}
          {active.length > 0 && (
            <Section
              title="Live"
              hint="Accepting applications"
              jobs={active.filter((j) => j._status !== "draft")}
              className={drafts.length > 0 ? "mt-10" : ""}
            />
          )}
          {expired.length > 0 && (
            <Section
              title="Closed"
              hint="Application window has passed"
              jobs={expired}
              className="mt-10"
              dim
            />
          )}
        </>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  jobs,
  className,
  dim,
}: {
  title: string;
  hint: string;
  jobs: Job[];
  className?: string;
  dim?: boolean;
}) {
  if (jobs.length === 0) return null;
  return (
    <section className={className}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider">{title}</h2>
          <p className="text-xs text-studio-ink-3 mt-0.5">{hint}</p>
        </div>
        <span className="text-xs text-studio-ink-3">{jobs.length}</span>
      </div>
      <div className={cn("space-y-2.5", dim && "opacity-70")}>
        {jobs.map((j) => <JobRow key={String(j.id)} job={j} />)}
      </div>
    </section>
  );
}

function JobRow({ job }: { job: Job }) {
  const days = daysUntil(job.applyByDate);
  const urgent = days !== null && days >= 0 && days <= 7;
  const closed = days !== null && days < 0;
  return (
    <Link
      href={`/studio/jobs/${job.id}`}
      className="group flex items-start gap-4 rounded-2xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all px-5 py-4 shadow-[0_1px_2px_rgba(15,15,15,0.04)]"
    >
      <span className="w-10 h-10 rounded-lg bg-studio-soft border border-studio-border flex items-center justify-center text-studio-ink-2 shrink-0">
        <Briefcase className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-base font-semibold text-studio-ink group-hover:text-cb-navy transition-colors leading-tight">
            {job.jobTitle}
          </h3>
          <Badge tone={job._status === "draft" ? "neutral" : "success"}>
            {job._status === "draft" ? "Draft" : "Published"}
          </Badge>
          {job.jobType && <Badge tone="navy">{TYPE_LABEL[job.jobType] || job.jobType}</Badge>}
        </div>
        <div className="flex items-center gap-3 text-xs text-studio-ink-3 mt-1 flex-wrap">
          {job.department && <span>{DEPT_LABEL[job.department] || job.department}</span>}
          {job.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
          )}
          {job.applyByDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(job.applyByDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
        {job.summary && (
          <p className="text-sm text-studio-ink-2 mt-2 line-clamp-1">{job.summary}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        {closed ? (
          <Badge tone="neutral">Closed</Badge>
        ) : urgent ? (
          <Badge tone="warning">
            <AlertCircle className="w-3 h-3" />
            {days === 0 ? "Today" : `${days}d left`}
          </Badge>
        ) : days !== null ? (
          <span className="text-xs text-studio-ink-3">{days}d left</span>
        ) : null}
      </div>
    </Link>
  );
}
