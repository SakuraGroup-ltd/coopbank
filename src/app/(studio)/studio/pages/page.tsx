/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ChevronRight, Plus, ScrollText, ExternalLink } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";

export const dynamic = "force-dynamic";

type Page = {
  id: string | number;
  title: string;
  slug?: string;
  updatedAt?: string;
  _status?: "draft" | "published";
  layout?: Array<{ blockType: string }>;
};

function timeAgo(date?: string): string {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function PagesListPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "pages",
    limit: 200,
    depth: 0,
    draft: true,
    sort: "title",
  });

  const pages = result.docs.map((d) => d as unknown as Page);
  const drafts = pages.filter((p) => p._status === "draft");
  const published = pages.filter((p) => p._status !== "draft");

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Pages</span>
      </div>

      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <ScrollText className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Pages</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {published.length} published · {drafts.length} draft{drafts.length === 1 ? "" : "s"} · Compose any page from blocks
            </p>
          </div>
        </div>
        <Link
          href="/studio/pages/new"
          className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
        >
          <Plus className="w-4 h-4" />
          New page
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <ScrollText className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No pages yet</h3>
          <p className="text-sm text-studio-ink-3 mb-6">Build the first marketing page.</p>
          <Link
            href="/studio/pages/new"
            className="inline-flex h-9 px-4 text-sm items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
          >
            <Plus className="w-4 h-4" />
            Build a page
          </Link>
        </div>
      ) : (
        <>
          {drafts.length > 0 && (
            <Section title="Drafts" hint="Unfinished" pages={drafts} />
          )}
          <Section title="Published" hint="Live on the site" pages={published} className={drafts.length > 0 ? "mt-10" : ""} />
        </>
      )}
    </div>
  );
}

function Section({ title, hint, pages, className }: { title: string; hint: string; pages: Page[]; className?: string }) {
  if (pages.length === 0) return null;
  return (
    <section className={className}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider">{title}</h2>
          <p className="text-xs text-studio-ink-3 mt-0.5">{hint}</p>
        </div>
        <span className="text-xs text-studio-ink-3">{pages.length}</span>
      </div>
      <div className="space-y-2.5">
        {pages.map((p) => <PageRow key={String(p.id)} page={p} />)}
      </div>
    </section>
  );
}

function PageRow({ page }: { page: Page }) {
  const blockCount = page.layout?.length || 0;
  // Use a div wrapper with two siblings so we don't nest <a> inside <a>
  // and don't need an onClick handler in a server component.
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all px-5 py-4 shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
      <Link
        href={`/studio/pages/${page.id}`}
        className="flex items-center gap-4 flex-1 min-w-0"
      >
        <span className="w-10 h-10 rounded-lg bg-studio-soft border border-studio-border flex items-center justify-center text-studio-ink-2 shrink-0">
          <ScrollText className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-base font-semibold text-studio-ink group-hover:text-cb-navy transition-colors truncate">
              {page.title}
            </h3>
            <Badge tone={page._status === "draft" ? "neutral" : "success"}>
              {page._status === "draft" ? "Draft" : "Published"}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-studio-ink-3 mt-1">
            <span className="font-mono">/{page.slug}</span>
            <span>· {blockCount} block{blockCount === 1 ? "" : "s"}</span>
            {page.updatedAt && <span>· {timeAgo(page.updatedAt)}</span>}
          </div>
        </div>
      </Link>
      {page.slug && (
        <a
          href={`/preview/${page.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 text-xs text-studio-ink-3 hover:text-cb-navy px-2 py-1 rounded-md hover:bg-studio-soft"
        >
          <ExternalLink className="w-3 h-3" />
          Preview
        </a>
      )}
    </div>
  );
}
