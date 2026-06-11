/* eslint-disable @next/next/no-img-element */
// Public bank charges / rates — purely embeds the uploaded PDF or JPEG.
// Staff upload/replace the file in /studio/bank-charges; it shows here. No chrome.
import { getPayload } from "payload";
import config from "../../../../payload.config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bank Charges & Rates | CoopBank Tanzania",
  description: "Cooperative Bank of Tanzania — schedule of bank charges, fees, and transaction rates.",
};

type Charge = { id: string | number; title?: string; active?: boolean; document?: { url?: string; mimeType?: string } };

export default async function BankChargesPage() {
  const payload = await getPayload({ config });
  const result = await payload.find({ collection: "bank-charges", limit: 20, depth: 1, sort: "-updatedAt" });
  const docs = (result.docs as unknown as Charge[]).filter((d) => d.active !== false && d.document?.url);

  if (docs.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 text-center text-[15px] text-[#999]">
        The bank charges document is being updated. Please check back shortly.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#525659] pt-[88px]">
      {docs.map((d) => {
        const url = d.document!.url!;
        const isImg = (d.document?.mimeType || "").startsWith("image/");
        return isImg ? (
          <img key={String(d.id)} src={url} alt={d.title || "Bank charges & rates"} className="block w-full h-auto" />
        ) : (
          <iframe
            key={String(d.id)}
            src={url}
            title={d.title || "Bank charges & rates"}
            className="block w-full border-0"
            style={{ height: "calc(100vh - 88px)" }}
          />
        );
      })}
    </div>
  );
}
