// Fetch a published block-composed page by slug. Returns null when the doc
// is missing, unpublished, has no blocks, or the DB hiccups — callers fall
// back to their hardcoded composition, so the homepage can never 500 on a
// CMS problem.
import { getPayload } from "payload";
import config from "../../payload.config";

export type PageDoc = {
  layout: Array<{ blockType: string; [k: string]: unknown }>;
  seo?: { metaTitle?: string; metaDescription?: string };
  title?: string;
};

export async function getPublishedPage(slug: string): Promise<PageDoc | null> {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1, // populate upload relations in legacy generic blocks
    });
    const doc = res.docs[0] as unknown as (PageDoc & { _status?: string }) | undefined;
    if (!doc || doc._status === "draft") return null;
    if (!Array.isArray(doc.layout) || doc.layout.length === 0) return null;
    return doc;
  } catch (err) {
    console.error(`[pages] fetch '${slug}' failed — using hardcoded fallback`, err);
    return null;
  }
}
