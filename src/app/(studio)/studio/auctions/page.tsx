import Link from "next/link";
import { ChevronRight, Landmark, Plus, Calendar } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";
import { cn } from "@/components/studio/ui/cn";

export const dynamic = "force-dynamic";

type Auction = {
  id: string | number;
  instrument: string;
  tenor: string;
  auctionDate?: string;
  valueDate?: string;
  maturityDate?: string;
  status?: string;
  active?: boolean;
};

const STATUS_TONE: Record<string, "neutral" | "warning" | "success" | "navy" | "danger"> = {
  upcoming: "navy",
  open: "warning",
  completed: "success",
  cancelled: "neutral",
};

export default async function AuctionsPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "auctions",
    limit: 200,
    depth: 0,
    sort: "auctionDate",
  });
  const auctions = result.docs.map((d) => d as unknown as Auction);
  const upcoming = auctions.filter((a) => a.status === "upcoming");
  const open = auctions.filter((a) => a.status === "open");
  const completed = auctions.filter((a) => a.status === "completed");

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Auctions</span>
      </div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Government Securities Auctions</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {open.length} open · {upcoming.length} upcoming · {completed.length} completed · Treasury
            </p>
          </div>
        </div>
        <Link
          href="/studio/auctions/new"
          className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
        >
          <Plus className="w-4 h-4" />
          Add auction
        </Link>
      </div>

      {auctions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <Landmark className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No auctions yet</h3>
          <p className="text-sm text-studio-ink-3 mb-6">Add the next BOT auction to surface it on /treasury/government-securities.</p>
          <Link
            href="/studio/auctions/new"
            className="inline-flex h-9 px-4 text-sm items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
          >
            <Plus className="w-4 h-4" />
            Add first auction
          </Link>
        </div>
      ) : (
        <>
          <Section title="Open for bids" hint="Accepting now" auctions={open} />
          <Section title="Upcoming" hint="Scheduled" auctions={upcoming} className="mt-10" />
          <Section title="Completed" hint="Archive" auctions={completed} className="mt-10" dim />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  auctions,
  className,
  dim,
}: {
  title: string;
  hint: string;
  auctions: Auction[];
  className?: string;
  dim?: boolean;
}) {
  if (auctions.length === 0) return null;
  return (
    <section className={className}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider">{title}</h2>
          <p className="text-xs text-studio-ink-3 mt-0.5">{hint}</p>
        </div>
        <span className="text-xs text-studio-ink-3">{auctions.length}</span>
      </div>
      <div className={cn("space-y-2.5", dim && "opacity-70")}>
        {auctions.map((a) => (
          <Link
            key={String(a.id)}
            href={`/studio/auctions/${a.id}`}
            className="group flex items-center gap-4 rounded-2xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all px-5 py-4 shadow-[0_1px_2px_rgba(15,15,15,0.04)]"
          >
            <span className="w-10 h-10 rounded-lg bg-studio-soft border border-studio-border flex items-center justify-center text-studio-ink-2 shrink-0">
              <Landmark className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-studio-ink group-hover:text-cb-navy transition-colors truncate">
                  {a.instrument}
                </h3>
                <Badge tone="navy">{a.tenor}</Badge>
                {a.status && (
                  <Badge tone={STATUS_TONE[a.status] || "neutral"}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-studio-ink-3 mt-1 flex-wrap">
                {a.auctionDate && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Auction {a.auctionDate.slice(0, 10)}
                  </span>
                )}
                {a.maturityDate && <span>· Matures {a.maturityDate.slice(0, 10)}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
