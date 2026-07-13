import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { ShowcaseEditor, type ShowcaseDraftCard } from "@/components/studio/showcase/ShowcaseEditor";
import { FALLBACK_SHOWCASE_CARDS } from "@/components/home/showcase-data";

export const dynamic = "force-dynamic";

export default async function ShowcaseStudioPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const res = await payload
    .find({ collection: "showcase-cards", sort: "sortOrder", depth: 1, limit: 50 })
    .catch(() => ({ docs: [] as unknown[] }));

  // Seed from the current hardcoded set when the collection is empty, so the
  // first edit starts from what the live site actually shows (first Save
  // persists the whole set as CMS rows).
  const initialCards: ShowcaseDraftCard[] = res.docs.length
    ? (res.docs as Record<string, unknown>[]).map((d) => {
        const image = d.image as { id?: number; url?: string } | null;
        return {
          docId: d.id as number,
          title: (d.title as string) || "",
          bullets: (d.bullets as string) || "",
          href: (d.href as string) || "",
          image: image?.id && image?.url ? { id: image.id, url: image.url } : undefined,
          active: d.active !== false,
        };
      })
    : FALLBACK_SHOWCASE_CARDS.map((c) => ({
        title: c.title,
        bullets: c.bullets.join("\n"),
        href: c.href,
        active: true,
      }));

  return (
    <div className="p-8 lg:p-10 h-screen">
      <ShowcaseEditor initialCards={initialCards} />
    </div>
  );
}
