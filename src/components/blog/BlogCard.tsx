import Link from "next/link";
import type { BlogPost } from "@/lib/sheets";
import { calcReadTime, fmtDate } from "@/utils/readTime";

function CoverImage({ url, title }: { url: string; title: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #006B3F 0%, #C8962A 100%)" }}>
      <span className="text-white font-black text-4xl opacity-30 select-none">CB</span>
    </div>
  );
}

export default function BlogCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  const readTime = calcReadTime(post.body_html, post.read_time_mins);
  return (
    <Link href={`/news/${post.slug}`}
      className="group block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Cover */}
      <div className="relative aspect-video overflow-hidden">
        <CoverImage url={post.cover_image_url} title={post.title} />
        {post.category && (
          <span className="absolute top-3 left-3 text-xs font-bold text-white px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "#006B3F" }}>
            {post.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-[#006B3F] transition-colors leading-snug mb-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            {post.author} · {fmtDate(post.publish_date)} · {readTime} min read
          </p>
          <span className="text-[#006B3F] font-semibold text-sm group-hover:underline">
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}
