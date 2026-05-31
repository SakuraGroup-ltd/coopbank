import Link from "next/link";
import { ChevronRight, Plus, MapPin, Building, Star, Clock } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";

export const dynamic = "force-dynamic";

type Branch = {
  id: string | number;
  name: string;
  type?: string;
  region?: string;
  address?: string;
  isHq?: boolean;
  comingSoon?: boolean;
  active?: boolean;
  expectedOpening?: string;
};

const TYPE_LABEL: Record<string, string> = {
  branch: "Branch",
  agency: "Agency (CoopWakala)",
  "sub-branch": "Sub-branch",
  atm: "ATM",
};

const REGION_LABEL: Record<string, string> = {
  arusha: "Arusha",
  "dar-es-salaam": "Dar es Salaam",
  dodoma: "Dodoma",
  kagera: "Kagera",
  kilimanjaro: "Kilimanjaro",
  mbeya: "Mbeya",
  mtwara: "Mtwara",
  mwanza: "Mwanza",
  tabora: "Tabora",
  other: "Other",
};

export default async function BranchesListPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "branches",
    limit: 200,
    depth: 0,
    sort: "name",
  });

  const all = result.docs.map((d) => d as unknown as Branch);
  const active = all.filter((b) => b.active !== false && !b.comingSoon);
  const soon = all.filter((b) => b.comingSoon);
  const paused = all.filter((b) => b.active === false);

  // Group by region for the live set so editors can scan their region quickly.
  const byRegion = new Map<string, Branch[]>();
  for (const b of active) {
    const r = b.region || "other";
    if (!byRegion.has(r)) byRegion.set(r, []);
    byRegion.get(r)!.push(b);
  }
  const regionEntries = Array.from(byRegion.entries()).sort((a, b) =>
    (REGION_LABEL[a[0]] || a[0]).localeCompare(REGION_LABEL[b[0]] || b[0]),
  );

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Branches</span>
      </div>

      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Branch network</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {active.length} live · {soon.length} coming soon · {paused.length} paused
            </p>
          </div>
        </div>
        <Link
          href="/studio/branches/new"
          className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
        >
          <Plus className="w-4 h-4" />
          Add branch
        </Link>
      </div>

      {soon.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider mb-1">Coming soon</h2>
          <p className="text-xs text-studio-ink-3 mb-4">Not yet operating</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {soon.map((b) => <BranchCard key={String(b.id)} branch={b} />)}
          </div>
        </section>
      )}

      {regionEntries.map(([region, list]) => (
        <section key={region} className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider">
                {REGION_LABEL[region] || region}
              </h2>
              <p className="text-xs text-studio-ink-3 mt-0.5">{list.length} location{list.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {list.map((b) => <BranchCard key={String(b.id)} branch={b} />)}
          </div>
        </section>
      ))}

      {paused.length > 0 && (
        <section className="mb-10 opacity-70">
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider mb-1">Paused</h2>
          <p className="text-xs text-studio-ink-3 mb-4">Hidden from /branches</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paused.map((b) => <BranchCard key={String(b.id)} branch={b} />)}
          </div>
        </section>
      )}

      {all.length === 0 && (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <MapPin className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No branches yet</h3>
          <p className="text-sm text-studio-ink-3">Add the first location.</p>
        </div>
      )}
    </div>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  return (
    <Link
      href={`/studio/branches/${branch.id}`}
      className="group block rounded-2xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all px-4 py-3.5 shadow-[0_1px_2px_rgba(15,15,15,0.04)]"
    >
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-lg bg-studio-soft border border-studio-border text-studio-ink-2 flex items-center justify-center shrink-0">
          <Building className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <h3 className="text-sm font-semibold text-studio-ink group-hover:text-cb-navy transition-colors truncate">
              {branch.name}
            </h3>
            {branch.isHq && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                <Star className="w-2.5 h-2.5 fill-current" />
                HQ
              </span>
            )}
          </div>
          <p className="text-xs text-studio-ink-3 truncate">
            {TYPE_LABEL[branch.type || "branch"]} {branch.address ? `· ${branch.address.split("\n")[0]}` : ""}
          </p>
          {branch.comingSoon && branch.expectedOpening && (
            <p className="text-xs text-cb-navy mt-1 inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {branch.expectedOpening}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
