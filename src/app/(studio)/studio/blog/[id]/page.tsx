// Composer for both new posts (id="new") and edits. Server component fetches
// the existing post if any, then hands off to the client BlogComposer that
// owns the editor state and auto-save flow.
import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { BlogComposer } from "@/components/studio/blog/BlogComposer";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ id: string }> };

export default async function BlogComposerPage({ params }: Args) {
  const user = await requireStudioUser();
  const { id } = await params;

  if (id === "new") {
    return (
      <BlogComposer
        mode="create"
        initial={{
          title: "",
          slug: "",
          category: "news",
          excerpt: "",
          bodyHtml: "",
          tags: [],
          featured: false,
          publishDate: new Date().toISOString().slice(0, 10),
          author: { id: user.id, name: user.name, email: user.email },
        }}
      />
    );
  }

  const payload = await getPayload({ config });
  const result = await payload.findByID({
    collection: "blog-posts",
    id,
    depth: 1,
    draft: true,
  });

  const post = result as unknown as {
    id: string | number;
    title: string;
    slug?: string;
    category?: string;
    excerpt?: string;
    bodyHtml?: string;
    coverImage?: { id?: string | number; url?: string; alt?: string };
    tags?: Array<{ tag: string }>;
    featured?: boolean;
    publishDate?: string;
    readTimeMins?: number;
    author?: { id?: string | number; name?: string; email?: string };
    _status?: "draft" | "published";
  };

  return (
    <BlogComposer
      mode="edit"
      initial={{
        id: post.id,
        title: post.title || "",
        slug: post.slug || "",
        category: post.category || "news",
        excerpt: post.excerpt || "",
        bodyHtml: post.bodyHtml || "",
        coverImage: post.coverImage,
        tags: (post.tags || []).map((t) => t.tag).filter(Boolean),
        featured: !!post.featured,
        publishDate: post.publishDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        readTimeMins: post.readTimeMins,
        author: post.author
          ? {
              id: post.author.id,
              name: post.author.name,
              email: post.author.email,
            }
          : { id: user.id, name: user.name, email: user.email },
        status: post._status,
      }}
    />
  );
}
