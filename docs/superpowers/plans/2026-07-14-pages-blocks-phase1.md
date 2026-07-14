# Pages-as-Blocks Phase 1 (Home, About, Contact) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Home, About Us, and a new Contact Us page become block-composed docs in the Payload `pages` collection, edited in the `/studio/pages` composer, rendered on the live site by the real polished components — with hardcoded fallbacks and a contact-form backend.

**Architecture:** New block types carry a single `json` field named `data` (one small uniform table per block type — the Neon schema is hand-managed with `push: false`, so typed per-field block tables are deliberately avoided). Studio mini-forms edit `block.data`; a client `BlockRenderer` (preview) and a server `PageBlocks` (live pages) both map `data` → props of the real section components. Public routes fetch their Pages doc by slug and fall back to today's hardcoded composition if absent.

**Tech Stack:** Next.js 16 App Router, Payload 3 + `@payloadcms/db-postgres` (Neon, `push:false`, hand SQL), Tailwind, framer-motion, GCS media via `POST /api/media`, SMTP2GO via `src/lib/mailer.ts`.

## Global Constraints

- **Never let Payload touch the Neon schema.** `push: false` stays. Every schema change ships as SQL in `docs/superpowers/migrations/`, applied manually AFTER read-only introspection of existing conventions (see showcase migration `2026-07-13-showcase-cards.sql` header). The `payload_locked_documents_rels` column for any new collection is REQUIRED or every update 500s.
- **Zero visual change** to `/` and `/about-us` when rendered from defaults or from seeded CMS content.
- **Every editor-controlled href** goes through `safeHref` (allow `https?://`, `/`, `#` only) at render time. Map embeds additionally require a Google Maps embed origin.
- **Images in new blocks** are stored inside `data` as `{ id, url }` (url = public GCS URL from `POST /api/media`, or a local `/images/...` path for seeded defaults). Reject `/api/media/file/*` URLs at render (known 500 gotcha).
- Brand palette: navy `#0F3D7A`/`#1A56A0`, green `#1A8A3A`/`#00C853`, ink `#1A1A2E`, body `#4A5568`, wash `#F2F4F8`/`#f4f6f9`.
- All new public routes: `export const dynamic = "force-dynamic"` (site convention behind Cloud Run).
- No test runner exists in this repo. The verification gate per task is `npx tsc --noEmit` (fast) and, where marked, `npm run build` plus a manual check against `npm run dev`.
- Array caps: hero slides ≤ 6, quick links ≤ 12, app-promo features ≤ 6, services tabs ≤ 4 (items ≤ 8/tab), values ≤ 8, milestones ≤ 12, branches ≤ 12.
- Working branch: `spike/payload-3`. Commit after every task.

---

### Task 1: Shared foundations — `safeHref` lib + icon registry

**Files:**
- Create: `src/lib/safe-href.ts`
- Create: `src/components/blocks/icon-map.ts`
- Modify: `src/components/home/showcase-data.ts:90-93` (delegate to the lib)

**Interfaces:**
- Produces: `safeHref(href?: string | null): string` from `@/lib/safe-href`; `safeImg(url?: string | null): string` from `@/lib/safe-href`; `ICONS: Record<string, LucideIcon>`, `ICON_NAMES: string[]`, `iconOf(name?: string): LucideIcon` from `@/components/blocks/icon-map`.

- [ ] **Step 1: Create `src/lib/safe-href.ts`**

```ts
// Scheme guards for editor-controlled URLs (stored-XSS defence, see 069e092).
// safeHref: only http(s), site-relative, or hash links survive.
// safeImg:  only https or local-public image URLs survive; the legacy
//           /api/media/file/* proxy 500s on live and is rejected outright.
export function safeHref(href: string | null | undefined): string {
  const h = (href || "").trim();
  return /^(https?:\/\/|\/|#)/i.test(h) ? h : "";
}

export function safeImg(url: string | null | undefined): string {
  const u = (url || "").trim();
  if (!u || u.includes("/api/media/file/")) return "";
  return /^(https:\/\/|\/)/i.test(u) ? u : "";
}
```

- [ ] **Step 2: Delegate the existing copy in `showcase-data.ts`**

Replace the `safeHref` function body in `src/components/home/showcase-data.ts` (lines 90-93) with a re-export so existing imports keep working:

```ts
export { safeHref } from "@/lib/safe-href";
```

(Delete the old inline implementation; keep everything else in the file.)

- [ ] **Step 3: Create `src/components/blocks/icon-map.ts`**

```ts
// Curated lucide icons editors can pick by name in Studio. CMS stores the
// string key; components resolve it here. Adding an icon = one line.
import {
  PiggyBank, CreditCard, Banknote, Tractor, Smartphone, Users, MapPin,
  BarChart3, Globe, Calculator, Store, Send, Receipt, Shield, Bell, QrCode,
  ShoppingCart, Zap, Briefcase, Car, Building2, Target, Eye, Heart,
  Lightbulb, TrendingUp, Award, Phone, Mail, Clock, HelpCircle, Landmark,
  Fingerprint, Wallet, CircleDot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  PiggyBank, CreditCard, Banknote, Tractor, Smartphone, Users, MapPin,
  BarChart3, Globe, Calculator, Store, Send, Receipt, Shield, Bell, QrCode,
  ShoppingCart, Zap, Briefcase, Car, Building2, Target, Eye, Heart,
  Lightbulb, TrendingUp, Award, Phone, Mail, Clock, HelpCircle, Landmark,
  Fingerprint, Wallet,
};

export const ICON_NAMES = Object.keys(ICONS).sort();

export function iconOf(name?: string | null): LucideIcon {
  return (name && ICONS[name]) || CircleDot;
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/safe-href.ts src/components/blocks/icon-map.ts src/components/home/showcase-data.ts
git commit -m "feat(blocks): shared safeHref/safeImg guards + studio icon registry"
```

---

### Task 2: Home section components take props (defaults preserved)

**Files:**
- Create: `src/components/home/home-defaults.ts`
- Create: `src/components/home/ForexTickerSection.tsx`
- Modify: `src/components/home/Hero.tsx`
- Modify: `src/components/home/QuickLinks.tsx`
- Modify: `src/components/home/MobileBanking.tsx`
- Modify: `src/components/home/ServicesGrid.tsx`
- Modify: `src/app/(main)/page.tsx`

**Interfaces:**
- Produces (all optional-prop components render identically to today when called bare):
  - `Hero({ slides?: HeroSlide[] })` where `HeroSlide = { image: string; tagline: string; headline: string; desc: string; cta1: { label: string; href: string }; cta2: { label: string; href: string } }`
  - `QuickLinks({ heading?: string; links?: QuickLinkItem[] })` where `QuickLinkItem = { icon: string; label: string; href: string }`
  - `MobileBanking({ badge?, heading?, copy?, features?: AppFeature[], appStoreUrl?, playStoreUrl?, ussdCode?, mockupImage? }: AppPromoProps)` where `AppFeature = { icon: string; title: string; desc: string }`
  - `ServicesGrid({ tabs?: ServiceTab[] })` where `ServiceTab = { id: string; label: string; items: { icon: string; title: string; desc: string; href: string }[] }`
  - `ForexTickerSection()` — async server component wrapping the rates fetch + `<ForexTicker rates={...}/>`
  - `home-defaults.ts` exports `defaultHeroSlides`, `defaultQuickLinks`, `defaultQuickLinksHeading`, `defaultAppPromo`, `defaultServiceTabs` (plain data, icons as string names — importable from seed scripts).

- [ ] **Step 1: Create `src/components/home/home-defaults.ts`**

Move the hardcoded content out of the four components verbatim, icons converted to registry names:

```ts
// Default (fallback) content for the Home sections. These are the exact
// values that were hardcoded in the components before the sections became
// CMS-driven blocks — used when no published `home` Pages doc exists, and by
// scripts/seed-pages.ts to seed the CMS with what the live site shows today.

export type HeroSlide = {
  image: string;
  tagline: string;
  headline: string;
  desc: string;
  cta1: { label: string; href: string };
  cta2: { label: string; href: string };
};

export const defaultHeroSlides: HeroSlide[] = [
  {
    image: "/images/hero-president.jpg",
    tagline: "Benki ya Ushirikiano",
    headline: "Trusted by the Nation, Built for Every Tanzanian",
    desc: "From farmers to entrepreneurs, CoopBank serves over 2 million customers with financial solutions that uplift communities.",
    cta1: { label: "About Us", href: "/about-us" },
    cta2: { label: "Our Impact", href: "/about-us#impact" },
  },
  {
    image: "/images/hero-farming.jpg",
    tagline: "Ustawi kwa wote",
    headline: "Empowering Communities Through Cooperative Banking",
    desc: "Accessible financial services for individuals, businesses, and communities across Tanzania.",
    cta1: { label: "Download CoopPesa", href: "/digital-banking#download" },
    cta2: { label: "Explore Services", href: "#services" },
  },
  {
    image: "/images/products/coopnet-lady.jpg",
    tagline: "Benki Yako Mkononi",
    headline: "Digital Banking, Designed for You",
    desc: "Manage your finances anytime, anywhere. Mobile banking, instant transfers, and secure payments at your fingertips.",
    cta1: { label: "Mobile Banking", href: "/digital-banking" },
    cta2: { label: "Download CoopPesa", href: "/digital-banking#download" },
  },
];

export type QuickLinkItem = { icon: string; label: string; href: string };

export const defaultQuickLinksHeading = "Banking Made Simple";

export const defaultQuickLinks: QuickLinkItem[] = [
  { icon: "PiggyBank", label: "Savings & Current", href: "/personal-banking" },
  { icon: "CreditCard", label: "Debit Cards", href: "/cards" },
  { icon: "Banknote", label: "Personal Loans", href: "/loan-products#salaried" },
  { icon: "Tractor", label: "Agri Loans", href: "/loan-products#agri-business" },
  { icon: "Smartphone", label: "Mobile Banking", href: "/digital-banking#coopesa" },
  { icon: "Store", label: "Agency Banking", href: "/digital-banking#coopwakala" },
  { icon: "Globe", label: "Treasury & Forex", href: "/treasury/foreign-exchange" },
  { icon: "Calculator", label: "Loan Calculator", href: "/loan-products#calculator" },
  { icon: "MapPin", label: "Branches & ATMs", href: "/branches" },
];

export type AppFeature = { icon: string; title: string; desc: string };

export type AppPromoContent = {
  badge: string;
  heading: string;
  copy: string;
  features: AppFeature[];
  appStoreUrl: string;
  playStoreUrl: string;
  ussdCode: string;
  mockupImage: string;
};

export const defaultAppPromo: AppPromoContent = {
  badge: "Coop-Pesa",
  heading: "Banking at Your Fingertips with CoopPesa",
  copy: "Send money, pay bills, apply for loans, and manage your accounts -- all from your smartphone. Available on Android and iOS.",
  features: [
    { icon: "Send", title: "Instant Transfers", desc: "Send money to any bank or mobile wallet in seconds" },
    { icon: "Receipt", title: "Bill Payments", desc: "Pay LUKU, DAWASA, school fees and government services" },
    { icon: "CreditCard", title: "Digital Loans", desc: "Apply and get approved instantly from your phone" },
    { icon: "Shield", title: "Biometric Security", desc: "Fingerprint and Face ID for secure access" },
    { icon: "Bell", title: "Real-time Alerts", desc: "Instant push notifications for every transaction" },
    { icon: "QrCode", title: "TAN-QR Payments", desc: "Lipa Namba -- scan to pay all networks nationwide" },
  ],
  appStoreUrl: "https://apps.apple.com/tz/app/coopesa/id6755827543",
  playStoreUrl: "https://play.google.com/store/apps/details?id=tz.co.coopbank.coopesa&hl=en",
  ussdCode: "*150*84#",
  mockupImage: "/images/coopesa-mockup.png",
};

export type ServiceTabItem = { icon: string; title: string; desc: string; href: string };
export type ServiceTab = { id: string; label: string; items: ServiceTabItem[] };

export const defaultServiceTabs: ServiceTab[] = [
  {
    id: "cards",
    label: "Cards & Payments",
    items: [
      { icon: "CreditCard", title: "Visa Debit Card", desc: "Linked to your CoopBank account", href: "/cards#visa-debit" },
      { icon: "CreditCard", title: "Visa Prepaid Card", desc: "Load & spend anywhere", href: "/cards#visa-prepaid" },
      { icon: "QrCode", title: "TAN-QR Pay", desc: "Lipa Namba all networks", href: "/cards#qr-pay" },
      { icon: "Globe", title: "Online Shopping", desc: "Secure e-commerce payments", href: "/cards#online" },
      { icon: "ShoppingCart", title: "Bill Payments", desc: "LUKU, DAWASA, school fees & more", href: "/cards#bill-pay" },
    ],
  },
  {
    id: "loans",
    label: "Loans",
    items: [
      { icon: "Tractor", title: "Agri-Business Loans", desc: "TSH 100K-50M, 8-12% rate", href: "/loan-products#agri-business" },
      { icon: "PiggyBank", title: "Salaried Loans", desc: "Fast payroll-linked loans", href: "/loan-products#salaried" },
      { icon: "Smartphone", title: "Digital Loans", desc: "Instant via CoopPesa app", href: "/loan-products#digital" },
      { icon: "Briefcase", title: "SME Loans", desc: "Working capital & asset finance", href: "/loan-products#sme" },
      { icon: "Car", title: "Asset Financing", desc: "Up to 80% asset value", href: "/loan-products#asset-financing" },
      { icon: "Store", title: "Business Loans", desc: "Corporate & large enterprise", href: "/loan-products#business" },
    ],
  },
];
```

- [ ] **Step 2: Refactor `Hero.tsx` to props**

In `src/components/home/Hero.tsx`: delete the local `Slide` interface and `slides` const (lines 7-41); import the type + defaults; change the signature. The JSX body is untouched except `slides` now comes from props:

```tsx
import { defaultHeroSlides, type HeroSlide } from "./home-defaults";

export default function Hero({ slides = defaultHeroSlides }: { slides?: HeroSlide[] }) {
  // ...existing body unchanged, all references to `slides` now use the prop
```

Guard the empty case at the top of the component (CMS could save zero slides):

```tsx
  if (!slides.length) slides = defaultHeroSlides;
```

- [ ] **Step 3: Refactor `QuickLinks.tsx` to props**

Delete the local `QuickLink` interface + `links` const (lines 19-35), the direct lucide imports of the tile icons (keep none — `iconOf` covers them), and use:

```tsx
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
```

In the map body, resolve icon and guard the href:

```tsx
          {links.map((link) => {
            const Icon = iconOf(link.icon);
            return (
              <Link
                key={link.label}
                href={safeHref(link.href) || "/"}
```

The `<h2>` text becomes `{heading}`. Everything else (classes, structure) unchanged.

- [ ] **Step 4: Refactor `MobileBanking.tsx` to props**

Delete local `Feature` interface + `features` const (lines 13-26). Keep the `channels` const (it is not rendered by this section's current JSX — verify; if truly unused, delete it too). New signature:

```tsx
import { iconOf } from "@/components/blocks/icon-map";
import { safeHref, safeImg } from "@/lib/safe-href";
import { defaultAppPromo, type AppPromoContent } from "./home-defaults";

export default function MobileBanking(props: Partial<AppPromoContent> = {}) {
  const c: AppPromoContent = { ...defaultAppPromo, ...props };
  if (!c.features?.length) c.features = defaultAppPromo.features;
```

Substitutions in the JSX (structure/classes untouched):
- Badge text → `{c.badge}`; `<h2>` → `{c.heading}`; paragraph → `{c.copy}`
- Features map over `c.features` with `const Icon = iconOf(f.icon);`
- App Store `Link href={safeHref(c.appStoreUrl) || defaultAppPromo.appStoreUrl}`; Play Store likewise with `c.playStoreUrl`
- USSD `<span>` → `{c.ussdCode}`
- Mockup `<Image src={safeImg(c.mockupImage) || defaultAppPromo.mockupImage} ...>`

- [ ] **Step 5: Refactor `ServicesGrid.tsx` to props**

Delete local `ServiceItem`/`Tab` interfaces + `tabs` const (lines 13-50). New signature:

```tsx
import { iconOf } from "@/components/blocks/icon-map";
import { safeHref } from "@/lib/safe-href";
import { defaultServiceTabs, type ServiceTab } from "./home-defaults";

export default function ServicesGrid({ tabs = defaultServiceTabs }: { tabs?: ServiceTab[] }) {
  if (!tabs.length) tabs = defaultServiceTabs;
  const [activeTab, setActiveTab] = useState(tabs[0].id);
```

Note `useState(tabs[0].id)` replaces `useState("cards")`, and `const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];` replaces the non-null assertion. Item icons via `iconOf(item.icon)`, item links via `safeHref(item.href) || "#"`.

- [ ] **Step 6: Create `src/components/home/ForexTickerSection.tsx`**

Move the whole rates-fetch from `src/app/(main)/page.tsx` (lines 12-57) into a reusable server component:

```tsx
// Server wrapper: fetches FX rates from Payload and renders the ticker.
// Extracted from the home route so block-composed pages can place it too.
import { getPayload } from "payload";
import config from "../../../payload.config";
import ForexTicker from "./ForexTicker";

type TickerRate = {
  currency_code: string;
  currency_name: string;
  flag_emoji: string;
  buy_rate: string;
  sell_rate: string;
  trend: string;
  updated_date: string;
  active: string;
};

export default async function ForexTickerSection() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "forex-rates",
    limit: 20,
    depth: 0,
    sort: "currencyCode",
  });
  const rates: TickerRate[] = result.docs
    .map((d) => {
      const r = d as unknown as {
        currencyCode: string;
        currencyName: string;
        flagEmoji?: string;
        buyRate: number;
        sellRate: number;
        trend?: string;
        updatedDate?: string;
        active?: boolean;
      };
      return {
        currency_code: r.currencyCode,
        currency_name: r.currencyName,
        flag_emoji: r.flagEmoji || "",
        buy_rate: String(r.buyRate),
        sell_rate: String(r.sellRate),
        trend: r.trend || "neutral",
        updated_date: r.updatedDate?.slice(0, 10) || "",
        active: r.active === false ? "false" : "true",
      };
    })
    .filter((r) => r.active !== "false");
  return <ForexTicker rates={rates} />;
}
```

- [ ] **Step 7: Slim `src/app/(main)/page.tsx`**

```tsx
import Hero from "@/components/home/Hero";
import QuickLinks from "@/components/home/QuickLinks";
import MobileBanking from "@/components/home/MobileBanking";
import ForexTickerSection from "@/components/home/ForexTickerSection";
import ServicesGrid from "@/components/home/ServicesGrid";
import ProductsCarousel from "@/components/home/ProductsCarousel";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <>
      <Hero />
      <QuickLinks />
      <ForexTickerSection />
      <ProductsCarousel />
      <MobileBanking />
      <ServicesGrid />
    </>
  );
}
```

(This file gains the CMS fetch in Task 10 — this step is the pure-refactor checkpoint.)

- [ ] **Step 8: Verify no visual change**

Run: `npx tsc --noEmit` → clean. Then `npm run dev`, open `http://localhost:3000/` and eyeball hero slider, quick links, ticker, carousel, CoopPesa promo, services tabs — identical to before.

- [ ] **Step 9: Commit**

```bash
git add src/components/home src/app/\(main\)/page.tsx
git commit -m "refactor(home): section components take CMS-shaped props with hardcoded defaults"
```

---

### Task 3: About page split into parameterized section components

**Files:**
- Create: `src/components/about/about-defaults.ts`
- Create: `src/components/about/FadeIn.tsx`
- Create: `src/components/about/AboutPageHeader.tsx`
- Create: `src/components/about/BankPrayer.tsx`
- Create: `src/components/about/OurStory.tsx`
- Create: `src/components/about/BranchNetwork.tsx`
- Create: `src/components/about/JourneyTimeline.tsx`
- Create: `src/components/about/MissionVision.tsx`
- Create: `src/components/about/CoreValues.tsx`
- Modify: `src/app/(main)/about-us/page.tsx` (shrinks to a composition)

**Interfaces:**
- Produces (all "use client", all render today's content with no props):
  - `AboutPageHeader({ badge?, title?, subtitle?, breadcrumb? }: { badge?: string; title?: string; subtitle?: string; breadcrumb?: string })`
  - `BankPrayer({ heading?, paragraphs?, amen? }: { heading?: string; paragraphs?: { text: string }[]; amen?: string })`
  - `OurStory({ heading?, paragraphs? }: { heading?: string; paragraphs?: { text: string }[] })`
  - `BranchNetwork({ heading?, intro?, branches?, comingSoonText? }: { heading?: string; intro?: string; branches?: { name: string }[]; comingSoonText?: string })`
  - `JourneyTimeline({ heading?, intro?, milestones? }: { heading?: string; intro?: string; milestones?: Milestone[] })` where `Milestone = { year: string; title: string; desc: string; color?: string }`
  - `MissionVision({ heading?, missionTitle?, missionText?, visionTitle?, visionText?, purposeLabel?, purposeText? })` (all `string?`)
  - `CoreValues({ heading?, values? }: { heading?: string; values?: { icon: string; title: string; description: string }[] })`
  - `about-defaults.ts` exports `defaultAboutHeader`, `defaultPrayer`, `defaultStoryParagraphs`, `defaultBranchNetwork`, `defaultMilestones`, `defaultMissionVision`, `defaultCoreValues` (plain data, icons as string names).

- [ ] **Step 1: Create `src/components/about/about-defaults.ts`**

Lift every literal from `src/app/(main)/about-us/page.tsx` into typed data. Exact content — copy the strings verbatim from the current page (hero lines 116-139, prayer 152-184, story 197-223, branch network 235-261, journey 304-332, mission/vision 377-406, values 64-80):

```ts
export const defaultAboutHeader = {
  badge: "+ About Us",
  title: "Banking Built on Trust",
  subtitle:
    "For over 25 years, Cooperative Bank Tanzania Plc. has been rooted in the cooperative movement — empowering individuals, businesses, and communities across Tanzania.",
  breadcrumb: "About Us",
};

export const defaultPrayer = {
  heading: "Bank Prayer",
  paragraphs: [
    { text: "Ewe Mwenyezi Mungu Muumba wa Mbingu na Nchi,\nTunakushukuru kwa Kutujalia Kuiona Siku ya Leo." },
    { text: "Tunakuomba Utujalie Amani, Upendo na Ushirikiano\nTunapoanza Siku Yetu ya Leo." },
    { text: "Tunakuomba Uwape Busara na Hekima Viongozi\nWetu, Waweze Kutuongoza Vema na Kutoa Maamuzi\nSahihi Yatakayo Inufaisha Benki, Wafanyakazi na\nJamii kwa Ujumla ili Benki Iendelee Kustawi." },
    { text: "Tunakuomba Utujalie Uwezo wa Kufanya Kazi\nkwa Bidii, Maarifa na kwa Kujituma kwa Kufuata\nTaratibu Zote ili Kuepuka Hasara Zinazoweza\nKujitokeza." },
    { text: "Tunaiombea Amani Nchi Yetu ya Tanzania,\nWateja na Wadau Wote wa Benki ili\nTuendelee Kutoa Huduma kwa Tija na Ufanisi." },
    { text: "Eeh Mwenyezi Mungu Tunaomba Tuianze na\nKumaliza Siku Hii ya Leo Chini ya Uangalizi Wako." },
  ],
  amen: "Amina",
};

export const defaultStory = {
  heading: "Our Story",
  paragraphs: [
    { text: "Cooperative Bank Tanzania Plc was established in the 1990s to serve the financial needs of cooperative societies and their members across Tanzania. Founded on the principles of self-help, mutual responsibility, and community ownership, the Bank remains committed to providing inclusive and accessible financial services." },
    { text: "Over the years, the Bank has continuously modernized its services through digital solutions such as CoopNet Internet Banking, the CoopPesa Mobile App, and CoopWakala agency banking, strengthening its mission of expanding financial inclusion, particularly in rural and underserved communities." },
    { text: "A major milestone in the Bank's growth was achieved in 2024 following the merger of Kilimanjaro Cooperative Bank Limited (KCBL) and Tandahimba Community Bank Limited (TCBL), forming Cooperative Bank Tanzania. This strategic merger strengthened the Bank's capacity to serve cooperative institutions, SMEs, farmers, and retail customers nationwide." },
    { text: "Today, Coop Bank Tanzania continues to embrace innovation and digital transformation while building a strong branch and agency network, with a long-term target of establishing over 30 branches nationwide." },
  ],
};

export const defaultBranchNetwork = {
  heading: "Our Branch Network",
  intro: "Growing our presence across Tanzania — from established branches to exciting new locations on the horizon.",
  branches: [{ name: "Dodoma" }, { name: "Mtwara" }, { name: "Tabora" }, { name: "Moshi" }],
  comingSoonText:
    "We are launching new branches in Kagera, Mbeya, Mwanza, and Dar es Salaam between Q3 2026 and Q2 2027, with more locations planned as part of our continued national growth strategy.",
};

export type Milestone = { year: string; title: string; desc: string; color?: string };

export const defaultJourney: { heading: string; intro: string; milestones: Milestone[] } = {
  heading: "Our Journey",
  intro: "Key milestones in the growth of Cooperative Bank Tanzania.",
  milestones: [
    { year: "1990s", title: "Bank Established", desc: "Cooperative Bank Tanzania established to serve cooperative societies and SACCOs, built on self-help, mutual responsibility, and community ownership.", color: "#1A8A3A" },
    { year: "2023", title: "Banking License", desc: "COOP Bank granted a full commercial banking license by the Bank of Tanzania in 2023, marking a key milestone in establishing a modern, member-centred institution.", color: "#1A56A0" },
    { year: "2024", title: "Strategic Merger", desc: "KCBL and TCBL merged to form Cooperative Bank Tanzania, strengthening capacity to serve SMEs, farmers, and retail customers nationwide.", color: "#1A56A0" },
    { year: "2026+", title: "National Expansion", desc: "New branches launching in Kagera, Mbeya, Mwanza, and Dar es Salaam — part of a long-term target of 30+ branches nationwide.", color: "#1A8A3A" },
  ],
};

export const defaultMissionVision = {
  heading: "Mission & Vision",
  missionTitle: "Our Mission",
  missionText:
    "Provide tailored financial solutions, powered by innovation and technology to deliver financial inclusion, member experience and value creation to stakeholders.",
  visionTitle: "Our Vision",
  visionText:
    "To be a leading high-end technology and member-centred Coop Bank, driving financial inclusion.",
  purposeLabel: "Bank Purpose",
  purposeText:
    "Driving socio-economic transformation of our members through financial inclusion initiatives and AI-powered digital innovations to empower and impact livelihoods of ten million families by 2030.",
};

export const defaultCoreValues = {
  heading: "Core Values",
  values: [
    { icon: "Users", title: "Team Player", description: "Collaborate openly, support others. Listen actively, show respect." },
    { icon: "Zap", title: "Agility", description: "Embrace change, adapt quickly. Stay flexible, drive innovation." },
    { icon: "Shield", title: "Accountability", description: "Own our actions, show integrity. Be transparent, keep learning." },
  ],
};
```

Note the prayer paragraphs use `\n` where the page had `<br />`; the `BankPrayer` component re-splits on `\n` so the render is identical (and studio editors get a plain textarea).

- [ ] **Step 2: Create `src/components/about/FadeIn.tsx`**

Move the `FadeIn` wrapper (about page lines 28-53) verbatim into its own client file and export it:

```tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function FadeIn({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  );
}
```

(The exact `initial/animate/transition` values must be copied from the current file — read `src/app/(main)/about-us/page.tsx:28-53` and keep them identical; the block above shows the shape, the current file is the source of truth.)

- [ ] **Step 3: Create the seven section components**

Each is `"use client"`, takes optional props defaulting to the Task-1 data, and its JSX is the corresponding section moved verbatim from `about-us/page.tsx` with literals replaced by props. Pattern (full example for the two trickiest; the rest are direct moves):

`src/components/about/BankPrayer.tsx`:

```tsx
"use client";

import { FadeIn } from "./FadeIn";
import { defaultPrayer } from "./about-defaults";

export default function BankPrayer({
  heading = defaultPrayer.heading,
  paragraphs = defaultPrayer.paragraphs,
  amen = defaultPrayer.amen,
}: {
  heading?: string;
  paragraphs?: { text: string }[];
  amen?: string;
}) {
  if (!paragraphs.length) paragraphs = defaultPrayer.paragraphs;
  return (
    <FadeIn className="mb-14" id="bank-prayer">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-5">{heading}</h2>
      <div
        className="rounded-2xl border border-[#1A56A0]/20 bg-[#f4f6f9] px-8 py-10 text-center space-y-5"
        style={{ fontVariant: "small-caps" }}
      >
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[#2D3748] leading-relaxed font-medium">
            {p.text.split("\n").map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        ))}
        <p className="text-2xl font-extrabold text-[#1A56A0] tracking-widest mt-4">{amen}</p>
      </div>
    </FadeIn>
  );
}
```

`src/components/about/AboutPageHeader.tsx` (the hero band, page lines 91-141, breadcrumb + badge + title + subtitle parameterized — motion blocks kept exactly):

```tsx
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { defaultAboutHeader } from "./about-defaults";

export default function AboutPageHeader({
  badge = defaultAboutHeader.badge,
  title = defaultAboutHeader.title,
  subtitle = defaultAboutHeader.subtitle,
  breadcrumb = defaultAboutHeader.breadcrumb,
}: {
  badge?: string;
  title?: string;
  subtitle?: string;
  breadcrumb?: string;
}) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: "1200px", backgroundRepeat: "repeat" }}
      />
      <div className="absolute inset-0 bg-[#1A56A0]/[0.99] pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.nav
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-sm text-white/50 mb-8"
        >
          <Link href="/" className="hover:text-white transition-colors font-medium">Home</Link>
          <ChevronRight size={14} className="text-white/30" />
          <span className="text-white font-semibold">{breadcrumb}</span>
        </motion.nav>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-5"
        >
          <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
            {badge}
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 text-center"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-white/60 max-w-2xl mx-auto text-lg leading-relaxed"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}
```

`OurStory.tsx`, `BranchNetwork.tsx`, `JourneyTimeline.tsx`, `MissionVision.tsx`, `CoreValues.tsx`: identical procedure — move the section JSX from `about-us/page.tsx` (line anchors: story 192-225, branch network 231-263, journey 269-358, mission/vision 364-409, values 415-438) into the new file, wrap in the props signature listed in **Interfaces**, replace each literal with its prop, map arrays from props. Two specifics:
- `JourneyTimeline`: milestone `position` alternates by index (`i % 2 === 0 ? "bottom" : "top"`) instead of being stored data; `color` falls back to `i % 2 === 0 ? "#1A8A3A" : "#1A56A0"`.
- `CoreValues`: `const Icon = iconOf(value.icon);` from `@/components/blocks/icon-map`, rendered as `<Icon size={20} className="text-[#1A8A3A]" />`.

- [ ] **Step 4: Rewrite `src/app/(main)/about-us/page.tsx` as a composition**

```tsx
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
```

(Task 10 adds the CMS fetch here. The old page's now-unused imports/`heroStats` are deleted with the move.)

- [ ] **Step 5: Verify + commit**

`npx tsc --noEmit` clean; `npm run dev` → `/about-us` pixel-identical (prayer line breaks, timeline alternation, values icons).

```bash
git add src/components/about src/app/\(main\)/about-us/page.tsx
git commit -m "refactor(about): split page into parameterized section components with defaults"
```

---

### Task 4: Contact components + `/contact-us` page + nav repoint

**Files:**
- Create: `src/components/contact/contact-defaults.ts`
- Create: `src/components/contact/ContactDetails.tsx`
- Create: `src/components/contact/ContactForm.tsx`
- Create: `src/components/contact/ContactMap.tsx`
- Create: `src/app/(main)/contact-us/page.tsx`
- Modify: `src/components/layout/Navbar.tsx:412,703` (`/about-us#contact` → `/contact-us`)

**Interfaces:**
- Consumes: `AboutPageHeader` (Task 3) for the page hero band; `safeHref` (Task 1).
- Produces:
  - `ContactDetails({ heading?, intro?, phone?, email?, address?, hours? })` (all `string?`)
  - `ContactForm({ heading?, intro?, successMessage? })` — client form POSTing JSON to `/api/contact` (built in Task 5; until then submits show the error state, which is fine pre-deploy)
  - `ContactMap({ heading?, embedUrl? })` — only renders an iframe when `embedUrl` matches `^https://www\.google\.com/maps/embed`
  - `contact-defaults.ts` exports `defaultContactHeader`, `defaultContactDetails`, `defaultContactForm`, `defaultContactMap`.

- [ ] **Step 1: Create `src/components/contact/contact-defaults.ts`**

```ts
export const defaultContactHeader = {
  badge: "+ Contact Us",
  title: "We're Here to Help",
  subtitle:
    "Reach Cooperative Bank Tanzania by phone, email, or visit any of our branches. Our team responds within one business day.",
  breadcrumb: "Contact Us",
};

export const defaultContactDetails = {
  heading: "Get in Touch",
  intro: "Talk to us through any of these channels.",
  phone: "+255 27 275 4470",
  email: "info@cbtbank.co.tz",
  address: "Sikukuu Street, P.O. Box 201, Dodoma",
  hours: "Monday – Friday, 8:30 – 16:30 · Saturday, 8:30 – 12:30",
};

export const defaultContactForm = {
  heading: "Send Us a Message",
  intro: "Fill in the form and our customer care team will get back to you.",
  successMessage: "Thank you — your message has been received. We will get back to you within one business day.",
};

export const defaultContactMap = {
  heading: "Find Us",
  embedUrl: "", // set a Google Maps embed URL in Studio to show the map
};
```

- [ ] **Step 2: Create `ContactDetails.tsx`**

```tsx
"use client";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { FadeIn } from "@/components/about/FadeIn";
import { defaultContactDetails } from "./contact-defaults";

export default function ContactDetails(props: Partial<typeof defaultContactDetails> = {}) {
  const c = { ...defaultContactDetails, ...props };
  const cards = [
    { icon: Phone, label: "Call Us", value: c.phone, href: `tel:${c.phone.replace(/\s+/g, "")}` },
    { icon: Mail, label: "Email Us", value: c.email, href: `mailto:${c.email}` },
    { icon: MapPin, label: "Head Office", value: c.address },
    { icon: Clock, label: "Working Hours", value: c.hours },
  ];
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-2">{c.heading}</h2>
          <p className="text-[#4A5568] mb-8">{c.intro}</p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => {
            const Icon = card.icon;
            const inner = (
              <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-[#f4f6f9] p-6 h-full hover:shadow-md transition-shadow">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#1A8A3A]/10">
                  <Icon size={20} className="text-[#1A8A3A]" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A2E] mb-1">{card.label}</h3>
                  <p className="text-sm text-[#4A5568] leading-relaxed">{card.value}</p>
                </div>
              </div>
            );
            return (
              <FadeIn key={card.label} delay={i * 0.08}>
                {card.href ? <a href={card.href}>{inner}</a> : inner}
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `ContactForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/about/FadeIn";
import { defaultContactForm } from "./contact-defaults";

type State = "idle" | "sending" | "sent" | "error";

export default function ContactForm(props: Partial<typeof defaultContactForm> = {}) {
  const c = { ...defaultContactForm, ...props };
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = Object.fromEntries(fd.entries());
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again or email us directly.");
      }
      setState("sent");
      form.reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const input =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#1A1A2E] placeholder:text-[#4A5568]/50 focus:border-[#1A8A3A] focus:ring-2 focus:ring-[#1A8A3A]/15 focus:outline-none";

  return (
    <section className="py-14 bg-[#F2F4F8]" id="message">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-2">{c.heading}</h2>
          <p className="text-[#4A5568] mb-8">{c.intro}</p>
        </FadeIn>
        {state === "sent" ? (
          <div className="rounded-2xl border border-[#1A8A3A]/25 bg-[#1A8A3A]/5 p-8 flex items-start gap-4">
            <CheckCircle2 className="text-[#1A8A3A] shrink-0 mt-0.5" size={22} />
            <p className="text-[#1A1A2E] leading-relaxed">{c.successMessage}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Honeypot — humans never see or fill this */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={input} name="name" placeholder="Full name" required maxLength={120} />
              <input className={input} name="email" type="email" placeholder="Email address" required maxLength={160} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={input} name="phone" placeholder="Phone (optional)" maxLength={30} />
              <input className={input} name="subject" placeholder="Subject" required maxLength={160} />
            </div>
            <textarea className={input} name="message" placeholder="How can we help?" required rows={6} maxLength={4000} />
            {state === "error" && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1A8A3A] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#00C853] disabled:opacity-60"
            >
              {state === "sending" && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `ContactMap.tsx`**

```tsx
"use client";

import { FadeIn } from "@/components/about/FadeIn";
import { defaultContactMap } from "./contact-defaults";

// Only Google Maps embeds may render — an editor-saved URL becomes an iframe
// src, so anything else is a phishing/XSS vector and is dropped.
function safeMapUrl(url?: string): string {
  const u = (url || "").trim();
  return /^https:\/\/www\.google\.com\/maps\/embed/.test(u) ? u : "";
}

export default function ContactMap(props: Partial<typeof defaultContactMap> = {}) {
  const c = { ...defaultContactMap, ...props };
  const src = safeMapUrl(c.embedUrl);
  if (!src) return null;
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-6">{c.heading}</h2>
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <iframe
              src={src}
              className="w-full h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="CoopBank head office map"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create `src/app/(main)/contact-us/page.tsx`**

```tsx
import type { Metadata } from "next";
import AboutPageHeader from "@/components/about/AboutPageHeader";
import ContactDetails from "@/components/contact/ContactDetails";
import ContactForm from "@/components/contact/ContactForm";
import ContactMap from "@/components/contact/ContactMap";
import { defaultContactHeader } from "@/components/contact/contact-defaults";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us | Cooperative Bank Tanzania",
  description: "Reach Cooperative Bank Tanzania by phone, email, or through our contact form.",
};

export default function ContactUsPage() {
  return (
    <>
      <AboutPageHeader {...defaultContactHeader} />
      <ContactDetails />
      <ContactForm />
      <ContactMap />
    </>
  );
}
```

(Task 10 adds the CMS fetch. `ContactMap` renders nothing until an embed URL is set in Studio.)

- [ ] **Step 6: Repoint the Navbar**

In `src/components/layout/Navbar.tsx` change BOTH `href="/about-us#contact"` occurrences (the "Support" top-bar link near line 412 and the "Contact Us" mega-menu link near line 703) to `href="/contact-us"`.

- [ ] **Step 7: Verify + commit**

`npx tsc --noEmit`; `npm run dev` → `/contact-us` shows header/details/form (submit shows the error state — endpoint arrives in Task 5); nav links land on the new page.

```bash
git add src/components/contact src/app/\(main\)/contact-us src/components/layout/Navbar.tsx
git commit -m "feat(contact): standalone /contact-us page (details, form UI, guarded map) + nav repoint"
```

---

### Task 5: Contact backend — collection, API route, mail notify

**Files:**
- Create: `src/payload/collections/ContactMessages.ts`
- Create: `src/app/api/contact/route.ts`
- Modify: `payload.config.ts` (import + register collection)
- Modify: `src/payload/globals/SiteSettings.ts` (add `contactFormEmail` to the `contact` group, after `email`)
- Create: `docs/superpowers/migrations/2026-07-14-contact-messages.sql`

**Interfaces:**
- Consumes: `sendNotificationEmail(args: SendArgs): Promise<SendResult>` from `@/lib/mailer`.
- Produces: `POST /api/contact` accepting JSON `{ name, email, phone?, subject, message, website? }`, returning `{ success: true }` | `{ error }` (400/429/500); collection slug `contact-messages` with fields `name, email, phone, subject, message, status(new|read|handled), internalNotes`.

- [ ] **Step 1: Create `src/payload/collections/ContactMessages.ts`**

```ts
import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { editorOf } from "../access/editorOf";

// Messages from the public /contact-us form. Created ONLY by the
// /api/contact route (overrideAccess) — direct REST creates are blocked so
// the honeypot + rate limit can't be bypassed. Marketing triages in Studio.
export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  admin: {
    group: "Site Content",
    useAsTitle: "subject",
    defaultColumns: ["name", "subject", "status", "createdAt"],
    description: "Public contact-form submissions. Triage in Studio → Contact messages.",
  },
  access: {
    create: () => false, // API route uses overrideAccess
    read: editorOf("marketing"),
    update: editorOf("marketing"),
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "subject", type: "text", required: true },
    { name: "message", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Read", value: "read" },
        { label: "Handled", value: "handled" },
      ],
    },
    { name: "internalNotes", type: "textarea", admin: { description: "Triage notes — never shown publicly." } },
  ],
};
```

- [ ] **Step 2: Register in `payload.config.ts`**

Add `import { ContactMessages } from "./src/payload/collections/ContactMessages";` beside the other collection imports and append `ContactMessages` to the `collections: [...]` array.

- [ ] **Step 3: Add the notify address to SiteSettings**

In `src/payload/globals/SiteSettings.ts`, inside the `contact` group after the `email` field:

```ts
        { name: "contactFormEmail", type: "email", defaultValue: "info@cbtbank.co.tz", admin: { description: "Where /contact-us form submissions are emailed." } },
```

- [ ] **Step 4: Create `src/app/api/contact/route.ts`**

```ts
// Public contact-form submission: validate → honeypot → per-IP rate limit →
// store in contact-messages → best-effort email notify (never blocks).
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "../../../../payload.config";
import { sendNotificationEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory, per-instance limiter — best effort on Cloud Run, good enough to
// stop naive scripts. 5 submissions per IP per hour.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear(); // memory backstop
  return false;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, string> | null;
    if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    // Honeypot filled → pretend success, store nothing.
    if ((body.website || "").trim()) return NextResponse.json({ success: true });

    const name = (body.name || "").trim().slice(0, 120);
    const email = (body.email || "").trim().slice(0, 160);
    const phone = (body.phone || "").trim().slice(0, 30);
    const subject = (body.subject || "").trim().slice(0, 160);
    const message = (body.message || "").trim().slice(0, 4000);
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Please fill in your name, email, subject and message." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (rateLimited(ip)) {
      return NextResponse.json({ error: "Too many messages — please try again later." }, { status: 429 });
    }

    const payload = await getPayload({ config });
    await payload.create({
      collection: "contact-messages",
      overrideAccess: true,
      data: { name, email, phone, subject, message, status: "new" },
    });

    // Best-effort notify — the message is already stored either way.
    try {
      const settings = await payload.findGlobal({ slug: "site-settings" }).catch(() => null);
      const to =
        (settings as { contact?: { contactFormEmail?: string; email?: string } } | null)?.contact
          ?.contactFormEmail ||
        (settings as { contact?: { email?: string } } | null)?.contact?.email ||
        "info@cbtbank.co.tz";
      const mail = await sendNotificationEmail({
        to,
        replyTo: email,
        subject: `Website contact: ${subject}`,
        html: `<div style="font-family:sans-serif">
          <h3>New message from the CoopBank website contact form</h3>
          <p><b>Name:</b> ${esc(name)}<br/>
             <b>Email:</b> ${esc(email)}<br/>
             ${phone ? `<b>Phone:</b> ${esc(phone)}<br/>` : ""}
             <b>Subject:</b> ${esc(subject)}</p>
          <p style="white-space:pre-wrap">${esc(message)}</p>
          <p>Manage in <b>Studio → Contact messages</b>.</p>
        </div>`,
      });
      if (!mail.ok) console.error("[CONTACT] notification email not sent:", mail.error);
    } catch (mailErr) {
      console.error("[CONTACT] notification email failed", mailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CONTACT] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please email us directly." }, { status: 500 });
  }
}
```

> **Mail domain check (from spec):** before deploy, confirm `cbtbank.co.tz` is still a verified sending domain in SMTP2GO (recent mail work retired/changed domain setups). If it was removed, update `MAIL_FROM` env on the Cloud Run service to a currently-verified domain.

- [ ] **Step 5: Write the migration — `docs/superpowers/migrations/2026-07-14-contact-messages.sql`**

Mirror the showcase-cards conventions (verify types against `information_schema.columns` for `media_coverage` before applying — see that file's header):

```sql
-- Additive migration: contact-messages collection (public contact form).
-- Apply manually to Neon (push:false). Mirrors media_coverage conventions.
-- payload_locked_documents_rels column is REQUIRED (lock query joins it).

BEGIN;

CREATE TYPE enum_contact_messages_status AS ENUM ('new', 'read', 'handled');

CREATE TABLE IF NOT EXISTS contact_messages (
  id serial PRIMARY KEY,
  name character varying NOT NULL,
  email character varying NOT NULL,
  phone character varying,
  subject character varying NOT NULL,
  message character varying NOT NULL,
  status enum_contact_messages_status DEFAULT 'new',
  internal_notes character varying,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_messages_updated_at_idx ON contact_messages USING btree (updated_at);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages USING btree (created_at);

ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS contact_messages_id integer;
ALTER TABLE payload_locked_documents_rels
  DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_contact_messages_fk;
ALTER TABLE payload_locked_documents_rels
  ADD CONSTRAINT payload_locked_documents_rels_contact_messages_fk
  FOREIGN KEY (contact_messages_id) REFERENCES contact_messages(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_contact_messages_id_idx
  ON payload_locked_documents_rels USING btree (contact_messages_id);

-- SiteSettings gains contact.contactFormEmail (verify column-name convention
-- against existing site_settings columns, e.g. contact_email):
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_contact_form_email character varying;

COMMIT;
```

(Do NOT apply yet — Task 12 applies all SQL in one reviewed session.)

- [ ] **Step 6: Regenerate Payload types**

Run: `npx payload generate:types`
Expected: `src/payload-types.ts` gains `ContactMessage`. Then `npx tsc --noEmit` clean.

- [ ] **Step 7: Commit**

```bash
git add src/payload/collections/ContactMessages.ts payload.config.ts src/payload/globals/SiteSettings.ts src/app/api/contact docs/superpowers/migrations/2026-07-14-contact-messages.sql payload-types.ts src/payload-types.ts
git commit -m "feat(contact): contact-messages collection, rate-limited /api/contact, mail notify + SQL migration"
```

(Only one of `payload-types.ts`/`src/payload-types.ts` exists — config points at `payload-types.ts` in repo root per `typescript.outputFile`; add whichever changed.)

---

### Task 6: Studio — Contact messages triage view

**Files:**
- Create: `src/app/(studio)/studio/messages/page.tsx`
- Create: `src/components/studio/messages/MessageList.tsx`
- Modify: `src/components/studio/Sidebar.tsx` (add entry to the "Content" group after "Chat & concerns")

**Interfaces:**
- Consumes: `requireStudioUser()` from `@/lib/studio/auth`; Payload REST `PATCH /api/contact-messages/:id` (studio session cookie authorizes via `editorOf("marketing")`).
- Produces: `/studio/messages` list page; `MessageList({ initial: MessageRow[] })` where `MessageRow = { id: number; name: string; email: string; phone?: string; subject: string; message: string; status: string; createdAt: string }`.

- [ ] **Step 1: Create the server page**

```tsx
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { MessageList, type MessageRow } from "@/components/studio/messages/MessageList";

export const dynamic = "force-dynamic";

export default async function MessagesStudioPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const res = await payload
    .find({ collection: "contact-messages", sort: "-createdAt", limit: 200, depth: 0, overrideAccess: true })
    .catch(() => ({ docs: [] as unknown[] }));
  const rows: MessageRow[] = (res.docs as Record<string, unknown>[]).map((d) => ({
    id: d.id as number,
    name: (d.name as string) || "",
    email: (d.email as string) || "",
    phone: (d.phone as string) || "",
    subject: (d.subject as string) || "",
    message: (d.message as string) || "",
    status: (d.status as string) || "new",
    createdAt: (d.createdAt as string) || "",
  }));
  return (
    <div className="p-8 lg:p-10">
      <h1 className="text-2xl font-semibold text-studio-ink mb-1">Contact messages</h1>
      <p className="text-sm text-studio-ink-3 mb-6">Submissions from the /contact-us form. Mark as read or handled as you triage.</p>
      <MessageList initial={rows} />
    </div>
  );
}
```

- [ ] **Step 2: Create `MessageList.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Phone } from "lucide-react";
import { Badge } from "../ui/Badge";

export type MessageRow = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

const TONE: Record<string, "success" | "neutral" | "warning"> = {
  new: "warning",
  read: "neutral",
  handled: "success",
};

export function MessageList({ initial }: { initial: MessageRow[] }) {
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  async function setStatus(id: number, status: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setRows((r) => r.map((m) => (m.id === id ? { ...m, status } : m)));
    } finally {
      setBusy(null);
    }
  }

  if (!rows.length) {
    return <p className="text-sm text-studio-ink-3 border border-dashed border-studio-border rounded-2xl p-10 text-center">No messages yet.</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((m) => {
        const isOpen = open === m.id;
        return (
          <div key={m.id} className="rounded-2xl border border-studio-border bg-studio-panel overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              onClick={() => {
                setOpen(isOpen ? null : m.id);
                if (!isOpen && m.status === "new") setStatus(m.id, "read");
              }}
            >
              <Badge tone={TONE[m.status] || "neutral"}>{m.status}</Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-studio-ink truncate">{m.subject}</p>
                <p className="text-xs text-studio-ink-3 truncate">{m.name} · {m.email}{m.createdAt ? ` · ${new Date(m.createdAt).toLocaleString()}` : ""}</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-studio-ink-3" /> : <ChevronDown className="w-4 h-4 text-studio-ink-3" />}
            </button>
            {isOpen && (
              <div className="border-t border-studio-border bg-studio-soft/50 p-5 space-y-4">
                <p className="text-sm text-studio-ink whitespace-pre-wrap">{m.message}</p>
                <div className="flex items-center gap-4 text-xs text-studio-ink-2">
                  <a className="inline-flex items-center gap-1.5 hover:text-cb-navy" href={`mailto:${m.email}`}><Mail className="w-3.5 h-3.5" />{m.email}</a>
                  {m.phone && <a className="inline-flex items-center gap-1.5 hover:text-cb-navy" href={`tel:${m.phone}`}><Phone className="w-3.5 h-3.5" />{m.phone}</a>}
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={busy === m.id || m.status === "handled"}
                    onClick={() => setStatus(m.id, "handled")}
                    className="h-8 px-3 text-xs rounded-lg bg-studio-ink text-white font-medium disabled:opacity-40"
                  >
                    Mark handled
                  </button>
                  {m.status === "handled" && (
                    <button
                      disabled={busy === m.id}
                      onClick={() => setStatus(m.id, "read")}
                      className="h-8 px-3 text-xs rounded-lg border border-studio-border font-medium"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

(If `Badge` has no `warning` tone, check `src/components/studio/ui/Badge.tsx` and use its nearest tone — do not extend Badge in this task.)

- [ ] **Step 3: Sidebar entry**

In `src/components/studio/Sidebar.tsx`, "Content" group, after the "Chat & concerns" item:

```ts
      { href: "/studio/messages", label: "Contact messages", icon: Inbox, scope: "conversations" },
```

Add `Inbox` to the existing lucide import.

- [ ] **Step 4: Verify + commit**

`npx tsc --noEmit` clean. (Runtime check happens in Task 12 after SQL applies.)

```bash
git add src/app/\(studio\)/studio/messages src/components/studio/messages src/components/studio/Sidebar.tsx
git commit -m "feat(studio): contact-messages triage view"
```

---

### Task 7: Block schemas (14 × json-data) + registry + SQL

**Files:**
- Create: `src/payload/blocks/sections.ts` (all 14 new block configs in one file — they are uniform 8-liners)
- Modify: `src/payload/blocks/index.ts` (register them)
- Modify: `src/payload/globals/Homepage.ts` (REMOVE the `layout` blocks field — the home page's block stack lives in Pages slug=home; keeping `allBlocks` on this global would demand a full set of `homepage_blocks_*` tables for nothing)
- Create: `docs/superpowers/migrations/2026-07-14-section-block-tables.sql`

**Interfaces:**
- Produces: block slugs `hero-slider, quick-links, app-promo, services-grid, forex-ticker, page-header, bank-prayer, story, branch-network, journey-timeline, mission-vision, core-values, contact-details, contact-form, contact-map` — each a Payload Block with exactly one field: `{ name: "data", type: "json" }`. `SECTION_BLOCK_SLUGS: string[]` export for reuse (renderers, catch-all).
- The `data` payloads (documented in the file header, enforced by the Studio editors, defaulted by the components):
  - `hero-slider`: `{ slides: [{ image?: {id?,url}, tagline, headline, desc, cta1Label, cta1Href, cta2Label, cta2Href }] }`
  - `quick-links`: `{ heading, links: [{ icon, label, href }] }`
  - `app-promo`: `{ badge, heading, copy, features: [{icon,title,desc}], appStoreUrl, playStoreUrl, ussdCode, mockup?: {id?,url} }`
  - `services-grid`: `{ tabs: [{ id, label, items: [{icon,title,desc,href}] }] }`
  - `forex-ticker`: `{}` (placement marker)
  - `page-header`: `{ badge, title, subtitle, breadcrumb }`
  - `bank-prayer`: `{ heading, paragraphs: [{text}], amen }`
  - `story`: `{ heading, paragraphs: [{text}] }`
  - `branch-network`: `{ heading, intro, branches: [{name}], comingSoonText }`
  - `journey-timeline`: `{ heading, intro, milestones: [{year,title,desc,color?}] }`
  - `mission-vision`: `{ heading, missionTitle, missionText, visionTitle, visionText, purposeLabel, purposeText }`
  - `core-values`: `{ heading, values: [{icon,title,description}] }`
  - `contact-details`: `{ heading, intro, phone, email, address, hours }`
  - `contact-form`: `{ heading, intro, successMessage }`
  - `contact-map`: `{ heading, embedUrl }`

- [ ] **Step 1: Create `src/payload/blocks/sections.ts`**

```ts
import type { Block } from "payload";

// Section blocks — the CMS mirror of the real site components (Hero,
// QuickLinks, About sections, Contact sections…). Each carries ONE json
// field: the Studio composer owns the editing UX and the renderers own the
// mapping, so Payload stores an opaque `data` blob. This is deliberate: the
// Neon schema is hand-managed (push:false) and a json column per block type
// keeps the SQL surface to one tiny uniform table per block instead of a
// web of typed field + array tables. Data shapes are documented in
// docs/superpowers/plans/2026-07-14-pages-blocks-phase1.md (Task 7).
const section = (slug: string, singular: string): Block => ({
  slug,
  labels: { singular, plural: `${singular} blocks` },
  fields: [{ name: "data", type: "json" }],
});

export const HeroSliderBlock = section("hero-slider", "Hero slider");
export const QuickLinksBlock = section("quick-links", "Quick links");
export const AppPromoBlock = section("app-promo", "App promo (CoopPesa)");
export const ServicesGridBlock = section("services-grid", "Services grid");
export const ForexTickerBlock = section("forex-ticker", "Forex ticker");
export const PageHeaderBlock = section("page-header", "Page header");
export const BankPrayerBlock = section("bank-prayer", "Bank prayer");
export const StoryBlock = section("story", "Story");
export const BranchNetworkBlock = section("branch-network", "Branch network");
export const JourneyTimelineBlock = section("journey-timeline", "Journey timeline");
export const MissionVisionBlock = section("mission-vision", "Mission & vision");
export const CoreValuesBlock = section("core-values", "Core values");
export const ContactDetailsBlock = section("contact-details", "Contact details");
export const ContactFormBlock = section("contact-form", "Contact form");
export const ContactMapBlock = section("contact-map", "Contact map");

export const sectionBlocks = [
  HeroSliderBlock, QuickLinksBlock, AppPromoBlock, ServicesGridBlock,
  ForexTickerBlock, PageHeaderBlock, BankPrayerBlock, StoryBlock,
  BranchNetworkBlock, JourneyTimelineBlock, MissionVisionBlock,
  CoreValuesBlock, ContactDetailsBlock, ContactFormBlock, ContactMapBlock,
];

export const SECTION_BLOCK_SLUGS = sectionBlocks.map((b) => b.slug);
```

(That's 15 slugs — `forex-ticker` joins the 14 from the spec table as the placement marker the spec's §4 describes.)

- [ ] **Step 2: Register in `src/payload/blocks/index.ts`**

```ts
import { sectionBlocks } from "./sections";
export { SECTION_BLOCK_SLUGS } from "./sections";

export const allBlocks = [
  // ...existing ten blocks unchanged...
  ...sectionBlocks,
];
```

- [ ] **Step 3: Remove `layout` from the Homepage global**

In `src/payload/globals/Homepage.ts` delete the `layout` field entry (the `{ name: "layout", type: "blocks", ... }` object) and the now-unused `allBlocks` import. Keep `featuredBlogPosts` and the admin config. Update the admin `description` to: `"Site-wide homepage settings — featured news rail picks. The homepage itself is composed in Pages → 'home'."`

Then confirm nothing reads it: `grep -rn "homepage" src/app src/components --include="*.tsx" -l` — if any hit reads `layout` from the homepage global, stop and surface it before proceeding.

- [ ] **Step 4: Write the SQL migration — `docs/superpowers/migrations/2026-07-14-section-block-tables.sql`**

**MANDATORY first: introspect the existing block-table conventions** (read-only) so the template below is corrected to match reality before applying:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name IN ('pages_blocks_hero', '_pages_v_blocks_hero')
ORDER BY table_name, ordinal_position;

SELECT indexname, indexdef FROM pg_indexes
WHERE tablename IN ('pages_blocks_hero', '_pages_v_blocks_hero');
```

Template (repeat the pair for each of the 15 slugs, snake_cased — `hero_slider`, `quick_links`, `app_promo`, `services_grid`, `forex_ticker`, `page_header`, `bank_prayer`, `story`, `branch_network`, `journey_timeline`, `mission_vision`, `core_values`, `contact_details`, `contact_form`, `contact_map`). Payload 3 drizzle conventions, adjust to introspection:

```sql
-- Live table (published pages)
CREATE TABLE IF NOT EXISTS pages_blocks_hero_slider (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying PRIMARY KEY,
  data jsonb,
  block_name character varying,
  CONSTRAINT pages_blocks_hero_slider_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES pages(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS pages_blocks_hero_slider_order_idx ON pages_blocks_hero_slider (_order);
CREATE INDEX IF NOT EXISTS pages_blocks_hero_slider_parent_id_idx ON pages_blocks_hero_slider (_parent_id);
CREATE INDEX IF NOT EXISTS pages_blocks_hero_slider_path_idx ON pages_blocks_hero_slider (_path);

-- Versions table (drafts/version history)
CREATE TABLE IF NOT EXISTS _pages_v_blocks_hero_slider (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id serial PRIMARY KEY,
  data jsonb,
  _uuid character varying,
  block_name character varying,
  CONSTRAINT _pages_v_blocks_hero_slider_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES _pages_v(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_hero_slider_order_idx ON _pages_v_blocks_hero_slider (_order);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_hero_slider_parent_id_idx ON _pages_v_blocks_hero_slider (_parent_id);
CREATE INDEX IF NOT EXISTS _pages_v_blocks_hero_slider_path_idx ON _pages_v_blocks_hero_slider (_path);
```

Wrap the whole file in `BEGIN; ... COMMIT;` with the same header comment style as the showcase migration. (Do NOT apply yet — Task 12.)

- [ ] **Step 5: Regenerate types + verify + commit**

`npx payload generate:types` then `npx tsc --noEmit` clean.

```bash
git add src/payload/blocks payload.config.ts src/payload/globals/Homepage.ts docs/superpowers/migrations/2026-07-14-section-block-tables.sql payload-types.ts src/payload-types.ts
git commit -m "feat(blocks): 15 json-data section block types + SQL migration; retire Homepage.layout"
```

---

### Task 8: Studio wiring — picker groups, labels, editors

**Files:**
- Create: `src/components/studio/editor/ImageField.tsx`
- Create: `src/components/studio/editor/IconSelect.tsx`
- Create: `src/components/studio/pages/SectionBlockEditors.tsx`
- Modify: `src/components/studio/pages/BlockPicker.tsx` (grouped choices)
- Modify: `src/components/studio/pages/BlockEditor.tsx` (dispatch new types)
- Modify: `src/components/studio/pages/PageComposer.tsx` (`BLOCK_LABEL` + `summarizeBlock` entries)

**Interfaces:**
- Consumes: `POST /api/media` multipart (`file` + `_payload` JSON with `alt`) → `{ doc: { id, url } }`; `ICON_NAMES`/`iconOf` (Task 1).
- Produces:
  - `ImageField({ label, value, alt, onChange }: { label: string; value?: { id?: number; url: string } | null; alt?: string; onChange: (v: { id: number; url: string } | null) => void })`
  - `IconSelect({ value, onChange }: { value?: string; onChange: (v: string) => void })`
  - `SectionBlockEditor({ block, onChange })` — handles every slug in `SECTION_BLOCK_SLUGS`, editing `block.data` (all patches wrap as `{ data: { ...block.data, ...patch } }`).

- [ ] **Step 1: Create `ImageField.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";

export function ImageField({
  label,
  value,
  alt,
  onChange,
}: {
  label: string;
  value?: { id?: number; url: string } | null;
  alt?: string;
  onChange: (v: { id: number; url: string } | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("_payload", JSON.stringify({ alt: alt || label }));
      const res = await fetch("/api/media", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`upload HTTP ${res.status}`);
      const data = await res.json();
      onChange({ id: data.doc.id, url: data.doc.url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-studio-ink-3">{label}</span>
        {error && <span className="text-[10px] text-rose-600">{error}</span>}
      </div>
      <div className="flex items-center gap-3">
        {value?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt={alt || ""} className="h-14 w-20 object-cover rounded-lg border border-studio-border" />
        ) : (
          <span className="h-14 w-20 rounded-lg border border-dashed border-studio-border inline-flex items-center justify-center text-studio-ink-3">
            <ImageIcon className="w-4 h-4" />
          </span>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="h-8 px-3 text-xs rounded-lg border border-studio-border bg-studio-panel hover:bg-studio-soft font-medium inline-flex items-center gap-1.5"
        >
          {busy && <Loader2 className="w-3 h-3 animate-spin" />}
          {value?.url ? "Replace" : "Upload"}
        </button>
        {value?.url && (
          <button type="button" onClick={() => onChange(null)} className="h-8 w-8 rounded-lg text-studio-ink-3 hover:bg-rose-50 hover:text-rose-600 inline-flex items-center justify-center" title="Remove">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `IconSelect.tsx`**

```tsx
"use client";

import { ICON_NAMES, iconOf } from "@/components/blocks/icon-map";
import { Select } from "../ui/Select";

export function IconSelect({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const Icon = iconOf(value);
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 h-8 rounded-lg bg-studio-soft border border-studio-border inline-flex items-center justify-center text-studio-ink-2 shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <Select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">— icon —</option>
        {ICON_NAMES.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </Select>
    </div>
  );
}
```

- [ ] **Step 3: Create `SectionBlockEditors.tsx`**

One file with a mini-form per section block operating on `block.data`. Shared helpers at the top; the same visual language as `BlockEditor.tsx` (import its exported helpers if you extract them, otherwise re-declare the tiny `Label`/`TextArea`/`AddBtn`/`RemoveBtn` locally — extraction into a shared `./editor-ui.tsx` is preferred to avoid duplication: move `Label`, `FieldRow`, `Subsection`, `TextArea`, `AddBtn`, `RemoveBtn`, `updateArr`, `removeArr` from `BlockEditor.tsx` into `src/components/studio/pages/editor-ui.tsx` and import them from both files).

Core pattern of the file:

```tsx
"use client";

import { Input } from "../ui/Input";
import { ImageField } from "../editor/ImageField";
import { IconSelect } from "../editor/IconSelect";
import { Label, FieldRow, Subsection, TextArea, AddBtn, RemoveBtn } from "./editor-ui";

type Block = { blockType: string; data?: Record<string, unknown>; [k: string]: unknown };
type OnChange = (d: Record<string, unknown>) => void;
type Img = { id?: number; url: string } | null;

// Every section block stores its content under `data` — patches merge there.
function dataOf(block: Block): Record<string, unknown> {
  return (block.data as Record<string, unknown>) || {};
}
function patcher(block: Block, onChange: OnChange) {
  return (patch: Record<string, unknown>) => onChange({ data: { ...dataOf(block), ...patch } });
}

export function SectionBlockEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  switch (block.blockType) {
    case "hero-slider": return <HeroSliderEditor block={block} onChange={onChange} />;
    case "quick-links": return <QuickLinksEditor block={block} onChange={onChange} />;
    case "app-promo": return <AppPromoEditor block={block} onChange={onChange} />;
    case "services-grid": return <ServicesGridEditor block={block} onChange={onChange} />;
    case "forex-ticker": return <NoConfig label="Forex ticker" note="Rates come from Studio → Forex rates. This block just places the ticker." />;
    case "page-header": return <PageHeaderEditor block={block} onChange={onChange} />;
    case "bank-prayer": return <BankPrayerEditor block={block} onChange={onChange} />;
    case "story": return <StoryEditor block={block} onChange={onChange} />;
    case "branch-network": return <BranchNetworkEditor block={block} onChange={onChange} />;
    case "journey-timeline": return <JourneyTimelineEditor block={block} onChange={onChange} />;
    case "mission-vision": return <MissionVisionEditor block={block} onChange={onChange} />;
    case "core-values": return <CoreValuesEditor block={block} onChange={onChange} />;
    case "contact-details": return <ContactDetailsEditor block={block} onChange={onChange} />;
    case "contact-form": return <ContactFormEditor block={block} onChange={onChange} />;
    case "contact-map": return <ContactMapEditor block={block} onChange={onChange} />;
    default: return null;
  }
}

function NoConfig({ label, note }: { label: string; note: string }) {
  return <p className="text-xs text-studio-ink-3">{label}: {note}</p>;
}
```

Then the editors. Write each one fully; representative implementations (the rest follow the exact same shape — a field per data key, arrays via `Subsection` + add/remove, caps enforced by hiding the Add button):

```tsx
function HeroSliderEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  const slides = (d.slides as Array<Record<string, unknown>>) || [];
  const setSlide = (i: number, p: Record<string, unknown>) =>
    patch({ slides: slides.map((s, idx) => (idx === i ? { ...s, ...p } : s)) });
  return (
    <div className="space-y-3">
      <Subsection title={`Slides (${slides.length}/6)`}>
        {slides.map((s, i) => (
          <div key={i} className="rounded-lg border border-studio-border p-3 mb-2 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-studio-ink">Slide {i + 1}</p>
              <RemoveBtn onClick={() => patch({ slides: slides.filter((_, idx) => idx !== i) })} />
            </div>
            <ImageField label="Background image" value={s.image as Img} alt={(s.headline as string) || "Hero slide"} onChange={(v) => setSlide(i, { image: v })} />
            <FieldRow>
              <Input value={(s.tagline as string) || ""} onChange={(e) => setSlide(i, { tagline: e.target.value })} placeholder="Swahili tagline" />
              <Input value={(s.headline as string) || ""} onChange={(e) => setSlide(i, { headline: e.target.value })} placeholder="Headline" />
            </FieldRow>
            <TextArea value={(s.desc as string) || ""} onChange={(v) => setSlide(i, { desc: v })} placeholder="Description" />
            <FieldRow>
              <Input value={(s.cta1Label as string) || ""} onChange={(e) => setSlide(i, { cta1Label: e.target.value })} placeholder="CTA 1 label" />
              <Input value={(s.cta1Href as string) || ""} onChange={(e) => setSlide(i, { cta1Href: e.target.value })} placeholder="/path or https://" />
            </FieldRow>
            <FieldRow>
              <Input value={(s.cta2Label as string) || ""} onChange={(e) => setSlide(i, { cta2Label: e.target.value })} placeholder="CTA 2 label" />
              <Input value={(s.cta2Href as string) || ""} onChange={(e) => setSlide(i, { cta2Href: e.target.value })} placeholder="/path or https://" />
            </FieldRow>
          </div>
        ))}
        {slides.length < 6 && <AddBtn onClick={() => patch({ slides: [...slides, {}] })}>Add slide</AddBtn>}
      </Subsection>
    </div>
  );
}

function QuickLinksEditor({ block, onChange }: { block: Block; onChange: OnChange }) {
  const d = dataOf(block);
  const patch = patcher(block, onChange);
  const links = (d.links as Array<Record<string, unknown>>) || [];
  const setLink = (i: number, p: Record<string, unknown>) =>
    patch({ links: links.map((l, idx) => (idx === i ? { ...l, ...p } : l)) });
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input value={(d.heading as string) || ""} onChange={(e) => patch({ heading: e.target.value })} placeholder="Banking Made Simple" />
      </div>
      <Subsection title={`Links (${links.length}/12)`}>
        {links.map((l, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 mb-2 items-center">
            <IconSelect value={(l.icon as string) || ""} onChange={(v) => setLink(i, { icon: v })} />
            <Input value={(l.label as string) || ""} onChange={(e) => setLink(i, { label: e.target.value })} placeholder="Label" />
            <Input value={(l.href as string) || ""} onChange={(e) => setLink(i, { href: e.target.value })} placeholder="/path" />
            <RemoveBtn onClick={() => patch({ links: links.filter((_, idx) => idx !== i) })} />
          </div>
        ))}
        {links.length < 12 && <AddBtn onClick={() => patch({ links: [...links, {}] })}>Add link</AddBtn>}
      </Subsection>
    </div>
  );
}
```

The remaining editors, same idiom, exact fields:
- `AppPromoEditor`: Inputs `badge`, `heading`; TextArea `copy`; `ImageField` for `mockup`; Inputs `appStoreUrl`, `playStoreUrl`, `ussdCode`; features array (≤6) each `IconSelect icon` + `Input title` + `Input desc`.
- `ServicesGridEditor`: tabs array (≤4), each with `Input id` (auto-fill from label lowercased if blank on add), `Input label`, nested items array (≤8) each `IconSelect icon` + `Input title` + `Input desc` + `Input href`. Nested update helpers mirror `setSlide` two levels deep.
- `PageHeaderEditor`: Inputs `badge`, `title`, `breadcrumb`; TextArea `subtitle`.
- `BankPrayerEditor`: Input `heading`; paragraphs array (TextArea `text`, rows 3, hint "line breaks preserved"); Input `amen`.
- `StoryEditor`: Input `heading`; paragraphs array (TextArea `text`, rows 4).
- `BranchNetworkEditor`: Input `heading`; TextArea `intro`; branches array (≤12) each `Input name`; TextArea `comingSoonText`.
- `JourneyTimelineEditor`: Input `heading`; TextArea `intro`; milestones array (≤12) each Inputs `year`, `title` + TextArea `desc`.
- `MissionVisionEditor`: Input `heading`; Inputs `missionTitle`, `visionTitle`, `purposeLabel`; TextAreas `missionText`, `visionText`, `purposeText`.
- `CoreValuesEditor`: Input `heading`; values array (≤8) each `IconSelect icon` + `Input title` + TextArea `description`.
- `ContactDetailsEditor`: Inputs `heading`, `phone`, `email`; TextAreas `intro`, `address`; Input `hours`.
- `ContactFormEditor`: Input `heading`; TextAreas `intro`, `successMessage`.
- `ContactMapEditor`: Input `heading`; Input `embedUrl` with hint `Google Maps → Share → Embed → copy the src URL (must start with https://www.google.com/maps/embed)`.

- [ ] **Step 4: Dispatch from `BlockEditor.tsx`**

Add to the top of the switch in `BlockEditor`:

```tsx
import { SectionBlockEditor } from "./SectionBlockEditors";
import { SECTION_BLOCK_SLUGS } from "@/payload/blocks/sections";
// inside BlockEditor, before the switch:
  if (SECTION_BLOCK_SLUGS.includes(block.blockType)) {
    return <SectionBlockEditor block={block} onChange={onChange} />;
  }
```

(And perform the `editor-ui.tsx` extraction from Step 3 so both files share helpers.)

- [ ] **Step 5: Grouped `BlockPicker`**

Rework `CHOICES` into groups and render a heading per group (keep the existing card styling):

```tsx
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
    choices: [ /* the existing ten CHOICES entries, unchanged */ ],
  },
];
```

Render: for each group a `<p className="text-[10px] font-semibold uppercase tracking-wider text-studio-ink-3 mt-3 mb-2">{label}</p>` followed by the existing grid of buttons.

- [ ] **Step 6: Labels + summaries in `PageComposer.tsx`**

Extend `BLOCK_LABEL`:

```ts
  "hero-slider": "Hero slider",
  "quick-links": "Quick links",
  "app-promo": "App promo",
  "services-grid": "Services grid",
  "forex-ticker": "Forex ticker",
  "page-header": "Page header",
  "bank-prayer": "Bank prayer",
  story: "Story",
  "branch-network": "Branch network",
  "journey-timeline": "Journey timeline",
  "mission-vision": "Mission & vision",
  "core-values": "Core values",
  "contact-details": "Contact details",
  "contact-form": "Contact form",
  "contact-map": "Map",
```

Extend `summarizeBlock` (before the final return; `data` may be absent):

```ts
  const data = (block.data as Record<string, unknown>) || {};
  if (block.blockType === "hero-slider") {
    const n = ((data.slides as unknown[]) || []).length;
    return `${n} slide${n === 1 ? "" : "s"}`;
  }
  if (block.blockType === "quick-links") {
    const n = ((data.links as unknown[]) || []).length;
    return `${(data.heading as string) || "Quick links"} · ${n} link${n === 1 ? "" : "s"}`;
  }
  if (block.blockType === "page-header") return (data.title as string) || "—";
  if (["app-promo", "story", "bank-prayer", "branch-network", "journey-timeline", "mission-vision", "core-values", "contact-details", "contact-form", "contact-map"].includes(block.blockType)) {
    return (data.heading as string) || "—";
  }
  if (block.blockType === "forex-ticker") return "FX rates strip";
  if (block.blockType === "services-grid") {
    const n = ((data.tabs as unknown[]) || []).length;
    return `${n} tab${n === 1 ? "" : "s"}`;
  }
```

- [ ] **Step 7: Verify + commit**

`npx tsc --noEmit` clean; `npm run dev` → `/studio/pages` → new page → picker shows the four groups; add a Hero slider block, upload an image, fields persist through save (draft POST works even without new tables? NO — saving blocks needs the tables. Until Task 12 applies SQL, verify UI only up to editing state; expect save to 500 and note it. Do not chase that error — it disappears when the migration lands.)

```bash
git add src/components/studio
git commit -m "feat(studio): section-block editors, grouped picker, image/icon fields"
```

---

### Task 9: Renderers — client preview + server live

**Files:**
- Create: `src/components/blocks/map-section-props.ts`
- Create: `src/components/blocks/SectionBlockClient.tsx`
- Create: `src/components/blocks/PageBlocks.tsx`
- Modify: `src/components/preview/BlockRenderer.tsx` (delegate section slugs)

**Interfaces:**
- Consumes: every component + defaults from Tasks 2-4; `SECTION_BLOCK_SLUGS`; `safeHref`/`safeImg`.
- Produces:
  - `mapSectionProps(blockType: string, data: Record<string, unknown>): Record<string, unknown>` — pure, client-safe mapping of stored `data` → component props (all hrefs/images guarded here, in ONE place).
  - `SectionBlockClient({ block })` — client component rendering any section block via the real components (used by preview; `forex-ticker` renders a labelled placeholder strip since rates need the server).
  - `PageBlocks({ blocks })` — async server component for live pages: section blocks → real components (`forex-ticker` → `ForexTickerSection`, `product-carousel` → existing `ProductsCarousel`), all other block types → existing `BlockRenderer`.

- [ ] **Step 1: Create `map-section-props.ts`**

```ts
// data (as stored in the CMS json) → props of the real section components.
// The ONLY place stored URLs become render props, so the scheme guards
// concentrate here. Client-safe: no payload imports.
import { safeHref, safeImg } from "@/lib/safe-href";
import { defaultHeroSlides } from "@/components/home/home-defaults";

type D = Record<string, unknown>;
type Img = { url?: string } | null | undefined;
const img = (v: unknown): string => safeImg((v as Img)?.url);
const s = (v: unknown): string => (typeof v === "string" ? v : "");
const arr = (v: unknown): D[] => (Array.isArray(v) ? (v as D[]) : []);

export function mapSectionProps(blockType: string, data: D): Record<string, unknown> {
  switch (blockType) {
    case "hero-slider": {
      const slides = arr(data.slides)
        .map((sl, i) => ({
          image: img(sl.image) || defaultHeroSlides[i % defaultHeroSlides.length].image,
          tagline: s(sl.tagline),
          headline: s(sl.headline),
          desc: s(sl.desc),
          cta1: { label: s(sl.cta1Label), href: safeHref(s(sl.cta1Href)) || "/" },
          cta2: { label: s(sl.cta2Label), href: safeHref(s(sl.cta2Href)) || "/" },
        }))
        .filter((sl) => sl.headline);
      return slides.length ? { slides } : {};
    }
    case "quick-links": {
      const links = arr(data.links)
        .map((l) => ({ icon: s(l.icon), label: s(l.label), href: safeHref(s(l.href)) }))
        .filter((l) => l.label && l.href);
      return { ...(s(data.heading) ? { heading: s(data.heading) } : {}), ...(links.length ? { links } : {}) };
    }
    case "app-promo": {
      const features = arr(data.features)
        .map((f) => ({ icon: s(f.icon), title: s(f.title), desc: s(f.desc) }))
        .filter((f) => f.title);
      const out: D = {};
      for (const k of ["badge", "heading", "copy", "ussdCode"]) if (s(data[k])) out[k] = s(data[k]);
      if (safeHref(s(data.appStoreUrl))) out.appStoreUrl = safeHref(s(data.appStoreUrl));
      if (safeHref(s(data.playStoreUrl))) out.playStoreUrl = safeHref(s(data.playStoreUrl));
      if (img(data.mockup)) out.mockupImage = img(data.mockup);
      if (features.length) out.features = features;
      return out;
    }
    case "services-grid": {
      const tabs = arr(data.tabs)
        .map((t, ti) => ({
          id: s(t.id) || `tab-${ti}`,
          label: s(t.label),
          items: arr(t.items)
            .map((it) => ({ icon: s(it.icon), title: s(it.title), desc: s(it.desc), href: safeHref(s(it.href)) || "#" }))
            .filter((it) => it.title),
        }))
        .filter((t) => t.label && t.items.length);
      return tabs.length ? { tabs } : {};
    }
    case "page-header": {
      const out: D = {};
      for (const k of ["badge", "title", "subtitle", "breadcrumb"]) if (s(data[k])) out[k] = s(data[k]);
      return out;
    }
    case "bank-prayer": {
      const paragraphs = arr(data.paragraphs).map((p) => ({ text: s(p.text) })).filter((p) => p.text);
      return {
        ...(s(data.heading) ? { heading: s(data.heading) } : {}),
        ...(paragraphs.length ? { paragraphs } : {}),
        ...(s(data.amen) ? { amen: s(data.amen) } : {}),
      };
    }
    case "story": {
      const paragraphs = arr(data.paragraphs).map((p) => ({ text: s(p.text) })).filter((p) => p.text);
      return { ...(s(data.heading) ? { heading: s(data.heading) } : {}), ...(paragraphs.length ? { paragraphs } : {}) };
    }
    case "branch-network": {
      const branches = arr(data.branches).map((b) => ({ name: s(b.name) })).filter((b) => b.name);
      const out: D = {};
      for (const k of ["heading", "intro", "comingSoonText"]) if (s(data[k])) out[k] = s(data[k]);
      if (branches.length) out.branches = branches;
      return out;
    }
    case "journey-timeline": {
      const milestones = arr(data.milestones)
        .map((m) => ({ year: s(m.year), title: s(m.title), desc: s(m.desc), color: s(m.color) || undefined }))
        .filter((m) => m.year && m.title);
      const out: D = {};
      for (const k of ["heading", "intro"]) if (s(data[k])) out[k] = s(data[k]);
      if (milestones.length) out.milestones = milestones;
      return out;
    }
    case "mission-vision": {
      const out: D = {};
      for (const k of ["heading", "missionTitle", "missionText", "visionTitle", "visionText", "purposeLabel", "purposeText"])
        if (s(data[k])) out[k] = s(data[k]);
      return out;
    }
    case "core-values": {
      const values = arr(data.values)
        .map((v) => ({ icon: s(v.icon), title: s(v.title), description: s(v.description) }))
        .filter((v) => v.title);
      return { ...(s(data.heading) ? { heading: s(data.heading) } : {}), ...(values.length ? { values } : {}) };
    }
    case "contact-details": {
      const out: D = {};
      for (const k of ["heading", "intro", "phone", "email", "address", "hours"]) if (s(data[k])) out[k] = s(data[k]);
      return out;
    }
    case "contact-form": {
      const out: D = {};
      for (const k of ["heading", "intro", "successMessage"]) if (s(data[k])) out[k] = s(data[k]);
      return out;
    }
    case "contact-map": {
      const out: D = {};
      for (const k of ["heading", "embedUrl"]) if (s(data[k])) out[k] = s(data[k]);
      return out; // ContactMap re-validates the embed origin itself
    }
    default:
      return {};
  }
}
```

Design note: empty/absent data keys are OMITTED from props so component defaults kick in — a freshly added, unconfigured block previews as the current live section instead of an empty shell.

- [ ] **Step 2: Create `SectionBlockClient.tsx`**

```tsx
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
```

- [ ] **Step 3: Delegate from `BlockRenderer.tsx`**

In `BlockRenderer` (the exported component at the bottom of the file):

```tsx
import { SectionBlockClient } from "@/components/blocks/SectionBlockClient";
import { SECTION_BLOCK_SLUGS } from "@/payload/blocks/sections";
// inside the map:
        if (SECTION_BLOCK_SLUGS.includes(b.blockType)) {
          return <SectionBlockClient key={i} block={b} />;
        }
        const Renderer = renderers[b.blockType] || FallbackRender;
        return <Renderer key={i} block={b} />;
```

- [ ] **Step 4: Create `PageBlocks.tsx` (server)**

```tsx
// Server renderer for live pages composed in the Pages collection. Section
// blocks render the real components; data-backed placements get their server
// fetches; anything generic falls through to the client BlockRenderer.
import ForexTickerSection from "@/components/home/ForexTickerSection";
import ProductsCarousel from "@/components/home/ProductsCarousel";
import { BlockRenderer } from "@/components/preview/BlockRenderer";
import { SectionBlockClient } from "./SectionBlockClient";
import { SECTION_BLOCK_SLUGS } from "@/payload/blocks/sections";

export type PageBlock = { blockType: string; data?: Record<string, unknown>; [k: string]: unknown };

export default function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
  if (!Array.isArray(blocks)) return null;
  return (
    <>
      {blocks.map((b, i) => {
        if (b.blockType === "forex-ticker") return <ForexTickerSection key={i} />;
        if (b.blockType === "product-carousel") return <ProductsCarousel key={i} />;
        if (SECTION_BLOCK_SLUGS.includes(b.blockType)) return <SectionBlockClient key={i} block={b} />;
        return <BlockRenderer key={i} blocks={[b]} />;
      })}
    </>
  );
}
```

Check `ProductsCarousel`'s signature first (`src/components/home/ProductsCarousel.tsx`) — if it takes props, keep the bare call (its own defaults/fetch apply); if it is async/server it composes fine here.

- [ ] **Step 5: Verify + commit**

`npx tsc --noEmit` clean; `npm run build` green (RSC/client boundaries validated).

```bash
git add src/components/blocks src/components/preview/BlockRenderer.tsx
git commit -m "feat(blocks): section renderers — client preview parity + server PageBlocks"
```

---

### Task 10: Public routes read the Pages collection

**Files:**
- Create: `src/lib/get-page.ts`
- Modify: `src/app/(main)/page.tsx`
- Modify: `src/app/(main)/about-us/page.tsx`
- Modify: `src/app/(main)/contact-us/page.tsx`
- Create: `src/app/(main)/[slug]/page.tsx` (catch-all for new marketing pages)

**Interfaces:**
- Consumes: `PageBlocks` (Task 9); components/defaults (Tasks 2-4).
- Produces: `getPublishedPage(slug: string): Promise<{ layout: PageBlock[]; seo?: { metaTitle?: string; metaDescription?: string } } | null>` from `@/lib/get-page` — returns null on missing doc, empty layout, or ANY error (fallback safety); `RESERVED_SLUGS: Set<string>` exported from the catch-all module scope.

- [ ] **Step 1: Create `src/lib/get-page.ts`**

```ts
// Fetch a published block-composed page by slug. Returns null when the doc
// is missing, unpublished, has no blocks, or the DB hiccups — callers fall
// back to their hardcoded composition, so the homepage can never 500 on a
// CMS problem.
import { getPayload } from "payload";
import config from "../../payload.config";

export type PageDoc = {
  layout: Array<{ blockType: string; [k: string]: unknown }>;
  seo?: { metaTitle?: string; metaDescription?: string };
  title?: string;
};

export async function getPublishedPage(slug: string): Promise<PageDoc | null> {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1, // populate upload relations in legacy generic blocks
    });
    const doc = res.docs[0] as (PageDoc & { _status?: string }) | undefined;
    if (!doc || doc._status === "draft") return null;
    if (!Array.isArray(doc.layout) || doc.layout.length === 0) return null;
    return doc;
  } catch (err) {
    console.error(`[pages] fetch '${slug}' failed — using hardcoded fallback`, err);
    return null;
  }
}
```

- [ ] **Step 2: Home route reads `home`**

`src/app/(main)/page.tsx` becomes:

```tsx
import Hero from "@/components/home/Hero";
import QuickLinks from "@/components/home/QuickLinks";
import MobileBanking from "@/components/home/MobileBanking";
import ForexTickerSection from "@/components/home/ForexTickerSection";
import ServicesGrid from "@/components/home/ServicesGrid";
import ProductsCarousel from "@/components/home/ProductsCarousel";
import PageBlocks from "@/components/blocks/PageBlocks";
import { getPublishedPage } from "@/lib/get-page";

export const dynamic = "force-dynamic";

export default async function Home() {
  const page = await getPublishedPage("home");
  if (page) return <PageBlocks blocks={page.layout} />;
  // Fallback: the pre-CMS hardcoded composition.
  return (
    <>
      <Hero />
      <QuickLinks />
      <ForexTickerSection />
      <ProductsCarousel />
      <MobileBanking />
      <ServicesGrid />
    </>
  );
}
```

- [ ] **Step 3: About route reads `about-us`**

`src/app/(main)/about-us/page.tsx`: the `page-header` block renders full-width; everything else renders inside the sidebar shell with the existing dividers between blocks:

```tsx
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
```

- [ ] **Step 4: Contact route reads `contact-us`**

In `src/app/(main)/contact-us/page.tsx` replace the body:

```tsx
export default async function ContactUsPage() {
  const page = await getPublishedPage("contact-us");
  if (page) return <PageBlocks blocks={page.layout} />;
  return (
    <>
      <AboutPageHeader {...defaultContactHeader} />
      <ContactDetails />
      <ContactForm />
      <ContactMap />
    </>
  );
}
```

(add the two imports: `PageBlocks`, `getPublishedPage`).

- [ ] **Step 5: Catch-all route `src/app/(main)/[slug]/page.tsx`**

```tsx
// Marketing can publish brand-new pages from Studio → Pages with no deploy:
// a published doc with slug `savings-week` serves at /savings-week. Every
// existing route segment is reserved so this can never shadow real routes.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBlocks from "@/components/blocks/PageBlocks";
import { getPublishedPage } from "@/lib/get-page";

export const dynamic = "force-dynamic";

const RESERVED_SLUGS = new Set([
  "home", "about-us", "contact-us", "bank-charges", "blog", "branches",
  "careers", "digital-banking", "faqs", "home-2", "loan-products", "news",
  "open-account", "personal-banking", "press", "preview", "tenders",
  "treasury", "whistleblower", "cards", "studio", "studio-preview", "api",
  "admin", "sitemap.xml", "robots.txt",
]);

type Args = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) return {};
  const page = await getPublishedPage(slug);
  if (!page) return {};
  return {
    title: page.seo?.metaTitle || `${page.title || slug} | Cooperative Bank Tanzania`,
    description: page.seo?.metaDescription || undefined,
  };
}

export default async function CmsPage({ params }: Args) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) notFound();
  const page = await getPublishedPage(slug);
  if (!page) notFound();
  return <PageBlocks blocks={page.layout} />;
}
```

Before committing, list `src/app/(main)` again and add EVERY top-level segment present to `RESERVED_SLUGS` (the list above was taken at planning time — refresh it).

- [ ] **Step 6: Verify + commit**

`npm run build` green. `npm run dev`: `/`, `/about-us`, `/contact-us` all render the fallback compositions (no Pages docs with the new blocks exist yet); `/no-such-page` 404s.

```bash
git add src/lib/get-page.ts src/app/\(main\)
git commit -m "feat(pages): public routes render block-composed Pages docs with hardcoded fallback + CMS catch-all"
```

---

### Task 11: Seed script

**Files:**
- Create: `scripts/seed-pages.ts`
- Modify: `package.json` (add `"seed:pages": "node --require ./scripts/_bootstrap-payload.cjs --import tsx ./scripts/seed-pages.ts"`)

**Interfaces:**
- Consumes: every `*-defaults.ts` module (Tasks 2-4) — the seed IS the defaults, so CMS output is pixel-identical to the fallback.
- Produces: published Pages docs `home`, `about-us`, `contact-us` composed of section blocks.

- [ ] **Step 1: Create `scripts/seed-pages.ts`**

```ts
/**
 * Seed the block-composed key pages (home, about-us, contact-us) from the
 * components' default content — the CMS render is identical to the hardcoded
 * fallback, so flipping to CMS is visually invisible.
 *
 * Run: npm run seed:pages
 *
 * DELETES and recreates these three slugs. That is intentional for the
 * phase-1 cutover: the only pre-existing `home` doc is the placeholder from
 * seed-homepage.ts (old generic blocks), which must be replaced or `/` would
 * render wireframes. After cutover, editors own the docs — do NOT rerun this
 * script casually.
 */
import { getPayload } from "payload";
import config from "../payload.config";
import {
  defaultHeroSlides, defaultQuickLinks, defaultQuickLinksHeading,
  defaultAppPromo, defaultServiceTabs,
} from "../src/components/home/home-defaults";
import {
  defaultAboutHeader, defaultPrayer, defaultStory, defaultBranchNetwork,
  defaultJourney, defaultMissionVision, defaultCoreValues,
} from "../src/components/about/about-defaults";
import {
  defaultContactHeader, defaultContactDetails, defaultContactForm, defaultContactMap,
} from "../src/components/contact/contact-defaults";

const b = (blockType: string, data: Record<string, unknown> = {}) => ({ blockType, data });

const PAGES: Array<{ slug: string; title: string; layout: unknown[] }> = [
  {
    slug: "home",
    title: "Home",
    layout: [
      b("hero-slider", {
        slides: defaultHeroSlides.map((s) => ({
          image: { url: s.image },
          tagline: s.tagline,
          headline: s.headline,
          desc: s.desc,
          cta1Label: s.cta1.label, cta1Href: s.cta1.href,
          cta2Label: s.cta2.label, cta2Href: s.cta2.href,
        })),
      }),
      b("quick-links", { heading: defaultQuickLinksHeading, links: defaultQuickLinks }),
      b("forex-ticker"),
      b("product-carousel", {}), // placement — cards come from showcase-cards
      b("app-promo", {
        badge: defaultAppPromo.badge,
        heading: defaultAppPromo.heading,
        copy: defaultAppPromo.copy,
        features: defaultAppPromo.features,
        appStoreUrl: defaultAppPromo.appStoreUrl,
        playStoreUrl: defaultAppPromo.playStoreUrl,
        ussdCode: defaultAppPromo.ussdCode,
        mockup: { url: defaultAppPromo.mockupImage },
      }),
      b("services-grid", { tabs: defaultServiceTabs }),
    ],
  },
  {
    slug: "about-us",
    title: "About Us",
    layout: [
      b("page-header", defaultAboutHeader),
      b("bank-prayer", defaultPrayer),
      b("story", defaultStory),
      b("branch-network", defaultBranchNetwork),
      b("journey-timeline", defaultJourney),
      b("mission-vision", defaultMissionVision),
      b("core-values", defaultCoreValues),
    ],
  },
  {
    slug: "contact-us",
    title: "Contact Us",
    layout: [
      b("page-header", defaultContactHeader),
      b("contact-details", defaultContactDetails),
      b("contact-form", defaultContactForm),
      b("contact-map", defaultContactMap),
    ],
  },
];

async function main() {
  const payload = await getPayload({ config });
  for (const page of PAGES) {
    const existing = await payload.find({
      collection: "pages",
      where: { slug: { equals: page.slug } },
      limit: 1,
      draft: true,
    });
    if (existing.docs[0]) {
      await payload.delete({ collection: "pages", id: existing.docs[0].id });
      console.log(`[seed-pages] replaced existing '${page.slug}' (id ${existing.docs[0].id})`);
    }
    await payload.create({
      collection: "pages",
      data: {
        title: page.title,
        slug: page.slug,
        layout: page.layout,
        _status: "published",
      } as never,
    });
    console.log(`[seed-pages] published '${page.slug}' with ${page.layout.length} blocks`);
  }
  console.log("[seed-pages] done");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Note the `product-carousel` entry uses the EXISTING generic block (typed fields, empty = placement only): confirm the existing `ProductCarouselBlock` allows an empty `cards` array (`fields` have no `required` on cards per the current editor). If a `heading` is required, pass `heading: "Our Products"` — check `src/payload/blocks/ProductCarousel.ts` and match. In `PageBlocks` (Task 9) `product-carousel` renders `<ProductsCarousel />` (the real showcase-driven component), so its block fields are cosmetic here.

- [ ] **Step 2: Add the npm script + verify types**

Add to `package.json` scripts:

```json
    "seed:pages": "node --require ./scripts/_bootstrap-payload.cjs --import tsx ./scripts/seed-pages.ts"
```

`npx tsc --noEmit` clean (script compiles; do NOT run it yet — tables don't exist until Task 12).

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-pages.ts package.json
git commit -m "feat(seed): seed-pages script — home/about-us/contact-us from component defaults"
```

---

### Task 12: Apply SQL, seed, end-to-end verification

**Files:** none new — this is the cutover + QA task.

> The Neon database is PRODUCTION (`push:false`, no staging — see memory `feedback-production-live-system`). Get explicit user sign-off before applying SQL. All statements are additive (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`) so existing data is untouched.

- [ ] **Step 1: Introspect + finalize the two SQL files** (Task 5 + Task 7 files): run the introspection queries from Task 7 Step 4 against Neon (read-only), diff against the templates, correct column types/index shapes to match `pages_blocks_hero` / `_pages_v_blocks_hero` exactly (esp. `id` type, `_uuid`, FK names).

- [ ] **Step 2: Apply** `2026-07-14-contact-messages.sql` then `2026-07-14-section-block-tables.sql` inside transactions. Verify:

```sql
SELECT count(*) FROM information_schema.tables WHERE table_name LIKE 'pages_blocks_%';
SELECT count(*) FROM information_schema.tables WHERE table_name LIKE '\_pages\_v_blocks_%' ESCAPE '\';
SELECT column_name FROM information_schema.columns WHERE table_name = 'contact_messages';
```

- [ ] **Step 3: Seed**

Run: `npm run seed:pages` (with prod `DATABASE_URI` in env, same as existing seed scripts)
Expected output: three `[seed-pages] published '...'` lines.

- [ ] **Step 4: Full verification pass** (`npm run dev` against the same DB):

1. `/` renders from CMS — hero slider animates, quick links, ticker (live rates), products carousel, CoopPesa promo, services tabs. Compare side-by-side with production: identical.
2. `/about-us` — prayer line breaks, story, branch tiles, timeline alternation, mission/vision, values. Identical.
3. `/contact-us` — header, detail cards, form; map hidden (no embed URL yet).
4. Form: submit → success state; row appears in `/studio/messages`; status flips new→read on open, →handled on click; notification email attempt logged (check console; if SMTP2GO unconfigured locally it logs a mail error and the submission still succeeds).
5. Honeypot: `curl -s -X POST localhost:3000/api/contact -H 'Content-Type: application/json' -d '{"name":"x","email":"x@x.com","subject":"s","message":"m","website":"spam"}'` → `{"success":true}` and NO new row in studio.
6. Rate limit: 6 rapid submits → 6th returns 429.
7. Studio: `/studio/pages` → edit Home → change hero headline → autosave OK (tables exist now) → Preview shows the change with real components → Publish → `/` reflects it.
8. XSS: set a quick-link href to `javascript:alert(1)` in Studio, save, publish → link renders with fallback href (guarded), never `javascript:`.
9. Catch-all: create + publish a page `test-cms-page` with a page-header block → `/test-cms-page` renders → delete the doc → 404. `/branches` still serves the real branches page.
10. `npm run build` green.

- [ ] **Step 5: Delete the seeded `test-cms-page` doc (if left), commit any fixups, and hand off**

```bash
git status # confirm clean or commit fixups as fix(pages): ...
```

Deployment (user-driven, per repo convention): `gcloud run deploy` of `coopbank-concept-web` from this branch after review, plus the SMTP2GO `cbtbank.co.tz` domain check from Task 5.

---

## Self-review notes (already applied)

- Spec §"BlockRenderer delegates to the real components": satisfied via `SectionBlockClient` used by BOTH preview (`BlockRenderer`) and live (`PageBlocks`) — single source of truth for mapping (`map-section-props.ts`).
- Spec's typed-field blocks were replaced by json-`data` blocks after discovering `push: false` + hand-SQL policy (payload.config.ts:110-116); typed blocks would need ~60 hand-written tables (fields + arrays + versions). Recorded here as a deliberate deviation; the spec's editor UX and hardening requirements are unchanged.
- Spec §seeding "skips any slug that already exists" was changed to delete-and-recreate for these three slugs: a stale generic-block `home` doc (from `seed-homepage.ts`) would otherwise wireframe the live homepage the moment `/` starts reading CMS. Recorded as deviation with rationale in the script header.
- `forex-ticker` (15th block) added beyond the spec's 14 — the spec's §4 "thin forex-ticker block wrapper" made it explicit; the table count in §2 simply didn't list it.
- Type consistency checked: `HeroSlide`/`QuickLinkItem`/`AppPromoContent`/`ServiceTab` defined once in `home-defaults.ts` and consumed by components + mapper + seed; `MessageRow` defined in `MessageList.tsx` and imported by the page; `SECTION_BLOCK_SLUGS` single source in `sections.ts`.
