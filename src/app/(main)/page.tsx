import Hero from "@/components/home/Hero";
import QuickLinks from "@/components/home/QuickLinks";
import MobileBanking from "@/components/home/MobileBanking";
import ForexTickerSection from "@/components/home/ForexTickerSection";
import ServicesGrid from "@/components/home/ServicesGrid";
import ProductsCarousel from "@/components/home/ProductsCarousel";

export const dynamic = "force-dynamic";

export default async function Home() {
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
