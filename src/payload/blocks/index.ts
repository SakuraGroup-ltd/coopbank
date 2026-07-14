// Re-export all blocks in one place so Pages, Homepage, and any future
// long-form layout collection share the same list.
import { HeroBlock } from "./Hero";
import { RichTextBlock } from "./RichText";
import { CTAStripBlock } from "./CTAStrip";
import { FAQBlock } from "./FAQ";
import { MediaSliderBlock } from "./MediaSlider";
import { ProductCarouselBlock } from "./ProductCarousel";
import { ProductGridBlock } from "./ProductGrid";
import { StatsBlock } from "./Stats";
import { ImageTextBlock } from "./ImageText";
import { FeaturedNewsBlock } from "./FeaturedNews";
import { sectionBlocks } from "./sections";

export { SECTION_BLOCK_SLUGS } from "./sections";

export const allBlocks = [
  HeroBlock,
  MediaSliderBlock,
  ProductCarouselBlock,
  ProductGridBlock,
  ImageTextBlock,
  RichTextBlock,
  StatsBlock,
  FAQBlock,
  CTAStripBlock,
  FeaturedNewsBlock,
  ...sectionBlocks,
];
