import Hero from "@/components/home/Hero";
import QuickLinks from "@/components/home/QuickLinks";
import MobileBanking from "@/components/home/MobileBanking";
import ForexTicker from "@/components/home/ForexTicker";
import ServicesGrid from "@/components/home/ServicesGrid";
import ProductsCarousel from "@/components/home/ProductsCarousel";
import { fetchForexRates } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rates = await fetchForexRates();
  return (
    <>
      <Hero />
      <QuickLinks />
      <ForexTicker rates={rates} />
      <ProductsCarousel />
      <MobileBanking />
      <ServicesGrid />
    </>
  );
}
