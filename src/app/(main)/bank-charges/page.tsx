/* eslint-disable @next/next/no-img-element */
// Public bank charges / rates — reads the `bank-charges` collection.
// Staff upload/replace the PDF or JPEG in /studio/bank-charges and it shows here.
import { getPayload } from "payload";
import { Download, FileText } from "lucide-react";
import config from "../../../../payload.config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bank Charges & Rates | CoopBank Tanzania",
  description: "Cooperative Bank of Tanzania — schedule of bank charges, fees, and transaction rates. View or download the latest tariff guide.",
};

type Charge = {
  id: string | number;
  title: string;
  effectiveDate?: string;
  summary?: string;
  active?: boolean;
  order?: number;
  document?: { url?: string; filename?: string; mimeType?: string };
};

export default async function BankChargesPage() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "bank-charges",
    limit: 50,
    depth: 1,
    sort: "order",
  });

  const charges = (result.docs as unknown as Charge[])
    .filter((c) => c.active !== false && c.document?.url)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  return (
    <div className="min-h-screen bg-[#f3f3fe] pt-40 pb-24">
      <div className="max-w-4xl mx-auto px-5">
        <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-[#2C3345] tracking-tight leading-tight">
          Bank Charges &amp; Rates
        </h1>
        <p className="mt-3 text-[15px] text-[#888] leading-relaxed max-w-xl">
          Our schedule of charges, fees, and rates for all transactions. View or download the latest tariff guide below.
        </p>

        {charges.length === 0 ? (
          <p className="mt-12 text-[15px] text-[#999]">
            The charges document is being updated. Please check back shortly.
          </p>
        ) : (
          <div className="mt-10 space-y-12">
            {charges.map((c) => {
              const url = c.document!.url!;
              const isImg = (c.document?.mimeType || "").startsWith("image/");
              const effective = c.effectiveDate
                ? new Date(c.effectiveDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
                : "";
              return (
                <section key={String(c.id)} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-[#eee]">
                    <div>
                      <h2 className="text-lg font-bold text-[#2C3345]">{c.title}</h2>
                      {effective && <p className="text-[13px] text-[#999] mt-0.5">Effective {effective}</p>}
                      {c.summary && <p className="text-[14px] text-[#666] mt-2 max-w-xl">{c.summary}</p>}
                    </div>
                    <a
                      href={url}
                      download={c.document?.filename}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#1A8A3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#14692D] transition-colors shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>

                  {/* Inline display */}
                  {isImg ? (
                    <img src={url} alt={c.title} className="w-full h-auto" />
                  ) : (
                    <div className="bg-[#f7f7fb]">
                      <iframe src={url} title={c.title} className="w-full h-[80vh] border-0" />
                      <div className="p-4 text-center sm:hidden">
                        <a href={url} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#2E69FF]">
                          <FileText className="w-4 h-4" /> Open the PDF
                        </a>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
