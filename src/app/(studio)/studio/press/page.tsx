/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ChevronRight, Plus, Megaphone, Calendar } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";

export const dynamic = "force-dynamic";

type PR = {
  id: string | number;
  headline: string;
  slug?: string;
  category?: string;
  releaseDate?: string;
  summary?: string;
  updatedAt?: string;
  _status?: "draft" | "published";
};

const CATEGORY_LABEL: Record<string, string> = {
  corporate: "Corporate",
  regulatory: "Regulatory",
  financial: "Financial Results",
  leadership: "Leadership",
  agm: "AGM / Dividend",
  product: "Product Launch",
};

export default async function PressListPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "press-releases",
    limit: 200,
    depth: 0,
    draft: true,
    sort: "-releaseDate",
  });
  const items = result.docs.map((d) => d as unknown as PR);
  const drafts = items.filter((p) => p._status === "draft");
  const published = items.filter((p) => p._status !== "draft");

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Press releases</span>
      </div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Press releases</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {published.length} published · {drafts.length} draft{drafts.length === 1 ? "" : "s"} · Corporate Communications
            </p>
          </div>
        </div>
        <Link
          href="/studio/press/new"
          className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
        >
          <Plus className="w-4 h-4" />
          New release
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <Megaphone className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No releases yet</h3>
          <p className="text-sm text-studio-ink-3">Issue the first corporate announcement.</p>
        </div>
      ) : (
        <>
          {drafts.length > 0 && <PressSection title="Drafts" hint="Unpublished" list={drafts} />}
          <PressSection title="Published" hint="Live on /press" list={published} className={drafts.length > 0 ? "mt-10" : ""} />
        </>
      )}
    </div>
  );
}

function PressSection({ title, hint, list, className }: { title: string; hint: string; list: PR[]; className?: string }) {
  if (list.length === 0) return null;
  return (
    <section className={className}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider">{title}</h2>
          <p className="text-xs text-studio-ink-3 mt-0.5">{hint}</p>
        </div>
        <span className="text-xs text-studio-ink-3">{list.length}</span>
      </div>
      <div className="space-y-2.5">
        {list.map((p) => (
          <Link
            key={String(p.id)}
            href={`/studio/press/${p.id}`}
            className="group flex items-start gap-4 rounded-2xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all px-5 py-4"
          >
            <span className="w-10 h-10 rounded-lg bg-studio-soft border border-studio-border flex items-center justify-center text-studio-ink-2 shrink-0">
              <Megaphone className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-base font-semibold text-studio-ink group-hover:text-cb-navy transition-colors leading-tight">{p.headline}</h3>
                <Badge tone={p._status === "draft" ? "neutral" : "success"}>{p._status === "draft" ? "Draft" : "Published"}</Badge>
                {p.category && <Badge tone="navy">{CATEGORY_LABEL[p.category] || p.category}</Badge>}
              </div>
              <div className="flex items-center gap-3 text-xs text-studio-ink-3 mt-1">
                {p.releaseDate && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(p.releaseDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
              {p.summary && <p className="text-sm text-studio-ink-2 mt-2 line-clamp-1">{p.summary}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
