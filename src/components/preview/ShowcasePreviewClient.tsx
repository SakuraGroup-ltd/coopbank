"use client";
import { ProductsCarouselView, type ShowcaseCard } from "@/components/home/ProductsCarouselView";
import { useDraftListener } from "./useDraftListener";

export default function ShowcasePreviewClient({ initial }: { initial: ShowcaseCard[] }) {
  const cards = useDraftListener<ShowcaseCard[]>("showcase", initial);
  return <ProductsCarouselView cards={cards} />;
}
