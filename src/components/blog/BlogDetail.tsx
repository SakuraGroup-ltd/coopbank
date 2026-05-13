"use client";

import Link from "next/link";
import { useState } from "react";
import type { BlogPost } from "@/lib/sheets";
import { calcReadTime, fmtDate } from "@/utils/readTime";

function ShareRow({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;
  return (
    <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
      <button onClick={copy}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#006B3F] hover:text-[#006B3F] transition">
        {copied ? "✓ Copied!" : "Copy Link"}
      </button>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#25D366] hover:text-[#25D366] transition">
        Share on WhatsApp
      </a>
    </div>
  );
}

export default function BlogDetail({
  post, related, allCategories,
}: {
  post: BlogPost & { body_html: string };
  related: BlogPost[];
  allCategories: { name: string; count: number }[];
}) {
  const readTime = calcReadTime(post.body_html, post.read_time_mins);
  const tags = post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <main className="bg-white min-h-screen">
      {/* Article header */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-12 pt-10 pb-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#006B3F]">Home</Link>
          <span>›</span>
          <Link href="/news" className="hover:text-[#006B3F]">News</Link>
          <span>›</span>
          <span className="text-gray-600 truncate max-w-xs">{post.title.slice(0, 40)}{post.title.length > 40 ? "…" : ""}</span>
        </nav>

        <div className="max-w-3xl">
          {post.category && (
            <span className="inline-block text-xs font-bold text-white px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: "#006B3F" }}>
              {post.category}
            </span>
          )}
          <h1 className="text-4xl font-black text-[#1A1A2E] leading-tight mb-4">{post.title}</h1>
          <p className="text-sm text-gray-400 mb-6">
            {post.author} · {fmtDate(post.publish_date)} · {readTime} min read
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-12 pb-20">
        <div className="flex gap-12 flex-col lg:flex-row">

          {/* Article body — 70% */}
          <article className="flex-1 min-w-0">
            {/* Cover image */}
            {post.cover_image_url && (
              <div className="rounded-xl overflow-hidden mb-8 aspect-video">
                <img src={post.cover_image_url} alt={post.title}
                  className="w-full h-full object-cover" />
              </div>
            )}

            {/* Body — Tailwind Typography */}
            <div
              className="prose prose-lg prose-green max-w-none
                prose-headings:text-[#1A1A2E] prose-headings:font-bold
                prose-a:text-[#006B3F] prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-[#006B3F] prose-blockquote:bg-green-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.body_html }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {tags.map((tag) => (
                  <span key={tag}
                    className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <ShareRow slug={post.slug} />
          </article>

          {/* Sidebar — 30% */}
          <aside className="lg:w-72 xl:w-80 shrink-0 space-y-8">

            {/* Related posts */}
            {related.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-[#1A1A2E] mb-4">More from CoopBank</h2>
                <div className="space-y-4">
                  {related.map((r) => (
                    <Link key={r.slug} href={`/news/${r.slug}`}
                      className="flex gap-3 group hover:bg-gray-50 rounded-xl p-2 transition -mx-2">
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                        {r.cover_image_url ? (
                          <img src={r.cover_image_url} alt={r.title}
                            className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full"
                            style={{ background: "linear-gradient(135deg, #006B3F, #C8962A)" }} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-[#006B3F] transition leading-snug">
                          {r.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{fmtDate(r.publish_date)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Browse by category */}
            {allCategories.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-[#1A1A2E] mb-4">Browse by Category</h2>
                <div className="space-y-1">
                  {allCategories.map(({ name, count }) => (
                    <Link key={name}
                      href={`/news?category=${encodeURIComponent(name)}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition group">
                      <span className="text-sm text-gray-600 group-hover:text-[#006B3F]">{name}</span>
                      <span className="text-xs text-gray-400">{count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
