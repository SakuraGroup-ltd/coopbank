/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ChevronRight, Plus, Users2, Mail, Linkedin } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Avatar } from "@/components/studio/ui/Avatar";

export const dynamic = "force-dynamic";

type Person = {
  id: string | number;
  name: string;
  title: string;
  category?: string;
  photo?: { url?: string };
  bio?: string;
  email?: string;
  linkedin?: string;
  sortOrder?: number;
  active?: boolean;
};

const CATEGORY_LABEL: Record<string, string> = {
  board: "Board of Directors",
  executive: "Executive Management",
  senior: "Senior Management",
  advisory: "Advisory",
};

const CATEGORY_ORDER = ["board", "executive", "senior", "advisory"];

export default async function LeadershipPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "leadership-team",
    limit: 200,
    depth: 1,
    sort: ["category", "sortOrder"],
  });
  const people = result.docs.map((d) => d as unknown as Person);

  const grouped = new Map<string, Person[]>();
  for (const p of people) {
    const k = p.category || "executive";
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(p);
  }

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Leadership</span>
      </div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <Users2 className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Leadership</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {people.length} profile{people.length === 1 ? "" : "s"} · board + executive
            </p>
          </div>
        </div>
        <Link href="/studio/team-leadership/new" className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium">
          <Plus className="w-4 h-4" />
          Add profile
        </Link>
      </div>

      {people.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <Users2 className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No profiles yet</h3>
        </div>
      ) : (
        <div className="space-y-10">
          {CATEGORY_ORDER.filter((c) => grouped.has(c)).map((cat) => {
            const items = grouped.get(cat) || [];
            return (
              <section key={cat}>
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider">{CATEGORY_LABEL[cat]}</h2>
                  <span className="text-xs text-studio-ink-3">{items.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((p) => (
                    <Link
                      key={String(p.id)}
                      href={`/studio/team-leadership/${p.id}`}
                      className="group block rounded-2xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all overflow-hidden"
                    >
                      <div className="aspect-square bg-studio-soft relative overflow-hidden">
                        {p.photo?.url ? (
                          <img src={p.photo.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Avatar name={p.name} size={64} />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-base font-semibold text-studio-ink leading-tight">{p.name}</h3>
                        <p className="text-xs text-studio-ink-3 mt-0.5 line-clamp-2">{p.title}</p>
                        <div className="flex items-center gap-2 mt-3">
                          {p.email && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-studio-ink-3">
                              <Mail className="w-3 h-3" />
                            </span>
                          )}
                          {p.linkedin && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-studio-ink-3">
                              <Linkedin className="w-3 h-3" />
                            </span>
                          )}
                          {p.active === false && <span className="text-[10px] text-studio-ink-3 ml-auto">Hidden</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
