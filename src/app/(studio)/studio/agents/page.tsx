import Link from "next/link";
import { ChevronRight, Plus, Store, MapPin } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

type Agent = {
  id: string | number;
  name: string;
  region?: string;
  district?: string;
  ward?: string;
  street?: string;
  active?: boolean;
};

export default async function AgentsListPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "coopwakala-agents",
    limit: 1000,
    depth: 0,
    sort: "name",
  });

  const all = result.docs.map((d) => d as unknown as Agent);
  const live = all.filter((a) => a.active !== false);
  const hidden = all.filter((a) => a.active === false);

  const byRegion = new Map<string, Agent[]>();
  for (const a of live) {
    const r = a.region || "Other";
    if (!byRegion.has(r)) byRegion.set(r, []);
    byRegion.get(r)!.push(a);
  }
  const regionEntries = Array.from(byRegion.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Agents</span>
      </div>

      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <Store className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">CoopWakala agents</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {live.length} live{hidden.length ? ` · ${hidden.length} hidden` : ""}
            </p>
          </div>
        </div>
        <Link
          href="/studio/agents/new"
          className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
        >
          <Plus className="w-4 h-4" />
          Add agent
        </Link>
      </div>

      {regionEntries.map(([region, list]) => (
        <section key={region} className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider">{region}</h2>
              <p className="text-xs text-studio-ink-3 mt-0.5">{list.length} agent{list.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map((a) => <AgentCard key={String(a.id)} agent={a} />)}
          </div>
        </section>
      ))}

      {hidden.length > 0 && (
        <section className="mb-10 opacity-70">
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider mb-1">Hidden</h2>
          <p className="text-xs text-studio-ink-3 mb-4">Not shown on the public directory</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {hidden.map((a) => <AgentCard key={String(a.id)} agent={a} />)}
          </div>
        </section>
      )}

      {all.length === 0 && (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <Store className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No agents yet</h3>
          <p className="text-sm text-studio-ink-3">Add the first CoopWakala agent, or run the seed to import the existing list.</p>
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const loc = [agent.ward, agent.district].filter(Boolean).join(", ");
  return (
    <Link
      href={`/studio/agents/${agent.id}`}
      className="group block rounded-2xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all px-4 py-3.5 shadow-[0_1px_2px_rgba(15,15,15,0.04)]"
    >
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-lg bg-studio-soft border border-studio-border text-studio-ink-2 flex items-center justify-center shrink-0">
          <Store className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-studio-ink group-hover:text-cb-navy transition-colors truncate mb-0.5">
            {agent.name}
          </h3>
          <p className="text-xs text-studio-ink-3 truncate inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {loc || agent.street || "—"}
          </p>
        </div>
      </div>
    </Link>
  );
}
