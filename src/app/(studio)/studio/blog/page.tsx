/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ChevronRight, Plus, Newspaper, Search } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { Badge } from "@/components/studio/ui/Badge";

export const dynamic = "force-dynamic";

type BlogPost = {
  id: string | number;
  title: string;
  slug?: string;
  category?: string;
  excerpt?: string;
  publishDate?: string;
  updatedAt?: string;
  featured?: boolean;
  coverImage?: { url?: string; alt?: string };
  _status?: "draft" | "published";
};

const CATEGORY_LABEL: Record<string, string> = {
  news: "News",
  press: "Press Release",
  literacy: "Financial Literacy",
  agm: "Annual / AGM",
  product: "Product Update",
  insight: "Insight",
};

function timeAgo(date?: string): string {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function BlogListPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "blog-posts",
    limit: 100,
    depth: 1,
    draft: true,
    sort: "-updatedAt",
  });

  const posts = result.docs.map((d) => d as unknown as BlogPost);
  const drafts = posts.filter((p) => p._status === "draft");
  const published = posts.filter((p) => p._status === "published" || !p._status);
  const featured = posts.find((p) => p.featured);

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Blog &amp; news</span>
      </div>

      {/* Header */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <Newspaper className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Blog &amp; news</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {published.length} published · {drafts.length} draft{drafts.length === 1 ? "" : "s"} · Marketing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-studio-ink-3" />
            <input
              type="search"
              placeholder="Search posts…"
              className="h-9 pl-9 pr-3 rounded-lg border border-studio-border bg-studio-panel text-sm w-64 focus:border-cb-navy/30 focus:ring-2 focus:ring-cb-navy/15 focus:outline-none"
            />
          </div>
          <Link
            href="/studio/blog/new"
            className="h-9 px-4 text-sm inline-flex items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New post
          </Link>
        </div>
      </div>

      {/* Featured banner */}
      {featured && (
        <Link
          href={`/studio/blog/${featured.id}`}
          className="block mb-8 group"
        >
          <div className="rounded-2xl border border-studio-border bg-studio-panel overflow-hidden flex flex-col md:flex-row hover:border-cb-navy/30 transition-colors shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
            <div className="md:w-2/5 aspect-[16/9] md:aspect-auto bg-studio-soft relative">
              {featured.coverImage?.url ? (
                <img
                  src={featured.coverImage.url}
                  alt={featured.coverImage.alt || featured.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-studio-ink-3">
                  <Newspaper className="w-12 h-12 opacity-30" />
                </div>
              )}
            </div>
            <div className="flex-1 p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Badge tone="warning">Featured</Badge>
                {featured.category && (
                  <Badge tone="neutral">{CATEGORY_LABEL[featured.category] || featured.category}</Badge>
                )}
                <Badge tone={featured._status === "draft" ? "neutral" : "success"}>
                  {featured._status === "draft" ? "Draft" : "Published"}
                </Badge>
              </div>
              <h2 className="text-2xl font-semibold text-studio-ink leading-tight mb-2 group-hover:text-cb-navy transition-colors">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="text-sm text-studio-ink-2 line-clamp-3 mb-4">{featured.excerpt}</p>
              )}
              <div className="mt-auto text-xs text-studio-ink-3">
                Last edited {timeAgo(featured.updatedAt)}
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* All posts grid */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel/60 p-16 text-center">
          <Newspaper className="w-12 h-12 mx-auto text-studio-ink-3 opacity-40 mb-4" />
          <h3 className="text-base font-semibold text-studio-ink mb-1">No posts yet</h3>
          <p className="text-sm text-studio-ink-3 mb-6">Write the first piece of news to get the news rail flowing.</p>
          <Link
            href="/studio/blog/new"
            className="inline-flex h-9 px-4 text-sm items-center gap-2 rounded-lg bg-studio-ink hover:bg-cb-navy-deep text-white font-medium"
          >
            <Plus className="w-4 h-4" />
            Write your first post
          </Link>
        </div>
      ) : (
        <>
          {drafts.length > 0 && (
            <Section title="Drafts" hint="Unfinished work-in-progress" posts={drafts.filter((p) => !p.featured)} />
          )}
          <Section
            title="Published"
            hint="Live on /news"
            posts={published.filter((p) => !p.featured)}
            className="mt-10"
          />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  posts,
  className,
}: {
  title: string;
  hint: string;
  posts: BlogPost[];
  className?: string;
}) {
  if (posts.length === 0) return null;
  return (
    <section className={className}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-studio-ink uppercase tracking-wider">{title}</h2>
          <p className="text-xs text-studio-ink-3 mt-0.5">{hint}</p>
        </div>
        <span className="text-xs text-studio-ink-3">{posts.length}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((p) => (
          <BlogCard key={String(p.id)} post={p} />
        ))}
      </div>
    </section>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/studio/blog/${post.id}`}
      className="group block rounded-2xl border border-studio-border bg-studio-panel overflow-hidden hover:border-cb-navy/30 hover:shadow-[0_4px_16px_rgba(15,15,15,0.06)] transition-all shadow-[0_1px_2px_rgba(15,15,15,0.04)]"
    >
      <div className="aspect-[16/9] bg-studio-soft relative overflow-hidden">
        {post.coverImage?.url ? (
          <img
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-studio-ink-3">
            <Newspaper className="w-8 h-8 opacity-30" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {post.category && (
            <Badge tone="neutral">{CATEGORY_LABEL[post.category] || post.category}</Badge>
          )}
          <Badge tone={post._status === "draft" ? "neutral" : "success"}>
            {post._status === "draft" ? "Draft" : "Published"}
          </Badge>
        </div>
        <h3 className="text-base font-semibold text-studio-ink leading-snug line-clamp-2 mb-2 group-hover:text-cb-navy transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-xs text-studio-ink-3 line-clamp-2 mb-3">{post.excerpt}</p>
        )}
        <p className="text-[11px] text-studio-ink-3">
          {timeAgo(post.updatedAt)}
        </p>
      </div>
    </Link>
  );
}
