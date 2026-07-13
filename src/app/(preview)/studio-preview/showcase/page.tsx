import { getPayload } from "payload";
import config from "../../../../../payload.config";
import {
  resolveShowcaseCards,
  FALLBACK_SHOWCASE_CARDS,
  type ShowcaseDoc,
} from "@/components/home/showcase-data";
import ShowcasePreviewClient from "@/components/preview/ShowcasePreviewClient";

export const dynamic = "force-dynamic";

export default async function ShowcasePreviewPage() {
  let initial = FALLBACK_SHOWCASE_CARDS;
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "showcase-cards",
      where: { active: { not_equals: false } },
      sort: "sortOrder",
      depth: 1,
      limit: 50,
    });
    if (res.docs.length) initial = resolveShowcaseCards(res.docs as ShowcaseDoc[]);
  } catch {
    // fall through to fallback cards
  }
  return <ShowcasePreviewClient initial={initial} />;
}
