import Hero from "@/components/home/Hero";
import QuickLinks from "@/components/home/QuickLinks";
import MobileBanking from "@/components/home/MobileBanking";
import ForexTicker from "@/components/home/ForexTicker";
import ServicesGrid from "@/components/home/ServicesGrid";
import ProductsCarousel from "@/components/home/ProductsCarousel";
import { getPayload } from "payload";
import config from "../../../payload.config";

export const dynamic = "force-dynamic";

// Type shape the existing ForexTicker component expects (snake_case keys).
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

export default async function Home() {
  // FX rates come straight from Payload now — no Sheets call. Treasury
  // updates daily in /studio/forex and the ticker reflects it on the next load.
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

  return (
    <>
      <Hero />
      <QuickLinks />
      <ForexTicker rates={rates} />
      <ProductsCarousel />
      <MobileBanking />
      <ServicesGrid />
    </>
  );
}
