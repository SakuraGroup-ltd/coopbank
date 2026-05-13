"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/lib/sheets";
import BlogCard from "./BlogCard";

const PER_PAGE = 9;

export default function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, [posts]);

  const [filter, setFilter]   = useState("All");
  const [page, setPage]       = useState(1);

  const filtered = filter === "All" ? posts : posts.filter((p) => p.category === filter);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const setCategory = (cat: string) => { setFilter(cat); setPage(1); };

  return (
    <section className="max-w-[1200px] mx-auto px-6 sm:px-12 pb-20">

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[["All", posts.length], ...Object.entries(categories)].map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => setCategory(String(cat))}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition-all ${
              filter === cat
                ? "text-white border-transparent"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#006B3F] hover:text-[#006B3F]"
            }`}
            style={filter === cat ? { backgroundColor: "#006B3F", borderColor: "#006B3F" } : {}}
          >
            {cat} ({count})
          </button>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="py-20 text-center text-gray-400">No articles in this category yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {visible.map((post, i) => (
              <motion.div key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}>
                <BlogCard post={post} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#006B3F] hover:text-[#006B3F] disabled:opacity-30 disabled:cursor-not-allowed transition">
            ← Previous
          </button>
          <span className="text-sm text-gray-500 font-medium">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#006B3F] hover:text-[#006B3F] disabled:opacity-30 disabled:cursor-not-allowed transition">
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
