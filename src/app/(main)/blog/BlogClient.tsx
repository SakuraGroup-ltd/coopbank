"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export interface ClientPost {
  title: string;
  slug: string;
  category: string;
  categoryLabel: string;
  date: string;
  author: string;
  excerpt: string;
  image: string;
  readTime: number | null;
}

export default function BlogClient({ posts }: { posts: ClientPost[] }) {
  // Build the filter list: "All" + the category labels actually present.
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    posts.forEach((p) => seen.set(p.category, p.categoryLabel));
    return ["All", ...Array.from(seen.values())];
  }, [posts]);

  const [active, setActive] = useState("All");
  const filtered = active === "All" ? posts : posts.filter((p) => p.categoryLabel === active);

  return (
    <div className="min-h-screen bg-[#f3f3fe]">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 pt-40 pb-6">
        <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-[#2C3345] tracking-tight leading-tight">
          Blog
        </h1>
        <p className="mt-3 text-[15px] text-[#888] leading-relaxed max-w-lg">
          Insights, updates, and stories from the Cooperative Bank of Tanzania.
        </p>

        {/* Filters */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-5 mt-8 border-b border-[#e0e0e8] pb-4">
            <span className="text-[13px] text-[#aaa] tracking-wide">Filter by</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`text-[13px] font-medium transition-colors ${
                  active === cat ? "text-[#2E69FF]" : "text-[#666] hover:text-[#2C3345]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Grid ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image */}
              <div className="relative overflow-hidden aspect-[16/10] bg-[#e8e8f0]">
                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                )}
                <div className="absolute top-3 right-3">
                  <span className="bg-[#2C3345]/80 text-[10px] font-semibold text-white px-2 py-1 rounded">
                    {post.categoryLabel}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-[12px] text-[#999] mb-3">
                  <span>{post.date}</span>
                  {post.author && (
                    <>
                      <span className="text-[#ddd]">&middot;</span>
                      <span>{post.author}</span>
                    </>
                  )}
                  {post.readTime && (
                    <>
                      <span className="text-[#ddd]">&middot;</span>
                      <span>{post.readTime} min read</span>
                    </>
                  )}
                </div>

                <h2 className="text-[15px] font-bold text-[#2C3345] leading-snug group-hover:text-[#2E69FF] transition-colors duration-200 line-clamp-3">
                  {post.title}
                </h2>

                {post.excerpt && (
                  <p className="mt-2 text-[13px] text-[#888] leading-relaxed line-clamp-2">{post.excerpt}</p>
                )}

                <div className="flex items-center gap-1.5 mt-4 text-[12px] font-medium text-[#2E69FF]">
                  Read more
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-[15px] text-[#999] py-16 text-center">
            No posts published yet. Create one in the Studio under Blog.
          </p>
        )}
      </div>
    </div>
  );
}
