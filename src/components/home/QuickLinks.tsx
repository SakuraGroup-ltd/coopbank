"use client";

import Link from "next/link";
import { iconOf } from "@/components/blocks/icon-map";
import { safeHref } from "@/lib/safe-href";
import { defaultQuickLinks, defaultQuickLinksHeading, type QuickLinkItem } from "./home-defaults";

export default function QuickLinks({
  heading = defaultQuickLinksHeading,
  links = defaultQuickLinks,
}: {
  heading?: string;
  links?: QuickLinkItem[];
}) {
  if (!links.length) links = defaultQuickLinks;

  return (
    <section className="relative bg-white border-b border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <h2 className="text-center text-xl font-bold text-[#1A56A0] pt-6 mb-1">{heading}</h2>
        <div className="flex items-center justify-center overflow-x-auto no-scrollbar py-6 gap-2">
          {links.map((link) => {
            const Icon = iconOf(link.icon);
            return (
              <Link
                key={link.label}
                href={safeHref(link.href) || "/"}
                className="group flex flex-col items-center gap-2.5 shrink-0 px-4 sm:px-5 py-2 min-w-[100px]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#1A56A0]/10 bg-[#F2F4F8] transition-all duration-300 group-hover:border-[#1A8A3A]/30 group-hover:bg-[#1A8A3A]/10 group-hover:-translate-y-1 group-hover:shadow-md">
                  <Icon className="h-5 w-5 text-[#1A56A0] group-hover:text-[#1A8A3A] transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-semibold text-[#1A56A0]/60 group-hover:text-[#1A8A3A] transition-colors text-center leading-tight">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
