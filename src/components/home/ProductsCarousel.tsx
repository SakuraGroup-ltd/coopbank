import { getPayload } from "payload";
import config from "../../../payload.config";
import { ProductsCarouselView } from "./ProductsCarouselView";
import {
  resolveShowcaseCards,
  FALLBACK_SHOWCASE_CARDS,
  type ShowcaseDoc,
} from "./showcase-data";

export default async function ProductsCarousel() {
  let cards = FALLBACK_SHOWCASE_CARDS;
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "showcase-cards",
      where: { active: { not_equals: false } },
      sort: "sortOrder",
      depth: 1,
      limit: 50,
    });
    if (res.docs.length) cards = resolveShowcaseCards(res.docs as ShowcaseDoc[]);
  } catch (e) {
    // DB unreachable — the homepage must never go blank; use the fallback set.
    console.error("[ProductsCarousel] showcase-cards find failed:", e);
  }
  return <ProductsCarouselView cards={cards} />;
}
