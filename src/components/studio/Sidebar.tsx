/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Briefcase,
  ScrollText,
  TrendingUp,
  MapPin,
  ShieldAlert,
  Users as UsersIcon,
  Images,
  Settings,
  HelpCircle,
  Landmark,
  Percent,
  Megaphone,
  Banknote,
  History,
  LogOut,
  BookText,
  FileWarning,
  Users2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "./ui/cn";
import { Avatar } from "./ui/Avatar";

type Item = { href: string; label: string; icon: LucideIcon; scope: string; badge?: string | number };
type Group = { label: string; items: Item[] };

const groups: Group[] = [
  {
    label: "Daily",
    items: [
      { href: "/studio", label: "Dashboard", icon: LayoutDashboard, scope: "dashboard" },
      { href: "/studio/forex", label: "Forex rates", icon: TrendingUp, scope: "forex" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/studio/blog", label: "Blog & news", icon: Newspaper, scope: "blog" },
      { href: "/studio/press", label: "Press releases", icon: Megaphone, scope: "press" },
      { href: "/studio/pages", label: "Pages", icon: ScrollText, scope: "pages" },
      { href: "/studio/faqs", label: "FAQs", icon: HelpCircle, scope: "faqs" },
      { href: "/studio/media", label: "Media library", icon: Images, scope: "media" },
    ],
  },
  {
    label: "Investor Relations",
    items: [
      { href: "/studio/reports", label: "Annual reports", icon: BookText, scope: "reports" },
      { href: "/studio/team-leadership", label: "Leadership", icon: Users2, scope: "leadership" },
    ],
  },
  {
    label: "Treasury",
    items: [
      { href: "/studio/auctions", label: "Auctions", icon: Landmark, scope: "auctions" },
      { href: "/studio/rates", label: "Interest rates", icon: Percent, scope: "rates" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/studio/jobs", label: "Job listings", icon: Briefcase, scope: "jobs" },
      { href: "/studio/tenders", label: "Tenders", icon: ScrollText, scope: "tenders" },
      { href: "/studio/branches", label: "Branches", icon: MapPin, scope: "branches" },
      { href: "/studio/fees", label: "Service fees", icon: Banknote, scope: "fees" },
    ],
  },
  {
    label: "Compliance",
    items: [
      { href: "/studio/whistleblower", label: "Reports", icon: ShieldAlert, scope: "whistleblower" },
      { href: "/studio/notices", label: "Statutory notices", icon: FileWarning, scope: "notices" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/studio/activity", label: "Activity log", icon: History, scope: "activity" },
      { href: "/studio/users", label: "Team", icon: UsersIcon, scope: "users" },
      { href: "/studio/settings", label: "Settings", icon: Settings, scope: "settings" },
    ],
  },
];

export function Sidebar({
  user,
  visibleScopes,
  roleLabel,
  badges = {},
}: {
  user?: { name?: string; email?: string; avatar?: string };
  visibleScopes: string[];
  roleLabel?: string;
  badges?: Record<string, string | number>;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/studio" ? pathname === "/studio" : pathname.startsWith(href);

  // Filter to only the items this role can see, then drop any group that
  // ended up empty so we don't render a label without items.
  const filtered = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => visibleScopes.includes(i.scope)) }))
    .filter((g) => g.items.length > 0);

  return (
    <aside className="hidden lg:flex flex-col w-[260px] shrink-0 border-r border-studio-border bg-studio-panel/60 backdrop-blur-sm">
      {/* Brand — actual CoopBank wordmark, not a generic monogram */}
      <Link
        href="/studio"
        className="flex items-center gap-2.5 px-5 py-4 border-b border-studio-border"
      >
        <img
          src="/images/coopbank-logo.png"
          alt="Cooperative Bank Tanzania"
          className="h-9 w-auto object-contain"
        />
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-semibold text-cb-green bg-cb-green/8 border border-cb-green/15 px-1.5 py-0.5 rounded">
          Studio
        </span>
      </Link>

      {/* Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {filtered.map((g) => (
          <div key={g.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-studio-ink-3">
              {g.label}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const badge = badges[item.scope] ?? item.badge;
                const isUrgent = item.scope === "whistleblower" || item.scope === "tenders";
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                        active
                          ? "bg-studio-ink/5 text-studio-ink font-medium"
                          : "text-studio-ink-2 hover:bg-studio-soft hover:text-studio-ink",
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge !== undefined && Number(badge) > 0 && (
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                            isUrgent
                              ? "bg-rose-100 text-rose-700"
                              : "bg-cb-navy/8 text-cb-navy",
                          )}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User pill + logout */}
      <UserPill user={user} roleLabel={roleLabel} />
    </aside>
  );
}

function UserPill({
  user,
  roleLabel,
}: {
  user?: { name?: string; email?: string; avatar?: string };
  roleLabel?: string;
}) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/studio/logout", { method: "POST" }).catch(() => {});
    router.push("/studio/login");
    router.refresh();
  }
  return (
    <div className="mt-auto px-3 py-3 border-t border-studio-border">
      <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
        <Avatar name={user?.name || user?.email} src={user?.avatar} size={32} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-studio-ink truncate">
            {user?.name || "Editor"}
          </p>
          <p className="text-xs text-studio-ink-3 truncate">
            {roleLabel || user?.email || "not signed in"}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          title="Sign out"
          aria-label="Sign out"
          className="w-8 h-8 rounded-md text-studio-ink-3 hover:bg-rose-50 hover:text-rose-600 inline-flex items-center justify-center transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
