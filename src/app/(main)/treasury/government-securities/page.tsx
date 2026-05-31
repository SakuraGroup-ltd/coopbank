// Reads from Payload — no Sheets. Treasury maintains the auction calendar
// via the Studio.
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import GovtSecuritiesClient from "./GovtSecuritiesClient";
import type { Auction } from "./GovtSecuritiesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Government Securities — Treasury | CoopBank Tanzania",
  description:
    "Invest in Treasury Bills and Treasury Bonds issued by the Bank of Tanzania through CoopBank — a licensed Central Depository Participant. View the Q2 2025/26 auctions calendar.",
};

export default async function GovernmentSecuritiesPage() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "auctions",
    limit: 200,
    depth: 0,
    sort: "auctionDate",
  });

  const auctions: Auction[] = result.docs
    .map((d) => {
      const r = d as unknown as {
        instrument: string;
        tenor: string;
        announcementDate?: string;
        auctionDate?: string;
        valueDate?: string;
        maturityDate?: string;
        notes?: string;
        status?: string;
        active?: boolean;
      };
      return {
        instrument: r.instrument,
        tenor: r.tenor,
        announcement_date: r.announcementDate?.slice(0, 10) || "",
        auction_date: r.auctionDate?.slice(0, 10) || "",
        value_date: r.valueDate?.slice(0, 10) || "",
        maturity_date: r.maturityDate?.slice(0, 10) || "",
        notes: r.notes || "",
        status: r.status || "upcoming",
        active: r.active === false ? "false" : "true",
      };
    })
    .filter((a) => a.active !== "false");

  return <GovtSecuritiesClient auctions={auctions} />;
}
