/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ChevronRight, FileText, Download, BookText, Clock } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../payload.config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Investor Relations | Cooperative Bank Tanzania",
  description:
    "Annual reports, financial statements and investor information for Cooperative Bank of Tanzania Plc.",
};

type Report = {
  id: string | number;
  title: string;
  year?: number;
  kind?: string;
  publishedDate?: string;
  summary?: string;
  document?: { url?: string; filename?: string };
  cover?: { url?: string };
};

const KIND_LABEL: Record<string, string> = {
  annual: "Annual Report",
  integrated: "Integrated Report",
  interim: "Interim / Half-year",
  sustainability: "Sustainability Report",
};

function fmtDate(d?: string): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Mirrors the "Investors" mega-menu in Navbar.tsx one-for-one so every link
// in that dropdown lands on a real section here, not a dead anchor.
type SidebarLink = { id: string; label: string; desc: string };
type SidebarGroup = { title: string; items: SidebarLink[] };

const SIDEBAR: SidebarGroup[] = [
  {
    title: "Investor Information",
    items: [
      { id: "memorandum", label: "Memorandum & Articles", desc: "Articles of association" },
      { id: "notices", label: "Shareholder Notices", desc: "Latest shareholder communications" },
      { id: "governance", label: "Corporate Governance", desc: "Board charter & policies" },
      { id: "faqs", label: "Investor FAQs", desc: "Common investor questions" },
    ],
  },
  {
    title: "Reports & Disclosures",
    items: [
      { id: "annual-reports", label: "Annual Reports", desc: "Yearly financial performance" },
      { id: "quarterly-reports", label: "Quarterly Reports", desc: "Quarterly financial results" },
      { id: "financials", label: "Financial Statements", desc: "Audited financial statements" },
      { id: "presentations", label: "Presentations", desc: "Investor & analyst presentations" },
      { id: "disclosures", label: "Disclosures", desc: "Regulatory disclosures" },
    ],
  },
  {
    title: "AGM & Dividends",
    items: [
      { id: "agm", label: "AGM 2026", desc: "Annual general meeting details" },
      { id: "dividends", label: "Dividend Mandate Forms", desc: "Update your dividend details" },
      { id: "proxy", label: "Proxy Form", desc: "Appoint a proxy for AGM" },
      { id: "dividend-history", label: "Dividend History", desc: "Past dividend payouts" },
    ],
  },
];

export default async function InvestorsPage() {
  const payload = await getPayload({ config });
  let reports: Report[] = [];
  try {
    const res = await payload.find({
      collection: "annual-reports",
      limit: 100,
      depth: 1,
      sort: "-year",
    });
    reports = res.docs as unknown as Report[];
  } catch {
    reports = [];
  }

  return (
    <div className="min-h-screen bg-[#f3f3fe]">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0F3D7A] via-[#1A56A0] to-[#0F3D7A]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-40 pb-14">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white/70">Investors</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">Investor Relations</h1>
          <p className="mt-3 text-white/70 max-w-xl">
            Annual reports, financial statements and shareholder information for Cooperative
            Bank of Tanzania Plc.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <nav className="space-y-6">
            {SIDEBAR.map((group) => (
              <div key={group.title}>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#1A56A0] mb-2">
                  {group.title}
                </p>
                <ul className="space-y-1 border-l border-[#e0e0e8]">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block pl-3 py-1 text-sm text-[#555] hover:text-[#1A56A0] hover:border-l-2 hover:border-[#1A56A0] hover:-ml-px transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Sections */}
        <div className="space-y-16 min-w-0">
          {/* Annual reports — the only section with real content behind it */}
          <section id="annual-reports" className="scroll-mt-28">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-10 h-10 rounded-xl bg-[#1A56A0]/8 text-[#1A56A0] inline-flex items-center justify-center shrink-0">
                <BookText className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-[#2C3345]">Annual Reports</h2>
                <p className="text-sm text-[#888]">Yearly financial performance and results</p>
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d5d5e5] bg-white p-16 text-center">
                <FileText className="w-10 h-10 mx-auto text-[#b5b5c5] mb-4" />
                <h3 className="text-lg font-semibold text-[#2C3345] mb-1">No reports published yet</h3>
                <p className="text-sm text-[#888]">
                  Annual reports will appear here once published. For enquiries, contact{" "}
                  <a href="mailto:info@coopbank.co.tz" className="text-[#2E69FF] font-medium">info@coopbank.co.tz</a>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {reports.map((r) => (
                  <div
                    key={String(r.id)}
                    className="group bg-white rounded-xl border border-[#e0e0e8] hover:border-[#1A56A0]/30 hover:shadow-md transition-all overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[16/10] bg-[#eef0fa] relative">
                      {r.cover?.url ? (
                        <img src={r.cover.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#b5b5c5]">
                          <BookText className="w-12 h-12 opacity-40" />
                        </div>
                      )}
                      {r.year && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-[#1A56A0] text-white text-xs font-bold px-2.5 py-1 rounded">
                          {r.year}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-[#1A56A0] mb-1">
                        {KIND_LABEL[r.kind || "annual"] || r.kind}
                      </p>
                      <h3 className="text-base font-bold text-[#2C3345] leading-snug mb-2">{r.title}</h3>
                      {r.summary && <p className="text-sm text-[#666] line-clamp-3 mb-4">{r.summary}</p>}
                      {r.publishedDate && (
                        <p className="text-xs text-[#999] mb-4">Published {fmtDate(r.publishedDate)}</p>
                      )}
                      <div className="mt-auto">
                        {r.document?.url ? (
                          <a
                            href={r.document.url}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#2E69FF] group-hover:gap-2 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download PDF
                          </a>
                        ) : (
                          <span className="text-[13px] text-[#999]">PDF unavailable</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Every other section the mega-menu links to. No CMS collection
              backs these yet, so they're placeholders rather than dead
              anchors — real content can replace each card individually. */}
          {SIDEBAR.flatMap((g) => g.items)
            .filter((item) => item.id !== "annual-reports")
            .map((item) => (
              <section key={item.id} id={item.id} className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-[#1A56A0]/8 text-[#1A56A0] inline-flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[#2C3345]">{item.label}</h2>
                    <p className="text-sm text-[#888]">{item.desc}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-[#d5d5e5] bg-white p-10 text-center">
                  <p className="text-sm text-[#888]">
                    Coming soon. For enquiries in the meantime, contact{" "}
                    <a href="mailto:info@coopbank.co.tz" className="text-[#2E69FF] font-medium">info@coopbank.co.tz</a>.
                  </p>
                </div>
              </section>
            ))}
        </div>
      </div>
    </div>
  );
}
