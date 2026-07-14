import AboutPageHeader from "@/components/about/AboutPageHeader";
import BankPrayer from "@/components/about/BankPrayer";
import OurStory from "@/components/about/OurStory";
import BranchNetwork from "@/components/about/BranchNetwork";
import JourneyTimeline from "@/components/about/JourneyTimeline";
import MissionVision from "@/components/about/MissionVision";
import CoreValues from "@/components/about/CoreValues";
import { AboutUsSidebarShell } from "./layout";

const Divider = () => <div className="border-t border-gray-200 my-10" />;

export default function AboutUsPage() {
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
