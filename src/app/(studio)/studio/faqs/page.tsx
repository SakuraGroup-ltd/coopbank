import Link from "next/link";
import { ChevronRight, HelpCircle, Plus } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";

export const dynamic = "force-dynamic";

type Faq = {
  id: string | number;
  question: string;
  category?: string;
  sortOrder?: number;
  active?: boolean;
};

const CATEGORY_LABEL: Record<string, string> = {
  general: "General",
  accounts: "Accounts",
  loans: "Loans",
  cards: "Cards",
  digital: "Digital Banking",
  branches: "Branches & ATMs",
  security: "Security",
};

export default async function FaqsPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "faqs",
    limit: 500,
    depth: 0,
    sort: ["category", "sortOrder"],
  });
  const faqs = result.docs.map((d) => d as unknown as Faq);

  const grouped = new Map<string, Faq[]>();
  for (const f of faqs) {
    const k = f.category || "general";
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(f);
  }

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">FAQs</span>
      </div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">FAQs</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {faqs.length} question{faqs.length === 1 ? "" : "s"} · grouped by category · Marketing
            </p>
          </div>
        </div>
        <Link
          href="/studio/faqs/new"
          className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </Link>
      </div>

      {faqs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <HelpCircle className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No FAQs yet</h3>
          <p className="text-sm text-studio-ink-3 mb-6">Add the first customer question.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([cat, items]) => (
            <section key={cat}>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider">
                  {CATEGORY_LABEL[cat] || cat}
                </h2>
                <span className="text-xs text-studio-ink-3">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((f) => (
                  <Link
                    key={String(f.id)}
                    href={`/studio/faqs/${f.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all px-4 py-3"
                  >
                    <span className="w-6 h-6 rounded-md bg-studio-soft text-[10px] font-semibold uppercase text-studio-ink-3 flex items-center justify-center shrink-0">
                      {f.sortOrder ?? 100}
                    </span>
                    <p className="flex-1 text-sm font-medium text-studio-ink truncate group-hover:text-cb-navy transition-colors">
                      {f.question}
                    </p>
                    {f.active === false && <Badge tone="neutral">Hidden</Badge>}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
