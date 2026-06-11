/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ChevronRight, Plus, Banknote, FileText, Image as ImageIcon } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

type Charge = {
  id: string | number;
  title: string;
  effectiveDate?: string;
  active?: boolean;
  summary?: string;
  document?: { url?: string; filename?: string; mimeType?: string };
};

export default async function BankChargesPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "bank-charges",
    limit: 200,
    depth: 1,
    sort: "-updatedAt",
  });
  const charges = result.docs.map((d) => d as unknown as Charge);

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Bank charges</span>
      </div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Bank charges &amp; rates</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {charges.length} document{charges.length === 1 ? "" : "s"} · PDF or JPEG, replace when rates change
            </p>
          </div>
        </div>
        <Link href="/admin/collections/bank-charges/create" className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium">
          <Plus className="w-4 h-4" />
          Upload charges
        </Link>
      </div>

      {charges.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <Banknote className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No charges document yet</h3>
          <p className="text-sm text-studio-ink-3 mb-6">Upload the bank charges / rates PDF or JPEG.</p>
          <Link href="/admin/collections/bank-charges/create" className="inline-flex h-9 px-4 text-sm items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium">
            <Plus className="w-4 h-4" />
            Upload first document
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {charges.map((c) => {
            const isImg = (c.document?.mimeType || "").startsWith("image/");
            return (
              <Link
                key={String(c.id)}
                href={`/admin/collections/bank-charges/${c.id}`}
                className="group block rounded-2xl border border-studio-border bg-studio-panel hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all overflow-hidden"
              >
                <div className="aspect-[16/10] bg-studio-soft relative flex items-center justify-center">
                  {isImg && c.document?.url ? (
                    <img src={c.document.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-12 h-12 text-studio-ink-3 opacity-30" />
                  )}
                  {!c.active && (
                    <span className="absolute top-3 left-3 bg-studio-ink-3 text-white text-[10px] font-bold px-2 py-1 rounded">Hidden</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-studio-ink leading-tight mb-2 line-clamp-2">{c.title}</h3>
                  {c.summary && <p className="text-xs text-studio-ink-3 line-clamp-2 mb-2">{c.summary}</p>}
                  <p className="text-[11px] text-studio-ink-3 inline-flex items-center gap-1">
                    {isImg ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {c.document?.filename || (isImg ? "Image attached" : "PDF attached")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
