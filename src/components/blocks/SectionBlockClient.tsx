"use client";

// Client-side renderer for section blocks — used by the Studio/Payload live
// preview. Identical components to the live site; the one exception is the
// forex ticker, whose rates need a server fetch, so preview shows a labelled
// placeholder strip in its place.
import Hero from "@/components/home/Hero";
import QuickLinks from "@/components/home/QuickLinks";
import MobileBanking from "@/components/home/MobileBanking";
import ServicesGrid from "@/components/home/ServicesGrid";
import AboutPageHeader from "@/components/about/AboutPageHeader";
import BankPrayer from "@/components/about/BankPrayer";
import OurStory from "@/components/about/OurStory";
import BranchNetwork from "@/components/about/BranchNetwork";
import JourneyTimeline from "@/components/about/JourneyTimeline";
import MissionVision from "@/components/about/MissionVision";
import CoreValues from "@/components/about/CoreValues";
import ContactDetails from "@/components/contact/ContactDetails";
import ContactForm from "@/components/contact/ContactForm";
import ContactMap from "@/components/contact/ContactMap";
import { mapSectionProps } from "./map-section-props";

type Block = { blockType: string; data?: Record<string, unknown>; [k: string]: unknown };

const COMPONENTS: Record<string, React.ComponentType<Record<string, unknown>>> = {
  "hero-slider": Hero as never,
  "quick-links": QuickLinks as never,
  "app-promo": MobileBanking as never,
  "services-grid": ServicesGrid as never,
  "page-header": AboutPageHeader as never,
  "bank-prayer": BankPrayer as never,
  story: OurStory as never,
  "branch-network": BranchNetwork as never,
  "journey-timeline": JourneyTimeline as never,
  "mission-vision": MissionVision as never,
  "core-values": CoreValues as never,
  "contact-details": ContactDetails as never,
  "contact-form": ContactForm as never,
  "contact-map": ContactMap as never,
};

export function SectionBlockClient({ block }: { block: Block }) {
  if (block.blockType === "forex-ticker") {
    return (
      <section className="bg-[#0F3D7A] text-white/70 text-sm px-6 py-3 text-center">
        Forex ticker — live rates render on the published page
      </section>
    );
  }
  const Comp = COMPONENTS[block.blockType];
  if (!Comp) return null;
  const props = mapSectionProps(block.blockType, (block.data as Record<string, unknown>) || {});
  return <Comp {...props} />;
}
