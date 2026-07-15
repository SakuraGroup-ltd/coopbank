import AboutPageHeader from "@/components/about/AboutPageHeader";
import BankPrayer from "@/components/about/BankPrayer";
import OurStory from "@/components/about/OurStory";
import BranchNetwork from "@/components/about/BranchNetwork";
import JourneyTimeline from "@/components/about/JourneyTimeline";
import MissionVision from "@/components/about/MissionVision";
import CoreValues from "@/components/about/CoreValues";
import PageBlocks from "@/components/blocks/PageBlocks";
import { getPublishedPage } from "@/lib/get-page";
import { AboutUsSidebarShell } from "./layout";
import { Fragment } from "react";

export const dynamic = "force-dynamic";

const Divider = () => <div className="border-t border-gray-200 my-10" />;

export default async function AboutUsPage() {
  const page = await getPublishedPage("about-us");
  if (page) {
    const headers = page.layout.filter((b) => b.blockType === "page-header");
    const body = page.layout.filter((b) => b.blockType !== "page-header");
    return (
      <>
        <PageBlocks blocks={headers} />
        <AboutUsSidebarShell>
          {body.map((b, i) => (
            <Fragment key={i}>
              {i > 0 && <Divider />}
              <PageBlocks blocks={[b]} />
            </Fragment>
          ))}
        </AboutUsSidebarShell>
      </>
    );
  }
  return (
    <>
      <AboutPageHeader />
      <AboutUsSidebarShell>
        <BankPrayer />
        <Divider />
        <OurStory />
        <Divider />
        <BranchNetwork />
        <Divider />
        <JourneyTimeline />
        <Divider />
        <MissionVision />
        <Divider />
        <CoreValues />
      </AboutUsSidebarShell>
    </>
  );
}
