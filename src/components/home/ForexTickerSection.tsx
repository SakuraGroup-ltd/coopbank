// Server wrapper: fetches FX rates from Payload and renders the ticker.
// Extracted from the home route so block-composed pages can place it too.
import { getPayload } from "payload";
import config from "../../../payload.config";
import ForexTicker from "./ForexTicker";

type TickerRate = {
  currency_code: string;
  currency_name: string;
  flag_emoji: string;
  buy_rate: string;
  sell_rate: string;
  trend: string;
  updated_date: string;
  active: string;
};

export default async function ForexTickerSection() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "forex-rates",
    limit: 20,
    depth: 0,
    sort: "currencyCode",
  });
  const rates: TickerRate[] = result.docs
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
  return <ForexTicker rates={rates} />;
}
