import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { AboutUsSidebarShell } from "../layout";
import { LeadershipGrid, type Person } from "@/components/about/LeadershipGrid";
import { getLeadership } from "@/lib/leadership";

export const dynamic = "force-dynamic";

// Fallback set — used only if the leadership-team collection (category "board")
// is empty or unreachable. Editable version lives in Studio → Leadership.
const FALLBACK_BOARD: Person[] = [
  { name: "Dr. Joseph Ochieng Witts", title: "Board Chairman", image: "/images/board/dr-joseph-ochieng-witts.jpg" },
  { name: "Prof. Gervas M. Machimu", title: "Board Vice Chairman", image: "/images/board/prof-gervas-m-machimu.jpg" },
  { name: "Mr. Godfrey J. Ng'urah", title: "MD & CEO (Ex-Officio Board Member)", image: "/images/management/mr-godfrey-j-ngurah.jpg" },
  { name: "Adv. Hassa S. Herith", title: "Head of Legal & Company Secretary", image: "/images/board/adv-hassa-s-herith.jpg" },
  { name: "Adv. Silvanus Benedict Mlola", title: "Board Member", image: "/images/board/adv-silvanus-benedict-mlola.jpg" },
  { name: "CPA Lt. Col. Lucy Samson Chacha", title: "Board Member", image: "/images/board/cpa-lt-col-lucy-samson-chacha.jpg" },
  { name: "Dr. Aikande Clement Kwayu", title: "Board Member", image: "/images/board/dr-aikande-clement-kwayu.jpg" },
  { name: "Dr. Anthony F. Mveyange", title: "Board Member", image: "/images/board/dr-anthony-f-mveyange.jpg" },
  { name: "Dr. John M. Saus", title: "Board Member", image: "/images/board/dr-john-m-saus.jpg" },
  { name: "Mr. Mohamed N. Mwinguku", title: "Board Member", image: "/images/board/mr-mohamed-n-mwinguku.jpg" },
  { name: "Mr. Peter Situmbeko Nalitolela", title: "Board Member", image: "/images/board/mr-peter-situmbeko-nalitolela.jpg" },
  { name: "Mr. Pius N. Killo", title: "Board Member", image: "/images/board/mr-pius-n-killo.jpg" },
  { name: "Prof. Geraldine A. Rashel", title: "Board Member", image: "/images/board/prof-geraldine-a-rashel.jpg" },
];

export default async function BoardPage() {
  const people = await getLeadership("board", FALLBACK_BOARD);

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
            <span className="text-white/70">Board of Directors</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Board of Directors
          </h1>
        </div>
      </section>

      {/* Sidebar + Content */}
      <AboutUsSidebarShell>
        <LeadershipGrid
          intro="The Board of Directors provides strategic oversight and governance to ensure Cooperative Bank Tanzania Plc. fulfills its mission of empowering communities through inclusive banking."
          people={people}
          highlightCount={2}
        />
      </AboutUsSidebarShell>
    </>
  );
}
