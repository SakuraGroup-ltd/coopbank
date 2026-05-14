import { fetchAuctions } from "@/lib/sheets";
import GovtSecuritiesClient from "./GovtSecuritiesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Government Securities — Treasury | CoopBank Tanzania",
  description:
    "Invest in Treasury Bills and Treasury Bonds issued by the Bank of Tanzania through CoopBank — a licensed Central Depository Participant. View the Q2 2025/26 auctions calendar.",
};

export default async function GovernmentSecuritiesPage() {
  const auctions = await fetchAuctions();
  return <GovtSecuritiesClient auctions={auctions} />;
}
