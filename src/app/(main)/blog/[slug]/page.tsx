// Single blog post — renders the Studio-authored HTML (bodyHtml) from `blog-posts`.
import { getPayload } from "payload";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import config from "../../../../../payload.config";

export const dynamic = "force-dynamic";

const CAT_LABEL: Record<string, string> = {
  news: "News",
  press: "Press Release",
  literacy: "Financial Literacy",
  agm: "Annual / AGM",
  product: "Product Update",
  insight: "Insight",
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "blog-posts",
    where: { slug: { equals: slug }, _status: { equals: "published" } },
    limit: 1,
    depth: 1,
  });

  const doc = result.docs[0] as unknown as
    | {
        title: string;
        category: string;
        publishDate?: string;
        excerpt?: string;
        bodyHtml?: string;
        readTimeMins?: number;
        author?: { name?: string } | string | null;
        coverImage?: { url?: string } | string | null;
      }
    | undefined;

  if (!doc) return notFound();

  const author = typeof doc.author === "object" && doc.author ? doc.author.name ?? "" : "";
  const image = typeof doc.coverImage === "object" && doc.coverImage ? doc.coverImage.url ?? "" : "";
  const date = doc.publishDate
    ? new Date(doc.publishDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "";
  const meta = [date, author, doc.readTimeMins ? `${doc.readTimeMins} min read` : ""].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f3f3fe] pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#2E69FF] mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
        </Link>

        {image && (
          <div className="rounded-xl overflow-hidden mb-8 aspect-[16/9] bg-[#e8e8f0]">
            <img src={image} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <article>
          <p className="text-xs uppercase tracking-[0.12em] font-semibold text-[#1A8A3A] mb-3">
            {CAT_LABEL[doc.category] ?? doc.category}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F3D7A] leading-tight mb-3">{doc.title}</h1>
          {meta.length > 0 && <p className="text-sm text-gray-500 mb-8">{meta.join(" · ")}</p>}

          {doc.bodyHtml ? (
            <div
              className="prose prose-lg max-w-none
                         prose-headings:text-[#0F3D7A]
                         prose-strong:text-[#0F3D7A]
                         prose-a:text-[#1A8A3A]
                         prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-1.5
                         prose-li:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: doc.bodyHtml }}
            />
          ) : doc.excerpt ? (
            <p className="text-lg text-gray-600 leading-relaxed">{doc.excerpt}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No content yet — write something in the Studio.</p>
          )}
        </article>
      </div>
    </div>
  );
}
