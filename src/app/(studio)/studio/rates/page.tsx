import Link from "next/link";
import { ChevronRight, Percent } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { RatesGrid, type Rate } from "@/components/studio/rates/RatesGrid";

export const dynamic = "force-dynamic";

export default async function RatesPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "interest-rates",
    limit: 200,
    depth: 0,
    sort: "kind",
  });
  const rates: Rate[] = result.docs.map((d) => {
    const r = d as unknown as Rate;
    return {
      id: r.id,
      productName: r.productName,
      kind: r.kind || "deposit",
      rateLabel: r.rateLabel || "",
      rateValue: r.rateValue,
      tenor: r.tenor || "",
      minimumAmount: r.minimumAmount,
      effectiveFrom: r.effectiveFrom?.slice(0, 10) || "",
      notes: r.notes || "",
      active: r.active !== false,
    } as Rate;
  });

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Interest rates</span>
      </div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Interest rates</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {rates.length} product{rates.length === 1 ? "" : "s"} · deposit + loan rates · Treasury
            </p>
          </div>
        </div>
      </div>
      <RatesGrid initial={rates} />
    </div>
  );
}
