import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, FileText, ArrowLeft } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";

export const dynamic = "force-dynamic";

type Release = {
  id: string | number;
  headline: string;
  slug: string;
  releaseDate?: string;
  category?: string;
  summary?: string;
  bodyHtml?: string;
  document?: { url?: string; filename?: string };
  attachments?: { label: string; file?: { url?: string } }[];
  mediaContact?: { name?: string; email?: string; phone?: string };
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

async function getRelease(slug: string): Promise<Release | null> {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "press-releases",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    return (res.docs[0] as unknown as Release) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRelease(slug);
  if (!r) return { title: "Press release not found" };
  return {
    title: `${r.headline} | CoopBank Newsroom`,
    description: r.summary || undefined,
  };
}

export default async function PressReleasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getRelease(slug);
  if (!r) notFound();

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#0F3D7A] via-[#1A56A0] to-[#0F3D7A]">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 pt-40 pb-12">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/press" className="hover:text-white/70 transition-colors">Newsroom</Link>
          </div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {r.category && (
              <span className="text-[10px] uppercase tracking-widest font-semibold text-white bg-white/15 px-2 py-1 rounded">
                {CATEGORY_LABEL[r.category] || r.category}
              </span>
            )}
            <span className="text-xs text-white/60">{fmtDate(r.releaseDate)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
            {r.headline}
          </h1>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 sm:px-8 py-12">
        {r.summary && <p className="text-lg text-[#333] font-medium leading-relaxed mb-8">{r.summary}</p>}

        {r.bodyHtml ? (
          <div
            className="prose prose-slate max-w-none prose-headings:text-[#1A1A2E] prose-a:text-[#1A56A0]"
            dangerouslySetInnerHTML={{ __html: r.bodyHtml }}
          />
        ) : (
          !r.summary && <p className="text-[#666]">Full release details coming soon.</p>
        )}

        {r.document?.url && (
          <a
            href={r.document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-8 px-5 py-3 rounded-lg bg-[#1A56A0] text-white text-sm font-semibold hover:bg-[#0F3D7A] transition-colors"
          >
            <FileText className="w-4 h-4" />
            Download official PDF
          </a>
        )}

        {r.attachments && r.attachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {r.attachments
              .filter((a) => a.file?.url)
              .map((a, i) => (
                <a
                  key={i}
                  href={a.file!.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#1A56A0] text-white text-sm font-semibold hover:bg-[#0F3D7A] transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {a.label}
                </a>
              ))}
          </div>
        )}

        {(r.mediaContact?.email || r.mediaContact?.phone) && (
          <div className="mt-12 pt-8 border-t border-[#eee]">
            <p className="text-xs uppercase tracking-widest text-[#999] mb-2">Media contact</p>
            <p className="text-sm text-[#333] font-medium">{r.mediaContact?.name || "Communications Office"}</p>
            {r.mediaContact?.email && (
              <a href={`mailto:${r.mediaContact.email}`} className="text-sm text-[#1A56A0] block">{r.mediaContact.email}</a>
            )}
            {r.mediaContact?.phone && <span className="text-sm text-[#666]">{r.mediaContact.phone}</span>}
          </div>
        )}

        <Link href="/press" className="inline-flex items-center gap-1.5 mt-12 text-sm font-medium text-[#2E69FF]">
          <ArrowLeft className="w-4 h-4" /> Back to Newsroom
        </Link>
      </article>
    </div>
  );
}
