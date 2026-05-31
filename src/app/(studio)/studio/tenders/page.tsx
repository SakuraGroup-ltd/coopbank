import Link from "next/link";
import {
  ChevronRight,
  Plus,
  ScrollText,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";
import { cn } from "@/components/studio/ui/cn";

export const dynamic = "force-dynamic";

type Tender = {
  id: string | number;
  tenderRef: string;
  title: string;
  category?: string;
  contractType?: string;
  publishedDate?: string;
  closingDate?: string;
  document?: { id?: string | number; url?: string; filename?: string };
  updatedAt?: string;
  _status?: "draft" | "published";
};

const CATEGORY_LABEL: Record<string, string> = {
  "it-equipment": "IT Equipment",
  "it-services": "IT Services",
  construction: "Construction",
  services: "Services",
  goods: "Goods",
  consultancy: "Consultancy",
};

const CONTRACT_LABEL: Record<string, string> = {
  supply: "Supply",
  "supply-install": "Supply & Install",
  service: "Service Contract",
  construction: "Construction Works",
  consulting: "Consulting Services",
};

function daysUntil(date?: string): number | null {
  if (!date) return null;
  return Math.floor((new Date(date).getTime() - Date.now()) / 86_400_000);
}

export default async function TendersListPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "tenders",
    limit: 100,
    depth: 1,
    draft: true,
    sort: "-updatedAt",
  });

  const tenders = result.docs.map((d) => d as unknown as Tender);
  const today = Date.now();
  const open = tenders.filter(
    (t) => t.closingDate && new Date(t.closingDate).getTime() >= today,
  );
  const closed = tenders.filter(
    (t) => t.closingDate && new Date(t.closingDate).getTime() < today,
  );
  const drafts = tenders.filter((t) => t._status === "draft");

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Tenders</span>
      </div>

      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <ScrollText className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Tenders</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {open.length} open · {drafts.length} draft{drafts.length === 1 ? "" : "s"} · {closed.length} closed · Procurement
            </p>
          </div>
        </div>
        <Link
          href="/studio/tenders/new"
          className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New tender
        </Link>
      </div>

      {tenders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <ScrollText className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No tenders yet</h3>
          <p className="text-sm text-studio-ink-3 mb-6">Open the first procurement notice.</p>
          <Link
            href="/studio/tenders/new"
            className="inline-flex h-9 px-4 text-sm items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
          >
            <Plus className="w-4 h-4" />
            Open first tender
          </Link>
        </div>
      ) : (
        <>
          {drafts.length > 0 && (
            <Section title="Drafts" hint="Not yet published" tenders={drafts.filter((t) => t._status === "draft")} />
          )}
          {open.length > 0 && (
            <Section
              title="Open"
              hint="Accepting bids"
              tenders={open.filter((t) => t._status !== "draft")}
              className={drafts.length > 0 ? "mt-10" : ""}
            />
          )}
          {closed.length > 0 && (
            <Section
              title="Closed"
              hint="Bid window has passed"
              tenders={closed}
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
  tenders,
  className,
  dim,
}: {
  title: string;
  hint: string;
  tenders: Tender[];
  className?: string;
  dim?: boolean;
}) {
  if (tenders.length === 0) return null;
  return (
    <section className={className}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider">{title}</h2>
          <p className="text-xs text-studio-ink-3 mt-0.5">{hint}</p>
        </div>
        <span className="text-xs text-studio-ink-3">{tenders.length}</span>
      </div>
      <div className={cn("space-y-2.5", dim && "opacity-70")}>
        {tenders.map((t) => <TenderRow key={String(t.id)} tender={t} />)}
      </div>
    </section>
  );
}

function TenderRow({ tender }: { tender: Tender }) {
  const days = daysUntil(tender.closingDate);
  const urgent = days !== null && days >= 0 && days <= 7;
  const closed = days !== null && days < 0;
  return (
    <Link
      href={`/studio/tenders/${tender.id}`}
      className="group flex items-start gap-4 rounded-2xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all px-5 py-4 shadow-[0_1px_2px_rgba(15,15,15,0.04)]"
    >
      <span className="w-10 h-10 rounded-lg bg-studio-soft border border-studio-border flex items-center justify-center text-studio-ink-2 shrink-0">
        <ScrollText className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-mono text-cb-navy bg-cb-navy/8 px-1.5 py-0.5 rounded">
            {tender.tenderRef}
          </span>
          <h3 className="text-base font-semibold text-studio-ink group-hover:text-cb-navy transition-colors leading-tight">
            {tender.title}
          </h3>
          <Badge tone={tender._status === "draft" ? "neutral" : "success"}>
            {tender._status === "draft" ? "Draft" : "Published"}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-studio-ink-3 mt-1 flex-wrap">
          {tender.category && <span>{CATEGORY_LABEL[tender.category] || tender.category}</span>}
          {tender.contractType && (
            <span>· {CONTRACT_LABEL[tender.contractType] || tender.contractType}</span>
          )}
          {tender.closingDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Closes {new Date(tender.closingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
          {tender.document?.url && (
            <span className="inline-flex items-center gap-1 text-cb-navy">
              <FileText className="w-3 h-3" />
              PDF attached
            </span>
          )}
        </div>
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
