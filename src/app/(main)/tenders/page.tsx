// Reads from Payload — no Sheets. Tenders publish from /studio/tenders and
// land here on the next request.
import { getPayload } from "payload";
import config from "../../../../payload.config";
import TendersClient, { type ClientTender } from "./TendersClient";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  "it-equipment": "IT Equipment",
  "it-services": "IT Services",
  construction: "Construction",
  services: "Services",
  goods: "Goods",
  consultancy: "Consultancy",
};
const CONTRACT_LABEL: Record<string, string> = {
  supply: "Supply",
  "supply-install": "Supply & Installation",
  service: "Service Contract",
  construction: "Construction Works",
  consulting: "Consulting Services",
};

export default async function TendersPage() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "tenders",
    limit: 200,
    depth: 1,
    sort: "-publishedDate",
    where: { _status: { equals: "published" } },
  });

  const today = Date.now();
  const tenders: ClientTender[] = result.docs.map((d) => {
    const r = d as unknown as {
      id: string | number;
      tenderRef: string;
      title: string;
      category?: string;
      contractType?: string;
      publishedDate?: string;
      closingDate?: string;
      descriptionHtml?: string;
      document?: { url?: string };
    };
    const closed = r.closingDate ? new Date(r.closingDate).getTime() < today : false;
    return {
      tender_ref: r.tenderRef,
      tender_title: r.title,
      category: CATEGORY_LABEL[r.category || ""] || r.category || "Other",
      contract_type: CONTRACT_LABEL[r.contractType || ""] || r.contractType || "",
      published_date: r.publishedDate?.slice(0, 10) || "",
      closing_date: r.closingDate?.slice(0, 10) || "",
      description: "",
      description_html: r.descriptionHtml || "",
      document_url: r.document?.url || "",
      status: closed ? "Closed" : "Open",
    };
  });

  return <TendersClient tenders={tenders} />;
}
