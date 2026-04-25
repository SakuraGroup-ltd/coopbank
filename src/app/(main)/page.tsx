import Hero from "@/components/home/Hero";
import QuickLinks from "@/components/home/QuickLinks";
import MobileBanking from "@/components/home/MobileBanking";
import ForexTicker from "@/components/home/ForexTicker";
import ServicesGrid from "@/components/home/ServicesGrid";
import ProductsCarousel from "@/components/home/ProductsCarousel";
export default function Home() {
  return (
    <>
      <Hero />
      <QuickLinks />
      <ForexTicker />
      <ProductsCarousel />
      <MobileBanking />
      <ServicesGrid />
    </>
  );
}
