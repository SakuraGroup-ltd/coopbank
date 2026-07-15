// Server renderer for live pages composed in the Pages collection. Section
// blocks render the real components; data-backed placements get their server
// fetches; anything generic falls through to the client BlockRenderer.
import ForexTickerSection from "@/components/home/ForexTickerSection";
import ProductsCarousel from "@/components/home/ProductsCarousel";
import { BlockRenderer } from "@/components/preview/BlockRenderer";
import { SectionBlockClient } from "./SectionBlockClient";
import { SECTION_BLOCK_SLUGS } from "@/payload/blocks/sections";

export type PageBlock = { blockType: string; data?: Record<string, unknown>; [k: string]: unknown };

export default function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
  if (!Array.isArray(blocks)) return null;
  return (
    <>
      {blocks.map((b, i) => {
        if (b.blockType === "forex-ticker") return <ForexTickerSection key={i} />;
        if (b.blockType === "product-carousel") return <ProductsCarousel key={i} />;
        if (SECTION_BLOCK_SLUGS.includes(b.blockType)) return <SectionBlockClient key={i} block={b} />;
        return <BlockRenderer key={i} blocks={[b]} />;
      })}
    </>
  );
}
