// Public blog listing — reads from the Payload `blog-posts` collection.
// Posts publish from /studio/blog and land here on the next request.
// Layout mirrors /news.
import { getPayload } from "payload";
import config from "../../../../payload.config";
import BlogClient, { type ClientPost } from "./BlogClient";

export const dynamic = "force-dynamic";

const CAT_LABEL: Record<string, string> = {
  news: "News",
  press: "Press Release",
  literacy: "Financial Literacy",
  agm: "Annual / AGM",
  product: "Product Update",
  insight: "Insight",
};

export default async function BlogPage() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "blog-posts",
    where: { _status: { equals: "published" } },
    limit: 200,
    depth: 1,
    sort: "-publishDate",
  });

  const posts: ClientPost[] = result.docs.map((doc) => {
    const d = doc as unknown as {
      title: string;
      slug: string;
      category: string;
      publishDate?: string;
      excerpt?: string;
      readTimeMins?: number;
      author?: { name?: string } | string | null;
      coverImage?: { url?: string } | string | null;
    };
    return {
      title: d.title,
      slug: d.slug,
      category: d.category,
      categoryLabel: CAT_LABEL[d.category] ?? d.category,
      date: d.publishDate
        ? new Date(d.publishDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "",
      author: typeof d.author === "object" && d.author ? d.author.name ?? "" : "",
      excerpt: d.excerpt ?? "",
      image: typeof d.coverImage === "object" && d.coverImage ? d.coverImage.url ?? "" : "",
      readTime: typeof d.readTimeMins === "number" ? d.readTimeMins : null,
    };
  });

  return <BlogClient posts={posts} />;
}
