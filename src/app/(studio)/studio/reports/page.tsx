/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ChevronRight, Plus, BookText, FileText, ExternalLink } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";

export const dynamic = "force-dynamic";

type AR = {
  id: string | number;
  title: string;
  year?: number;
  kind?: string;
  publishedDate?: string;
  summary?: string;
  document?: { url?: string; filename?: string };
  cover?: { url?: string };
};

const KIND_LABEL: Record<string, string> = {
  annual: "Annual Report",
  integrated: "Integrated Report",
  interim: "Interim / Half-year",
  sustainability: "Sustainability Report",
};

export default async function ReportsPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "annual-reports",
    limit: 200,
    depth: 1,
    sort: "-year",
  });
  const reports = result.docs.map((d) => d as unknown as AR);

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Annual reports</span>
      </div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <BookText className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Annual reports</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {reports.length} report{reports.length === 1 ? "" : "s"} · published to investors
            </p>
          </div>
        </div>
        <Link href="/studio/reports/new" className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium">
          <Plus className="w-4 h-4" />
          Add report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <BookText className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No reports yet</h3>
          <p className="text-sm text-studio-ink-3 mb-6">Upload the first annual report PDF.</p>
          <Link href="/studio/reports/new" className="inline-flex h-9 px-4 text-sm items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium">
            <Plus className="w-4 h-4" />
            Upload first report
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => (
            <Link
              key={String(r.id)}
              href={`/studio/reports/${r.id}`}
              className="group block rounded-2xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all overflow-hidden"
            >
              <div className="aspect-[16/10] bg-studio-soft relative">
                {r.cover?.url ? (
                  <img src={r.cover.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-studio-ink-3">
                    <BookText className="w-12 h-12 opacity-30" />
                  </div>
                )}
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-cb-navy text-white text-xs font-bold px-2.5 py-1 rounded">
                  {r.year}
                </span>
              </div>
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-cb-navy mb-1">
                  {KIND_LABEL[r.kind || "annual"]}
                </p>
                <h3 className="text-base font-semibold text-studio-ink leading-tight mb-2 line-clamp-2">{r.title}</h3>
                {r.summary && <p className="text-xs text-studio-ink-3 line-clamp-2 mb-2">{r.summary}</p>}
                {r.document?.url && (
                  <p className="text-[11px] text-studio-ink-3 inline-flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    PDF attached
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
