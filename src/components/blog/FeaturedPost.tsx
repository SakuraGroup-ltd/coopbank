import Link from "next/link";
import type { BlogPost } from "@/lib/sheets";
import { calcReadTime, fmtDate } from "@/utils/readTime";

export default function FeaturedPost({ post }: { post: BlogPost }) {
  const readTime = calcReadTime(post.body_html, post.read_time_mins);
  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-12 mb-12">
      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md">
        <div className="flex flex-col lg:flex-row">
          {/* Image — 60% */}
          <div className="relative lg:w-[60%] aspect-[4/3] lg:aspect-auto lg:min-h-[420px] overflow-hidden">
            {post.cover_image_url ? (
              <img src={post.cover_image_url} alt={post.title}
                className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full"
                style={{ background: "linear-gradient(135deg, #006B3F 0%, #C8962A 100%)" }} />
            )}
            <span className="absolute top-4 left-4 text-xs font-black text-[#1A1A2E] px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "#C8962A" }}>
              FEATURED
            </span>
          </div>

          {/* Content — 40% */}
          <div className="lg:w-[40%] bg-white p-8 flex flex-col justify-center">
            {post.category && (
              <span className="inline-block text-xs font-bold text-white px-3 py-1 rounded-full mb-4 w-fit"
                style={{ backgroundColor: "#006B3F" }}>
                {post.category}
              </span>
            )}
            <h2 className="text-2xl font-bold text-gray-900 leading-snug mb-4">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-gray-500 leading-relaxed mb-6">{post.excerpt}</p>
            )}
            <p className="text-sm text-gray-400 mb-6">
              {post.author} · {fmtDate(post.publish_date)} · {readTime} min read
            </p>
            <Link href={`/news/${post.slug}`}
              className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl transition w-fit"
              style={{ backgroundColor: "#006B3F" }}>
              Read Article →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
