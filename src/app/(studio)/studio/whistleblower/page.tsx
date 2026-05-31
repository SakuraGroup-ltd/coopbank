import Link from "next/link";
import { ChevronRight, ShieldAlert, AlertCircle } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";

export const dynamic = "force-dynamic";

type Report = {
  id: string | number;
  caseRef?: string;
  category?: string;
  subject: string;
  status?: string;
  submittedAt?: string;
  reporter?: { anonymous?: boolean };
};

const CATEGORY_LABEL: Record<string, string> = {
  fraud: "Fraud / Theft",
  corruption: "Corruption / Bribery",
  harassment: "Workplace Harassment",
  discrimination: "Discrimination",
  compliance: "Regulatory Breach",
  aml: "Money Laundering",
  conflict: "Conflict of Interest",
  other: "Other",
};

const STATUS_TONE: Record<string, "neutral" | "warning" | "navy" | "success" | "danger"> = {
  new: "danger",
  review: "warning",
  investigating: "navy",
  resolved: "success",
  dismissed: "neutral",
  escalated: "danger",
};

function timeAgo(date?: string): string {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function WhistleblowerPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "whistleblower-reports",
    limit: 100,
    depth: 0,
    sort: "-submittedAt",
  });

  const reports = result.docs.map((d) => d as unknown as Report);
  const newCases = reports.filter((r) => r.status === "new");
  const active = reports.filter((r) => ["review", "investigating", "escalated"].includes(r.status || ""));
  const closed = reports.filter((r) => ["resolved", "dismissed"].includes(r.status || ""));

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Whistleblower reports</span>
      </div>

      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Whistleblower reports</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {newCases.length} new · {active.length} in progress · {closed.length} resolved · Compliance / Risk
            </p>
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <ShieldAlert className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No reports yet</h3>
          <p className="text-sm text-studio-ink-3">Reports submitted via the public /whistleblower form land here.</p>
        </div>
      ) : (
        <>
          <Section title="New" hint="Triage now" reports={newCases} highlight />
          <Section title="In progress" hint="Under review or investigation" reports={active} className="mt-10" />
          <Section title="Closed" hint="Resolved or dismissed" reports={closed} className="mt-10" dim />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  reports,
  className,
  dim,
  highlight,
}: {
  title: string;
  hint: string;
  reports: Report[];
  className?: string;
  dim?: boolean;
  highlight?: boolean;
}) {
  if (reports.length === 0) return null;
  return (
    <section className={className}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider">{title}</h2>
          <p className="text-xs text-studio-ink-3 mt-0.5">{hint}</p>
        </div>
        <span className="text-xs text-studio-ink-3">{reports.length}</span>
      </div>
      <div className={`space-y-2.5 ${dim ? "opacity-70" : ""}`}>
        {reports.map((r) => <ReportRow key={String(r.id)} report={r} highlight={highlight} />)}
      </div>
    </section>
  );
}

function ReportRow({ report, highlight }: { report: Report; highlight?: boolean }) {
  return (
    <Link
      href={`/studio/whistleblower/${report.id}`}
      className={`group flex items-start gap-4 rounded-2xl border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all px-5 py-4 shadow-[0_1px_2px_rgba(15,15,15,0.04)] ${
        highlight ? "border-rose-200 bg-rose-50/30" : "border-studio-border"
      }`}
    >
      <span className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
        highlight ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-studio-soft border-studio-border text-studio-ink-2"
      }`}>
        {highlight ? <AlertCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-mono text-cb-navy bg-cb-navy/8 px-1.5 py-0.5 rounded">
            {report.caseRef || "WB-???"}
          </span>
          <h3 className="text-base font-semibold text-studio-ink group-hover:text-cb-navy transition-colors leading-tight truncate">
            {report.subject}
          </h3>
          {report.status && (
            <Badge tone={STATUS_TONE[report.status] || "neutral"}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-studio-ink-3 mt-1 flex-wrap">
          {report.category && <span>{CATEGORY_LABEL[report.category] || report.category}</span>}
          {report.reporter?.anonymous && <span>· Anonymous</span>}
          {report.submittedAt && <span>· {timeAgo(report.submittedAt)}</span>}
        </div>
      </div>
    </Link>
  );
}
