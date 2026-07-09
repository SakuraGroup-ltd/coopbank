import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { AboutUsSidebarShell } from "../layout";
import { LeadershipGrid, type Person } from "@/components/about/LeadershipGrid";
import { getLeadership } from "@/lib/leadership";

export const dynamic = "force-dynamic";

// Fallback set — used only if the leadership-team collection (category
// "executive") is empty or unreachable. Editable in Studio → Leadership.
const FALLBACK_MANAGEMENT: Person[] = [
  { name: "Mr. Godfrey J. Ng'urah", title: "Managing Director & CEO", image: "/images/management/mr-godfrey-j-ngurah.jpg" },
  { name: "Adv. Hassa S. Herith", title: "Head of Legal & Company Secretary", image: "/images/management/adv-hassa-s-herith.jpg" },
  { name: "CPA Kinyaki Obby Kinyaki", title: "Head of Finance & Strategy", image: "/images/management/cpa-kinyaki-obby-kinyaki.jpg" },
  { name: "Immaculatha Maro", title: "Head of Credit", image: "/images/management/immaculatha-maro.jpg" },
  { name: "Jackline Muro", title: "Head of Risk & Compliance", image: "/images/management/jackline-muro.jpg" },
  { name: "Mr. Hemed Nasoor", title: "Head of ICT & Innovation", image: "/images/management/mr-hemed-nasoor.jpg" },
  { name: "Mathew Msambayeti", title: "Human Resources Manager", image: "/images/management/mathew-msambayeti.jpg" },
  { name: "Yahya Kiyabo", title: "Head of Business & Co-operative Banking", image: "/images/management/yahya-kiyabo.jpg" },
];

export default async function ManagementPage() {
  const people = await getLeadership("executive", FALLBACK_MANAGEMENT);

  return (
    <>
      {/* Sub-page header */}
      <section className="bg-gradient-to-br from-[#0F3D7A] via-[#1A56A0] to-[#0F3D7A] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-20">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/about-us" className="hover:text-white/70 transition-colors">About Us</Link>
            <ChevronRight size={14} />
            <span className="text-white/70">Management Team</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Management Team
          </h1>
        </div>
      </section>

      {/* Sidebar + Content */}
      <AboutUsSidebarShell>
        <LeadershipGrid
          intro="Our executive management team drives the day-to-day operations and strategic execution of Cooperative Bank Tanzania Plc., ensuring excellence in service delivery across all branches."
          people={people}
          highlightCount={1}
        />
      </AboutUsSidebarShell>
    </>
  );
}
