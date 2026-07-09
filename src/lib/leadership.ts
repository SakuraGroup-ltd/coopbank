import { getPayload } from "payload";
import config from "../../payload.config";
import type { Person } from "@/components/about/LeadershipGrid";

// Fetch leadership profiles for a category from the CMS, resolving each photo to
// a URL that actually renders, and falling back to the hardcoded set if the
// collection is empty or the DB is unreachable — so these high-visibility
// corporate pages can never go blank.
//
// Image resolution order:
//   1. A valid absolute photo URL from the media upload (e.g. a GCS URL for
//      profiles uploaded via Studio). The legacy `/api/media/file/*` paths are
//      rejected because they 500 on the live site.
//   2. A known-good local static image, matched by name (the originals shipped
//      under /public/images/...).
//   3. Nothing — the card renders the person's initials.
export async function getLeadership(
  category: "board" | "executive" | "senior" | "advisory",
  fallback: Person[],
): Promise<Person[]> {
  const localByName = Object.fromEntries(fallback.map((p) => [p.name, p.image]));
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "leadership-team",
      where: { and: [{ category: { equals: category } }, { active: { not_equals: false } }] },
      sort: "sortOrder",
      depth: 1,
      limit: 100,
    });
    if (!res.docs.length) return fallback;
    return res.docs.map((d) => {
      const doc = d as unknown as { name: string; title: string; photo?: { url?: string } };
      const url = doc.photo?.url;
      const usable = url && /^https?:\/\//.test(url) && !url.includes("/api/media/file/");
      return {
        name: doc.name,
        title: doc.title,
        image: usable ? url : localByName[doc.name] || undefined,
      } as Person;
    });
  } catch {
    return fallback;
  }
}
