import Link from "next/link";
import { ChevronRight, TrendingUp } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { ForexGrid } from "@/components/studio/forex/ForexGrid";

export const dynamic = "force-dynamic";

type Rate = {
  id: string | number;
  currencyCode: string;
  currencyName: string;
  flagEmoji?: string;
  buyRate: number;
  sellRate: number;
  trend: "up" | "down" | "neutral";
  updatedDate: string;
  active: boolean;
};

export default async function ForexPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "forex-rates",
    limit: 50,
    depth: 0,
    sort: "currencyCode",
  });

  const rates = result.docs.map((d) => {
    const r = d as unknown as Rate;
    return {
      id: r.id,
      currencyCode: r.currencyCode,
      currencyName: r.currencyName,
      flagEmoji: r.flagEmoji,
      buyRate: r.buyRate,
      sellRate: r.sellRate,
      trend: r.trend || "neutral",
      updatedDate: r.updatedDate,
      active: r.active !== false,
    } as Rate;
  });

  const newest = rates
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedDate || 0).getTime() -
        new Date(a.updatedDate || 0).getTime(),
    )[0];
  const lastUpdated = newest?.updatedDate
    ? new Date(newest.updatedDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "never";

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Forex rates</span>
      </div>

      {/* Header */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Forex rates</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              Edit Buy/Sell and trend inline · Treasury · last update {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <ForexGrid initialRates={rates} />
    </div>
  );
}
