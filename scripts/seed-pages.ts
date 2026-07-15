/**
 * Seed the block-composed key pages (home, about-us, contact-us) from the
 * components' default content — the CMS render is identical to the hardcoded
 * fallback, so flipping to CMS is visually invisible.
 *
 * Run: npm run seed:pages
 *
 * DELETES and recreates these three slugs. That is intentional for the
 * phase-1 cutover: the only pre-existing `home` doc is the placeholder from
 * seed-homepage.ts (old generic blocks), which must be replaced or `/` would
 * render wireframes. After cutover, editors own the docs — do NOT rerun this
 * script casually.
 */
import { getPayload } from "payload";
import config from "../payload.config";
import {
  defaultHeroSlides, defaultQuickLinks, defaultQuickLinksHeading,
  defaultAppPromo, defaultServiceTabs,
} from "../src/components/home/home-defaults";
import {
  defaultAboutHeader, defaultPrayer, defaultStory, defaultBranchNetwork,
  defaultJourney, defaultMissionVision, defaultCoreValues,
} from "../src/components/about/about-defaults";
import {
  defaultContactHeader, defaultContactDetails, defaultContactForm, defaultContactMap,
} from "../src/components/contact/contact-defaults";

// Section blocks (src/payload/blocks/sections.ts) each carry a single `data`
// json field — this helper wraps the payload accordingly.
const b = (blockType: string, data: Record<string, unknown> = {}) => ({ blockType, data });

const PAGES: Array<{ slug: string; title: string; layout: unknown[] }> = [
  {
    slug: "home",
    title: "Home",
    layout: [
      b("hero-slider", {
        slides: defaultHeroSlides.map((s) => ({
          image: { url: s.image },
          tagline: s.tagline,
          headline: s.headline,
          desc: s.desc,
          cta1Label: s.cta1.label, cta1Href: s.cta1.href,
          cta2Label: s.cta2.label, cta2Href: s.cta2.href,
        })),
      }),
      b("quick-links", { heading: defaultQuickLinksHeading, links: defaultQuickLinks }),
      b("forex-ticker"),
      // NOT the `b()` helper: ProductCarouselBlock (src/payload/blocks/ProductCarousel.ts)
      // has FLAT top-level fields (heading/subhead/cards/cardsPerRow), unlike the
      // section blocks which wrap everything in one `data` json field. `cards` is
      // `required: true, minRows: 1`, so it must be populated or payload.create()
      // throws a validation error. PageBlocks (Task 9) special-cases blockType
      // "product-carousel" and renders <ProductsCarousel /> (real showcase-driven
      // component) regardless of these fields — they are placement/admin-UI only.
      {
        blockType: "product-carousel",
        heading: "Our Products",
        cards: [
          { title: "Explore Our Products", ctaLabel: "EXPLORE", ctaHref: "/personal-banking" },
        ],
      },
      b("app-promo", {
        badge: defaultAppPromo.badge,
        heading: defaultAppPromo.heading,
        copy: defaultAppPromo.copy,
        features: defaultAppPromo.features,
        appStoreUrl: defaultAppPromo.appStoreUrl,
        playStoreUrl: defaultAppPromo.playStoreUrl,
        ussdCode: defaultAppPromo.ussdCode,
        mockup: { url: defaultAppPromo.mockupImage },
      }),
      b("services-grid", { tabs: defaultServiceTabs }),
    ],
  },
  {
    slug: "about-us",
    title: "About Us",
    layout: [
      b("page-header", defaultAboutHeader),
      b("bank-prayer", defaultPrayer),
      b("story", defaultStory),
      b("branch-network", defaultBranchNetwork),
      b("journey-timeline", defaultJourney),
      b("mission-vision", defaultMissionVision),
      b("core-values", defaultCoreValues),
    ],
  },
  {
    slug: "contact-us",
    title: "Contact Us",
    layout: [
      b("page-header", defaultContactHeader),
      b("contact-details", defaultContactDetails),
      b("contact-form", defaultContactForm),
      b("contact-map", defaultContactMap),
    ],
  },
];

async function main() {
  const payload = await getPayload({ config });
  for (const page of PAGES) {
    const existing = await payload.find({
      collection: "pages",
      where: { slug: { equals: page.slug } },
      limit: 1,
      draft: true,
    });
    if (existing.docs[0]) {
      await payload.delete({ collection: "pages", id: existing.docs[0].id });
      console.log(`[seed-pages] replaced existing '${page.slug}' (id ${existing.docs[0].id})`);
    }
    await payload.create({
      collection: "pages",
      data: {
        title: page.title,
        slug: page.slug,
        layout: page.layout,
        _status: "published",
      } as never,
    });
    console.log(`[seed-pages] published '${page.slug}' with ${page.layout.length} blocks`);
  }
  console.log("[seed-pages] done");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
