import Link from "next/link";
import { ChevronRight, Plus, FileWarning, Calendar } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";

export const dynamic = "force-dynamic";

type SN = {
  id: string | number;
  title: string;
  kind?: string;
  summary?: string;
  effectiveDate?: string;
  expiryDate?: string;
  active?: boolean;
};

const KIND_LABEL: Record<string, string> = {
  rate: "Rate change",
  tc: "Terms & Conditions",
  aml: "AML / CFT",
  dormant: "Dormant accounts",
  regulatory: "Regulatory disclosure",
  privacy: "Data protection",
  availability: "Service availability",
  other: "Other",
};

export default async function NoticesPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "statutory-notices",
    limit: 200,
    depth: 0,
    sort: "-effectiveDate",
  });
  const notices = result.docs.map((d) => d as unknown as SN);

  const now = Date.now();
  const live = notices.filter((n) => n.active !== false && (!n.expiryDate || new Date(n.expiryDate).getTime() >= now));
  const expired = notices.filter((n) => n.expiryDate && new Date(n.expiryDate).getTime() < now);
  const retracted = notices.filter((n) => n.active === false);

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Statutory notices</span>
      </div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <FileWarning className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Statutory notices</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {live.length} live · {expired.length} expired · {retracted.length} retracted · Compliance
            </p>
          </div>
        </div>
        <Link href="/admin/collections/statutory-notices/create" className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium">
          <Plus className="w-4 h-4" />
          Issue notice
        </Link>
      </div>

      {notices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <FileWarning className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No notices yet</h3>
        </div>
      ) : (
        <>
          <Sec title="Live" items={live} />
          <Sec title="Expired" items={expired} dim className="mt-10" />
          <Sec title="Retracted" items={retracted} dim className="mt-10" />
        </>
      )}
    </div>
  );
}

function Sec({ title, items, className, dim }: { title: string; items: SN[]; className?: string; dim?: boolean }) {
  if (items.length === 0) return null;
  return (
    <section className={className}>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider">{title}</h2>
        <span className="text-xs text-studio-ink-3">{items.length}</span>
      </div>
      <div className={`space-y-2.5 ${dim ? "opacity-70" : ""}`}>
        {items.map((n) => (
          <Link
            key={String(n.id)}
            href={`/admin/collections/statutory-notices/${n.id}`}
            className="group flex items-start gap-4 rounded-2xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 transition-all px-5 py-4"
          >
            <span className="w-10 h-10 rounded-lg bg-studio-soft border border-studio-border flex items-center justify-center text-studio-ink-2 shrink-0">
              <FileWarning className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-base font-semibold text-studio-ink group-hover:text-cb-navy transition-colors">{n.title}</h3>
                <Badge tone="navy">{KIND_LABEL[n.kind || "other"]}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-studio-ink-3 mt-1 flex-wrap">
                {n.effectiveDate && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Effective {n.effectiveDate.slice(0, 10)}
                  </span>
                )}
                {n.expiryDate && <span>· Expires {n.expiryDate.slice(0, 10)}</span>}
              </div>
              {n.summary && <p className="text-sm text-studio-ink-2 mt-2 line-clamp-2">{n.summary}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
