import {
  Briefcase,
  Calendar,
  FileText,
  Newspaper,
  ScrollText,
  ShieldAlert,
  TrendingUp,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { getPayload } from "payload";
import config from "../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/studio/ui/Card";
import { Button } from "@/components/studio/ui/Button";
import { Badge } from "@/components/studio/ui/Badge";
import { Stat } from "@/components/studio/ui/Stat";

export const dynamic = "force-dynamic";

// Helpers for the "needs attention" queue. Decoupled so adding a new
// signal later is local to this file.
function daysUntil(date: string | Date): number {
  const target = new Date(date).getTime();
  const now = Date.now();
  return Math.floor((target - now) / (1000 * 60 * 60 * 24));
}

function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function StudioDashboard() {
  const user = await requireStudioUser();
  const payload = await getPayload({ config });

  // Parallel reads — Payload local API, no HTTP roundtrip.
  const [tendersAll, jobsAll, blogDrafts, forexAll, whistleblowerNew] =
    await Promise.all([
      payload.find({ collection: "tenders", limit: 100, depth: 0 }),
      payload.find({ collection: "job-listings", limit: 100, depth: 0 }),
      payload.find({
        collection: "blog-posts",
        limit: 5,
        depth: 0,
        where: { _status: { equals: "draft" } },
        sort: "-updatedAt",
      }),
      payload.find({
        collection: "forex-rates",
        limit: 10,
        depth: 0,
        sort: "-updatedDate",
      }),
      payload.find({
        collection: "whistleblower-reports",
        limit: 5,
        depth: 0,
        where: { status: { equals: "new" } },
        sort: "-submittedAt",
      }).catch(() => ({ docs: [], totalDocs: 0 })),
    ]);

  // Derive surface metrics from the raw collections so the dashboard
  // is one source of truth (no double-counting between widgets).
  const today = new Date();
  const tendersOpen = tendersAll.docs.filter((t) => {
    const close = (t as unknown as { closingDate?: string }).closingDate;
    return close && new Date(close) >= today;
  });
  const tendersClosingThisWeek = tendersOpen.filter(
    (t) => daysUntil((t as unknown as { closingDate: string }).closingDate) <= 7,
  );
  const jobsActive = jobsAll.docs.filter((j) => {
    const apply = (j as unknown as { applyByDate?: string }).applyByDate;
    return apply && new Date(apply) >= today;
  });
  const jobsExpiringThisWeek = jobsActive.filter(
    (j) => daysUntil((j as unknown as { applyByDate: string }).applyByDate) <= 7,
  );
  const lastForex = forexAll.docs[0] as
    | { updatedDate?: string; currencyCode?: string }
    | undefined;
  const forexStale = lastForex?.updatedDate
    ? daysUntil(lastForex.updatedDate) <= -2
    : true;
  const newReports = (whistleblowerNew as { docs: unknown[] }).docs.length;

  // Build the "needs attention" queue across departments.
  type Signal = {
    icon: typeof Briefcase;
    title: string;
    detail: string;
    href: string;
    tone: "warning" | "danger" | "neutral" | "navy";
    when: string;
  };
  const queue: Signal[] = [];
  for (const t of tendersClosingThisWeek.slice(0, 3)) {
    const close = (t as unknown as { closingDate: string; title: string; tenderRef?: string }).closingDate;
    queue.push({
      icon: ScrollText,
      title: (t as unknown as { title: string }).title,
      detail: `Tender ${(t as { tenderRef?: string }).tenderRef || ""} closes ${close.slice(0, 10)}`,
      href: `/studio/tenders/${(t as unknown as { id: string }).id}`,
      tone: daysUntil(close) <= 2 ? "danger" : "warning",
      when: `${daysUntil(close)}d left`,
    });
  }
  for (const j of jobsExpiringThisWeek.slice(0, 2)) {
    const apply = (j as unknown as { applyByDate: string; jobTitle: string }).applyByDate;
    queue.push({
      icon: Briefcase,
      title: (j as unknown as { jobTitle: string }).jobTitle,
      detail: `Apply-by ${apply.slice(0, 10)}`,
      href: `/studio/jobs/${(j as unknown as { id: string }).id}`,
      tone: "warning",
      when: `${daysUntil(apply)}d left`,
    });
  }
  if (forexStale) {
    queue.push({
      icon: TrendingUp,
      title: "Forex rates need a refresh",
      detail: lastForex?.updatedDate
        ? `Last updated ${lastForex.updatedDate.slice(0, 10)}`
        : "No rates recorded yet",
      href: "/studio/forex",
      tone: "danger",
      when: "now",
    });
  }
  for (const r of (whistleblowerNew as { docs: unknown[] }).docs.slice(0, 2)) {
    const rep = r as { subject: string; caseRef?: string; submittedAt: string; id: string };
    queue.push({
      icon: ShieldAlert,
      title: rep.subject,
      detail: `${rep.caseRef || "Whistleblower case"} — ${timeAgo(rep.submittedAt)}`,
      href: `/studio/whistleblower/${rep.id}`,
      tone: "navy",
      when: "new",
    });
  }

  // Recent activity — combine latest changes across collections for a feed.
  const [recentPages, recentBlog] = await Promise.all([
    payload.find({ collection: "pages", limit: 4, depth: 0, sort: "-updatedAt" }),
    payload.find({ collection: "blog-posts", limit: 4, depth: 0, sort: "-updatedAt" }),
  ]);
  type Activity = {
    type: string;
    title: string;
    href: string;
    at: string;
    status?: string;
  };
  const activity: Activity[] = [];
  for (const p of recentPages.docs) {
    const pg = p as { title: string; id: string; updatedAt: string; _status?: string };
    activity.push({
      type: "Page",
      title: pg.title,
      href: `/studio/pages/${pg.id}`,
      at: pg.updatedAt,
      status: pg._status,
    });
  }
  for (const b of recentBlog.docs) {
    const bp = b as { title: string; id: string; updatedAt: string; _status?: string };
    activity.push({
      type: "Blog",
      title: bp.title,
      href: `/studio/blog/${bp.id}`,
      at: bp.updatedAt,
      status: bp._status,
    });
  }
  activity.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.1em] font-semibold text-studio-ink-3">
            Today · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-2xl font-semibold text-studio-ink mt-1">
            Good {hourOfDayGreeting()}, {user.name?.split(" ")[0] || "there"}.
          </h1>
          <p className="text-sm text-studio-ink-3 mt-1">
            Here&apos;s what needs attention across the bank&apos;s content.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg border border-studio-border bg-studio-panel hover:bg-studio-soft text-studio-ink font-medium"
          >
            View site
          </Link>
          <Link
            href="/studio/blog/new"
            className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg border border-studio-ink bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
          >
            <Plus className="w-4 h-4" />
            New post
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Stat
          label="Open tenders"
          value={tendersOpen.length}
          hint={`${tendersClosingThisWeek.length} closing this week`}
          icon={<ScrollText className="w-4 h-4" />}
        />
        <Stat
          label="Active jobs"
          value={jobsActive.length}
          hint={`${jobsExpiringThisWeek.length} expiring soon`}
          icon={<Briefcase className="w-4 h-4" />}
        />
        <Stat
          label="Blog drafts"
          value={blogDrafts.docs.length}
          hint="Unpublished"
          icon={<Newspaper className="w-4 h-4" />}
        />
        <Stat
          label="FX last updated"
          value={
            lastForex?.updatedDate
              ? new Date(lastForex.updatedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
              : "—"
          }
          hint={lastForex?.currencyCode || "no data"}
          trend={
            forexStale
              ? { label: "Update needed", tone: "down" }
              : { label: "Up to date", tone: "up" }
          }
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <Stat
          label="New cases"
          value={newReports}
          hint="Whistleblower — needs triage"
          icon={<ShieldAlert className="w-4 h-4" />}
        />
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs attention */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-baseline justify-between pb-3">
            <div>
              <CardTitle>Needs attention</CardTitle>
              <p className="text-xs text-studio-ink-3 mt-1">
                Closing tenders, expiring jobs, stale rates, and new cases.
              </p>
            </div>
            <Badge tone="navy">{queue.length}</Badge>
          </CardHeader>
          <CardContent className="pt-0">
            {queue.length === 0 ? (
              <div className="text-center py-12 px-6">
                <p className="text-sm text-studio-ink-2">
                  All caught up. Nothing urgent right now.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-studio-border">
                {queue.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={i}>
                      <Link
                        href={s.href}
                        className="flex items-center gap-4 py-3 px-1 -mx-1 rounded-lg hover:bg-studio-soft transition-colors group"
                      >
                        <span className="w-9 h-9 rounded-lg bg-studio-soft border border-studio-border flex items-center justify-center text-studio-ink-2 shrink-0">
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-studio-ink truncate">
                            {s.title}
                          </p>
                          <p className="text-xs text-studio-ink-3 truncate">{s.detail}</p>
                        </div>
                        <Badge tone={s.tone}>{s.when}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <p className="text-xs text-studio-ink-3 mt-1">Common daily tasks.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              href="/studio/forex"
              icon={<TrendingUp className="w-4 h-4" />}
              label="Update today's FX rates"
              hint="Treasury · 1-2 min"
            />
            <QuickAction
              href="/studio/blog/new"
              icon={<Newspaper className="w-4 h-4" />}
              label="Write a blog post"
              hint="Marketing"
            />
            <QuickAction
              href="/studio/jobs/new"
              icon={<Briefcase className="w-4 h-4" />}
              label="Post a job opening"
              hint="HR"
            />
            <QuickAction
              href="/studio/tenders/new"
              icon={<ScrollText className="w-4 h-4" />}
              label="Open a new tender"
              hint="Procurement"
            />
            <QuickAction
              href="/studio/whistleblower"
              icon={<ShieldAlert className="w-4 h-4" />}
              label="Triage whistleblower cases"
              hint="Compliance"
            />
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex items-baseline justify-between">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <p className="text-xs text-studio-ink-3 mt-1">Last edits across the bank.</p>
            </div>
            <Link
              href="/studio/activity"
              className="text-xs font-medium text-cb-navy hover:text-cb-green"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {activity.length === 0 ? (
              <p className="text-sm text-studio-ink-3 py-6 text-center">
                No recent edits.
              </p>
            ) : (
              <ul className="divide-y divide-studio-border">
                {activity.slice(0, 6).map((a, i) => (
                  <li key={i}>
                    <Link
                      href={a.href}
                      className="flex items-center gap-4 py-3 px-1 -mx-1 rounded-lg hover:bg-studio-soft transition-colors"
                    >
                      <span className="w-9 h-9 rounded-lg bg-studio-soft border border-studio-border flex items-center justify-center text-studio-ink-2 shrink-0">
                        {a.type === "Blog" ? (
                          <Newspaper className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-studio-ink truncate">{a.title}</p>
                        <p className="text-xs text-studio-ink-3">
                          {a.type} · {timeAgo(a.at)}
                        </p>
                      </div>
                      {a.status && (
                        <Badge tone={a.status === "published" ? "success" : "neutral"}>
                          {a.status}
                        </Badge>
                      )}
                      <Calendar className="w-3.5 h-3.5 text-studio-ink-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function hourOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function QuickAction({
  href,
  icon,
  label,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:bg-studio-soft transition-colors group"
    >
      <span className="w-8 h-8 rounded-lg bg-cb-navy/8 text-cb-navy flex items-center justify-center">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-studio-ink truncate">{label}</span>
        <span className="block text-[11px] text-studio-ink-3">{hint}</span>
      </span>
      <Plus className="w-3.5 h-3.5 text-studio-ink-3 group-hover:text-cb-navy" />
    </Link>
  );
}
