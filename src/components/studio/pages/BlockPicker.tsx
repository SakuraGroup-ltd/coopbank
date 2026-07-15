"use client";

import {
  Layout,
  Newspaper,
  LayoutGrid,
  ArrowRightLeft,
  Image as ImageIcon,
  Type,
  BarChart3,
  HelpCircle,
  Megaphone,
  X,
} from "lucide-react";
import { cn } from "../ui/cn";
import type { LucideIcon } from "lucide-react";

type Choice = {
  type: string;
  label: string;
  desc: string;
  icon: LucideIcon;
};

const GROUPS: { label: string; choices: Choice[] }[] = [
  {
    label: "Home sections",
    choices: [
      { type: "hero-slider", label: "Hero slider", desc: "Animated multi-slide hero", icon: Layout },
      { type: "quick-links", label: "Quick links", desc: "Icon tile strip", icon: LayoutGrid },
      { type: "forex-ticker", label: "Forex ticker", desc: "Live FX rates strip", icon: ArrowRightLeft },
      { type: "app-promo", label: "App promo", desc: "CoopPesa promo w/ phone", icon: ImageIcon },
      { type: "services-grid", label: "Services grid", desc: "Tabbed service cards", icon: LayoutGrid },
    ],
  },
  {
    label: "About sections",
    choices: [
      { type: "page-header", label: "Page header", desc: "Navy hero band", icon: Layout },
      { type: "bank-prayer", label: "Bank prayer", desc: "Centered prayer card", icon: Type },
      { type: "story", label: "Story", desc: "Prose paragraphs", icon: Type },
      { type: "branch-network", label: "Branch network", desc: "Branch tiles + coming soon", icon: LayoutGrid },
      { type: "journey-timeline", label: "Journey timeline", desc: "Milestone timeline", icon: BarChart3 },
      { type: "mission-vision", label: "Mission & vision", desc: "Two cards + purpose", icon: Type },
      { type: "core-values", label: "Core values", desc: "Icon value cards", icon: HelpCircle },
    ],
  },
  {
    label: "Contact sections",
    choices: [
      { type: "contact-details", label: "Contact details", desc: "Phone/email/address cards", icon: Megaphone },
      { type: "contact-form", label: "Contact form", desc: "Message form → Studio inbox", icon: Type },
      { type: "contact-map", label: "Map", desc: "Google Maps embed", icon: ImageIcon },
    ],
  },
  {
    label: "Generic",
    choices: [
      { type: "hero", label: "Hero", desc: "Big intro section", icon: Layout },
      { type: "media-slider", label: "Media slider", desc: "Rotating banners", icon: ImageIcon },
      { type: "product-carousel", label: "Product carousel", desc: "Cards with images & CTAs", icon: ArrowRightLeft },
      { type: "product-grid", label: "Product grid", desc: "Tile grid (2-4 cols)", icon: LayoutGrid },
      { type: "image-text", label: "Image + text", desc: "Two-column promo", icon: ImageIcon },
      { type: "rich-text", label: "Rich text", desc: "Long-form copy", icon: Type },
      { type: "stats", label: "Stats strip", desc: "Trust numbers", icon: BarChart3 },
      { type: "faq", label: "FAQ", desc: "Q&A accordion", icon: HelpCircle },
      { type: "cta-strip", label: "CTA strip", desc: "Call-to-action banner", icon: Megaphone },
      { type: "featured-news", label: "Featured news", desc: "Latest blog posts", icon: Newspaper },
    ],
  },
];

export function BlockPicker({
  onPick,
  onClose,
}: {
  onPick: (type: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-2xl border border-cb-navy/20 bg-studio-panel shadow-[0_8px_32px_rgba(15,15,15,0.08)] p-4 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-studio-ink-3">
          Pick a block to add
        </p>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md hover:bg-studio-soft text-studio-ink-3 hover:text-studio-ink inline-flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-studio-ink-3 mt-3 mb-2">{group.label}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {group.choices.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.type}
                  onClick={() => onPick(c.type)}
                  className={cn(
                    "p-3 rounded-xl border border-studio-border bg-studio-panel",
                    "hover:border-cb-navy/30 hover:bg-cb-navy/5",
                    "transition-colors text-left",
                  )}
                >
                  <span className="inline-flex w-7 h-7 rounded-lg bg-cb-navy/8 text-cb-navy items-center justify-center mb-2">
                    <Icon className="w-4 h-4" />
                  </span>
                  <p className="text-xs font-semibold text-studio-ink leading-tight">{c.label}</p>
                  <p className="text-[10px] text-studio-ink-3 leading-tight mt-0.5">{c.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
