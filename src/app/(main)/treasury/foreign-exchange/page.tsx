// Reads from Payload — no Sheets. Treasury updates daily via /studio/forex
// and the ticker here picks up new rates on the next request.
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import ForeignExchangeClient from "./ForeignExchangeClient";
import type { ForexRate } from "./ForeignExchangeClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Foreign Exchange — Treasury | CoopBank Tanzania",
  description:
    "Spot FX, Forward FX Contracts, FX Swaps and Daily Exchange Rates from CoopBank Tanzania's Treasury Desk. Competitive rates, no commission, walk-in service nationwide.",
};

export default async function ForeignExchangePage() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "forex-rates",
    limit: 50,
    depth: 0,
    sort: "currencyCode",
  });

  const rates: ForexRate[] = result.docs
    .map((d) => {
      const r = d as unknown as {
        currencyCode: string;
        currencyName: string;
        flagEmoji?: string;
        buyRate: number;
        sellRate: number;
        trend?: string;
        updatedDate?: string;
        active?: boolean;
      };
      return {
        currency_code: r.currencyCode,
        currency_name: r.currencyName,
        flag_emoji: r.flagEmoji || "",
        buy_rate: String(r.buyRate),
        sell_rate: String(r.sellRate),
        trend: r.trend || "neutral",
        updated_date: r.updatedDate?.slice(0, 10) || "",
        active: r.active === false ? "false" : "true",
      };
    })
    .filter((r) => r.active !== "false");

  // USD most prominent, then the other majors, then the rest alphabetically.
  const ORDER = ["USD", "EUR", "GBP", "ZAR", "KES"];
  rates.sort((a, b) => {
    const ia = ORDER.indexOf(a.currency_code);
    const ib = ORDER.indexOf(b.currency_code);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.currency_code.localeCompare(b.currency_code);
  });

  return <ForeignExchangeClient rates={rates} />;
}
