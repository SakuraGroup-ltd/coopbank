"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  UserCircle,
  Scale,
  LayoutGrid,
  BookOpen,
  Milestone,
  Target,
  Heart,
  ChevronRight,
  Phone,
  Mail,
  HandHeart,
} from "lucide-react";

const sidebarLinks = [
  { label: "About Us", href: "/about-us", icon: Building2 },
  { label: "Board of Directors", href: "/about-us/board", icon: Users },
  {
    label: "Management Team",
    href: "/about-us/management",
    icon: UserCircle,
  },
  { label: "Code of Governance", href: "/about-us/governance", icon: Scale },
  {
    label: "Standing Committees",
    href: "/about-us/committees",
    icon: LayoutGrid,
  },
];

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      {children}

      {/* Mobile bottom tab bar for about-us navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex overflow-x-auto scrollbar-hide">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const IconComp = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-[#1A8A3A] border-t-2 border-[#1A8A3A]"
                    : "text-[#4A5568] border-t-2 border-transparent"
                }`}
              >
                <IconComp size={18} />
                <span className="whitespace-nowrap">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared sidebar shell -- imported by each about-us page             */
/* ------------------------------------------------------------------ */
/* On-page section anchors for the about-us main page */
const pageSections = [
  { id: "bank-prayer", label: "Bank Prayer", icon: HandHeart },
  { id: "our-story", label: "Our Story", icon: BookOpen },
  { id: "our-journey", label: "Our Journey", icon: Milestone },
  { id: "mission-vision", label: "Mission & Vision", icon: Target },
  { id: "core-values", label: "Core Values", icon: Heart },
];

export function AboutUsSidebarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMainAboutPage = pathname === "/about-us";
  const [activeSection, setActiveSection] = useState("");

  /* Track which section is in view via IntersectionObserver */
  useEffect(() => {
    if (!isMainAboutPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    pageSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isMainAboutPage]);

  return (
    <section className="bg-white py-16 lg:py-20 pb-28 lg:pb-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex gap-10">
          {/* Desktop Sidebar — fixed position */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Navigation links */}
              <nav className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 pt-5 pb-3">
                  <h3 className="text-[11px] font-bold text-[#1A56A0] uppercase tracking-widest">
                    Corporate
                  </h3>
                </div>
                <ul className="px-3 pb-3">
                  {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const IconComp = link.icon;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                            isActive
                              ? "text-[#1A8A3A] bg-[#1A8A3A]/8"
                              : "text-[#4A5568] hover:text-[#1A56A0] hover:bg-gray-50"
                          }`}
                        >
                          <IconComp size={15} className={isActive ? "text-[#1A8A3A]" : "text-gray-400"} />
                          <span className="flex-1">{link.label}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1A8A3A]" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* On-page section tracker (only on main about page) */}
              {isMainAboutPage && (
                <nav className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 pt-5 pb-3">
                    <h3 className="text-[11px] font-bold text-[#1A56A0] uppercase tracking-widest">
                      On This Page
                    </h3>
                  </div>
                  <ul className="px-3 pb-4">
                    {pageSections.map((section) => {
                      const isActive = activeSection === section.id;
                      const IconComp = section.icon;
                      return (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                              isActive
                                ? "text-[#1A56A0] bg-[#1A56A0]/8"
                                : "text-[#4A5568]/70 hover:text-[#1A56A0] hover:bg-gray-50"
                            }`}
                          >
                            <IconComp size={14} className={isActive ? "text-[#1A56A0]" : "text-gray-300"} />
                            <span>{section.label}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              )}

              {/* Contact card */}
              <div className="bg-[#0F3D7A] rounded-2xl p-5 text-white">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3">
                  Need Help?
                </p>
                <div className="space-y-3">
                  <a href="tel:+255272754470" className="flex items-center gap-2.5 text-sm text-white/70 hover:text-[#00C853] transition-colors">
                    <Phone size={14} className="text-[#1A8A3A]" />
                    +255 27 275 4470
                  </a>
                  <a href="mailto:info@cbtbank.co.tz" className="flex items-center gap-2.5 text-sm text-white/70 hover:text-[#00C853] transition-colors">
                    <Mail size={14} className="text-[#1A8A3A]" />
                    info@cbtbank.co.tz
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Content area */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}
