import { fetchForexRates } from "@/lib/sheets";
import ForeignExchangeClient from "./ForeignExchangeClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Foreign Exchange — Treasury | CoopBank Tanzania",
  description:
    "Spot FX, Forward FX Contracts, FX Swaps and Daily Exchange Rates from CoopBank Tanzania's Treasury Desk. Competitive rates, no commission, walk-in service nationwide.",
};

export default async function ForeignExchangePage() {
  const rates = await fetchForexRates();
  return <ForeignExchangeClient rates={rates} />;
}
