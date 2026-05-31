import Link from "next/link";
import { ChevronRight, Banknote } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { FeesGrid, type Fee } from "@/components/studio/fees/FeesGrid";

export const dynamic = "force-dynamic";

export default async function FeesPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "service-fees",
    limit: 500,
    depth: 0,
    sort: "category",
  });
  const fees: Fee[] = result.docs.map((d) => {
    const r = d as unknown as Fee;
    return {
      id: r.id,
      serviceName: r.serviceName,
      category: r.category || "other",
      feeLabel: r.feeLabel || "",
      feeValue: r.feeValue,
      vatInclusive: r.vatInclusive !== false,
      effectiveFrom: r.effectiveFrom?.slice(0, 10) || "",
      notes: r.notes || "",
      active: r.active !== false,
    } as Fee;
  });

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Service fees</span>
      </div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Service fees</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {fees.length} fee{fees.length === 1 ? "" : "s"} · public schedule under BoT rules
            </p>
          </div>
        </div>
      </div>
      <FeesGrid initial={fees} />
    </div>
  );
}
