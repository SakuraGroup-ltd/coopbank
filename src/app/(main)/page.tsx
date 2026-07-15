import Hero from "@/components/home/Hero";
import QuickLinks from "@/components/home/QuickLinks";
import MobileBanking from "@/components/home/MobileBanking";
import ForexTickerSection from "@/components/home/ForexTickerSection";
import ServicesGrid from "@/components/home/ServicesGrid";
import ProductsCarousel from "@/components/home/ProductsCarousel";
import PageBlocks from "@/components/blocks/PageBlocks";
import { getPublishedPage } from "@/lib/get-page";

export const dynamic = "force-dynamic";

export default async function Home() {
  const page = await getPublishedPage("home");
  if (page) return <PageBlocks blocks={page.layout} />;
  // Fallback: the pre-CMS hardcoded composition.
  return (
    <>
      <Hero />
      <QuickLinks />
      <ForexTickerSection />
      <ProductsCarousel />
      <MobileBanking />
      <ServicesGrid />
    </>
  );
}
