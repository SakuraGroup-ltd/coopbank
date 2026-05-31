import Link from "next/link";
import { ChevronRight, History, FileText, Newspaper, Briefcase, ScrollText, Megaphone } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";

export const dynamic = "force-dynamic";

// Surfaces recent edits across every versioned collection — the bank-grade
// audit trail required by BoT for content governance. Right now it covers
// the four collections that have `versions.drafts = true` enabled.

type Event = {
  collection: string;
  collectionLabel: string;
  icon: typeof FileText;
  href: string;
  title: string;
  status: string;
  when: string;
  editor?: { name?: string; email?: string };
};

const COLLECTIONS = [
  { slug: "pages", label: "Pages", icon: ScrollText, titleField: "title" },
  { slug: "blog-posts", label: "Blog", icon: Newspaper, titleField: "title" },
  { slug: "tenders", label: "Tender", icon: ScrollText, titleField: "title" },
  { slug: "job-listings", label: "Job", icon: Briefcase, titleField: "jobTitle" },
  { slug: "press-releases", label: "Press release", icon: Megaphone, titleField: "headline" },
] as const;

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function ActivityPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });

  const all = await Promise.all(
    COLLECTIONS.map(async (c) => {
      const result = await payload
        .find({
          collection: c.slug as never,
          limit: 30,
          // Populate `updatedBy` so we can show the editor name
          depth: 1,
          draft: true,
          sort: "-updatedAt",
        })
        .catch(() => ({ docs: [] as unknown[] }));
      return (result.docs as unknown[]).map((d) => {
        const r = d as Record<string, unknown>;
        const slugPath = c.slug === "blog-posts" ? "blog" : c.slug === "job-listings" ? "jobs" : c.slug === "tenders" ? "tenders" : c.slug === "press-releases" ? "press" : c.slug;
        const editorObj = r.updatedBy as { name?: string; email?: string } | undefined;
        return {
          collection: c.slug,
          collectionLabel: c.label,
          icon: c.icon,
          href: `/studio/${slugPath}/${r.id}`,
          title: (r[c.titleField] as string) || "Untitled",
          status: (r._status as string) || "published",
          when: (r.updatedAt as string) || (r.createdAt as string) || new Date().toISOString(),
          editor: editorObj ? { name: editorObj.name, email: editorObj.email } : undefined,
        } as Event;
      });
    }),
  );

  const events = all.flat().sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime()).slice(0, 100);

  // Group by day
  const byDay = new Map<string, Event[]>();
  for (const e of events) {
    const day = new Date(e.when).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(e);
  }

  return (
    <div className="p-8 lg:p-10 max-w-[1100px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Activity</span>
      </div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <History className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Activity log</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              Recent edits across versioned content. Audit-grade — every save creates a version that&apos;s queryable forever.
            </p>
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <History className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No activity yet</h3>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(byDay.entries()).map(([day, items]) => (
            <section key={day}>
              <h2 className="text-xs uppercase tracking-[0.1em] font-semibold text-studio-ink-3 mb-3">{day}</h2>
              <div className="rounded-2xl border border-studio-border bg-studio-panel divide-y divide-studio-border overflow-hidden">
                {items.map((e, i) => {
                  const Icon = e.icon;
                  return (
                    <Link key={i} href={e.href} className="flex items-center gap-4 px-5 py-3.5 hover:bg-studio-soft transition-colors">
                      <span className="w-9 h-9 rounded-lg bg-studio-soft border border-studio-border flex items-center justify-center text-studio-ink-2 shrink-0">
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-studio-ink truncate">{e.title}</p>
                        <p className="text-xs text-studio-ink-3">
                          {e.collectionLabel} · {timeAgo(e.when)}
                          {e.editor && (
                            <>
                              {" · by "}
                              <span className="text-studio-ink-2 font-medium">
                                {e.editor.name || e.editor.email || "—"}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <Badge tone={e.status === "published" ? "success" : "neutral"}>{e.status}</Badge>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
