import Link from "next/link";
import { ChevronRight, FileText, ArrowRight } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../payload.config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Newsroom — Press Releases | Cooperative Bank Tanzania",
  description:
    "Official press releases and corporate announcements from Cooperative Bank of Tanzania Plc.",
};

type Release = {
  id: string | number;
  headline: string;
  slug: string;
  releaseDate?: string;
  category?: string;
  summary?: string;
  document?: { url?: string };
};

const CATEGORY_LABEL: Record<string, string> = {
  corporate: "Corporate",
  regulatory: "Regulatory",
  financial: "Financial Results",
  leadership: "Leadership",
  agm: "AGM / Dividend",
  product: "Product Launch",
};

function fmtDate(d?: string): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PressPage() {
  const payload = await getPayload({ config });
  let releases: Release[] = [];
  try {
    const res = await payload.find({
      collection: "press-releases",
      limit: 100,
      depth: 1,
      sort: "-releaseDate",
    });
    releases = res.docs as unknown as Release[];
  } catch {
    releases = [];
  }

  return (
    <div className="min-h-screen bg-[#f3f3fe]">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0F3D7A] via-[#1A56A0] to-[#0F3D7A]">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-40 pb-14">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white/70">Newsroom</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">Newsroom</h1>
          <p className="mt-3 text-white/70 max-w-xl">
            Official press releases and corporate announcements from Cooperative Bank of Tanzania Plc.
          </p>
        </div>
      </section>

      {/* List */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {releases.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d5d5e5] bg-white p-16 text-center">
            <FileText className="w-10 h-10 mx-auto text-[#b5b5c5] mb-4" />
            <h2 className="text-lg font-semibold text-[#2C3345] mb-1">No press releases yet</h2>
            <p className="text-sm text-[#888]">
              Official announcements will appear here. For media enquiries, contact{" "}
              <a href="mailto:media@cbtbank.co.tz" className="text-[#2E69FF] font-medium">media@cbtbank.co.tz</a>.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {releases.map((r) => (
              <li key={String(r.id)}>
                <Link
                  href={`/press/${r.slug}`}
                  className="group block bg-white rounded-xl border border-[#e0e0e8] hover:border-[#1A56A0]/30 hover:shadow-md transition-all p-6"
                >
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {r.category && (
                      <span className="text-[10px] uppercase tracking-widest font-semibold text-[#1A56A0] bg-[#1A56A0]/8 px-2 py-1 rounded">
                        {CATEGORY_LABEL[r.category] || r.category}
                      </span>
                    )}
                    <span className="text-xs text-[#999]">{fmtDate(r.releaseDate)}</span>
                    {r.document?.url && (
                      <span className="text-xs text-[#999] inline-flex items-center gap-1">
                        <FileText className="w-3 h-3" /> PDF
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-[#2C3345] leading-snug group-hover:text-[#1A56A0] transition-colors">
                    {r.headline}
                  </h2>
                  {r.summary && <p className="text-sm text-[#666] mt-2 line-clamp-2">{r.summary}</p>}
                  <span className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-medium text-[#2E69FF]">
                    Read release <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
