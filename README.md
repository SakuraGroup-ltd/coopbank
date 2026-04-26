## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

# Cooperative Bank Tanzania — Frontend Developer Manual

> **Project:** Cooperative Bank Tanzania Plc. Website  
> **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion  
> **Last Updated:** April 2026

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Folder Structure](#2-folder-structure)
3. [Design System](#3-design-system)
4. [Routing & Page Layout](#4-routing--page-layout)
5. [How Every Page Is Built](#5-how-every-page-is-built)
6. [Editing Each Page](#6-editing-each-page)
   - [Home Page](#61-home-page)
   - [Personal Banking](#62-personal-banking)
   - [Digital Banking](#63-digital-banking)
   - [Loan Products](#64-loan-products)
   - [About Us](#65-about-us)
   - [Branches](#66-branches)
   - [Careers](#67-careers)
   - [Tenders](#68-tenders)
   - [Whistleblower](#69-whistleblower)
   - [News](#610-news)
   - [Open Account Form](#611-open-account-form)
7. [Shared Components](#7-shared-components)
   - [Navbar](#71-navbar)
   - [Footer](#72-footer)
   - [Chat Widget (Mshirika)](#73-chat-widget-mshirika)
8. [Adding Images](#8-adding-images)
9. [API Routes](#9-api-routes)
10. [Common Tasks (Cheat Sheet)](#10-common-tasks-cheat-sheet)

---

## 1. Project Setup

### Prerequisites
- Node.js 20+
- npm 10+

### Install & run
```bash
cd "Cooperative Bank"
npm install
npm run dev        # http://localhost:3000
```

### Other scripts
| Command | What it does |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

### Environment variables
The app uses two environment variables (create a `.env.local` file in the root):

```
GEMINI_API_KEY=your_google_gemini_api_key   # powers the Mshirika chat widget
EMAIL_TO=recipient@coopbank.co.tz           # where account-opening & wakala forms are emailed
EMAIL_FROM=noreply@coopbanktanzania.co.tz
```

---

## 2. Folder Structure

```
src/
├── app/
│   ├── (main)/                   ← All public-facing pages
│   │   ├── layout.tsx            ← Wraps every page: Navbar + Footer + ChatWidget
│   │   ├── page.tsx              ← Home page
│   │   ├── personal-banking/
│   │   │   └── page.tsx
│   │   ├── digital-banking/
│   │   │   ├── page.tsx          ← Digital Banking overview
│   │   │   ├── coopnet/page.tsx
│   │   │   ├── ussd/page.tsx
│   │   │   ├── qr-pay/page.tsx
│   │   │   └── coopwakala/
│   │   │       ├── page.tsx
│   │   │       └── agents/page.tsx
│   │   ├── loan-products/
│   │   │   ├── page.tsx
│   │   │   └── calculator/page.tsx
│   │   ├── about-us/
│   │   │   ├── layout.tsx        ← About Us sidebar shell
│   │   │   ├── page.tsx
│   │   │   ├── board/page.tsx
│   │   │   └── management/page.tsx
│   │   ├── branches/page.tsx
│   │   ├── careers/page.tsx
│   │   ├── tenders/page.tsx
│   │   ├── whistleblower/page.tsx
│   │   ├── news/page.tsx
│   │   └── open-account/page.tsx
│   ├── api/
│   │   ├── chat/route.ts         ← Mshirika AI chat endpoint
│   │   ├── open-account/route.ts ← Account form → email
│   │   └── wakala-application/route.ts
│   ├── globals.css               ← Design tokens, custom utilities
│   └── layout.tsx                ← Root HTML shell
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── home/                     ← One file per homepage section
│   │   ├── Hero.tsx
│   │   ├── QuickLinks.tsx
│   │   ├── ForexTicker.tsx
│   │   ├── ProductsCarousel.tsx
│   │   ├── MobileBanking.tsx
│   │   ├── ServicesGrid.tsx
│   │   ├── StatsBar.tsx
│   │   ├── Testimonials.tsx
│   │   └── WhyChoose.tsx
│   ├── coopwakala/
│   │   └── AgentsMap.tsx         ← Leaflet map of agents
│   └── shared/
│       └── OpenAccountBanner.tsx
│
public/
├── images/                       ← All page images (see §8)
│   ├── products/
│   ├── board/
│   ├── management/
│   └── news/
└── fonts/                        ← Gilroy woff files
```

---

## 3. Design System

All design tokens live in `src/app/globals.css` under `@theme inline`.

### Brand colours

| Token | Hex | Usage |
|---|---|---|
| `--color-navy` | `#1A56A0` | Primary blue — headings, buttons, icons |
| `--color-navy-dark` | `#0F3D7A` | Hover states, dark sections |
| `--color-navy-light` | `#2468B8` | Lighter blue accents |
| `--color-green` | `#1A8A3A` | Secondary green — badges, success |
| `--color-green-accent` | `#00C853` | Buy rates, positive trends |
| `--color-teal` | `#1F7A8C` | Gradient midpoints |
| `--color-gray-bg` | `#F2F4F8` | Section backgrounds |
| `--color-gray-body` | `#4A5568` | Body text |
| `--color-dark-text` | `#1A1A2E` | Headings |

Use these in Tailwind via the `text-[#1A56A0]` syntax or the CSS variable `var(--color-navy)`.

### Typography

- **Primary font:** Gilroy (loaded from `/public/fonts/`)
- **Fallbacks:** Inter, Arial, sans-serif
- The font stack is set globally on `body` — no per-component setup needed.

### Reusable CSS classes (globals.css)

| Class | What it does |
|---|---|
| `.glass` | White glassmorphism panel (for hero overlays) |
| `.glass-dark` | Blue glassmorphism panel |
| `.hero-overlay` | Blue-to-green gradient overlay for hero images |
| `.no-scrollbar` | Hides scrollbar (used on carousels) |

### Icons

The project uses **Lucide React** exclusively. Browse icons at [lucide.dev](https://lucide.dev).

```tsx
import { ArrowRight, Phone } from "lucide-react";
<ArrowRight size={20} className="text-[#1A56A0]" />
```

---

## 4. Routing & Page Layout

This project uses the **Next.js App Router**. The URL structure maps directly to the folder structure inside `src/app/`.

### The main layout wrapper

Every public page is wrapped by `src/app/(main)/layout.tsx`:

```tsx
// src/app/(main)/layout.tsx
<Navbar />
<main>{children}</main>
<Footer />
<ChatWidget />
```

This means **Navbar, Footer, and the chat bubble appear on every page automatically**. You only need to edit the page file itself.

### Page file pattern

Every page file follows the same pattern:

```
1. "use client"          ← Required for interactivity (useState, framer-motion)
2. Imports               ← lucide icons, framer-motion, next/image, next/link
3. DATA section          ← Plain TypeScript arrays/objects — this is what you edit
4. Component functions   ← UI rendering — rarely needs changes
5. Default export        ← The page component itself
```

**Rule of thumb:** To change content on any page, edit the data arrays at the top of the file. You almost never need to touch the JSX below.

---

## 5. How Every Page Is Built

### Animations

Every page uses **Framer Motion** for scroll-triggered fade-ins. The pattern is:

```tsx
const ref = useRef(null);
const inView = useInView(ref, { once: true, margin: "-60px" });

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 30 }}
  animate={inView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.6 }}
>
  ...
</motion.div>
```

You don't need to add animations for new content — just add your data to the existing arrays and the animation wrapper handles the rest.

### Accordion pattern

Several pages (Personal Banking, Digital Banking, Loan Products) use an expand/collapse accordion driven by:

```tsx
const [openAccordion, setOpenAccordion] = useState<string | null>(null);
```

Clicking a section sets its key as the open accordion. Everything is self-contained in the page file.

---

## 6. Editing Each Page

### 6.1 Home Page

**File:** `src/app/(main)/page.tsx`

The home page composes section components in order:

```tsx
<Hero />          → src/components/home/Hero.tsx
<QuickLinks />    → src/components/home/QuickLinks.tsx
<ForexTicker />   → src/components/home/ForexTicker.tsx
<ProductsCarousel /> → src/components/home/ProductsCarousel.tsx
<MobileBanking /> → src/components/home/MobileBanking.tsx
<ServicesGrid />  → src/components/home/ServicesGrid.tsx
```

To edit any home section, open the corresponding component file.

---

#### Hero Slider — `src/components/home/Hero.tsx`

Edit the `slides` array (lines 16–41):

```ts
const slides: Slide[] = [
  {
    image: "/images/hero-president.jpg",  // path under /public
    tagline: "Benki ya Ushirikiano",       // small text above headline
    headline: "Trusted by the Nation...", // large headline
    desc: "From farmers to...",           // paragraph text
    cta1: { label: "About Us", href: "/about-us" },
    cta2: { label: "Our Impact", href: "/about-us#impact" },
  },
  // add more slides here
];
```

The slider auto-advances every 6 seconds. Add as many slides as needed.

---

#### Forex Ticker — `src/components/home/ForexTicker.tsx`

Edit the `rates` array (lines 8–12):

```ts
const rates = [
  { currency: "USD/TZS", flag: "🇺🇸", buy: 2635.00, sell: 2655.00, trend: "up" },
  { currency: "GBP/TZS", flag: "🇬🇧", buy: 3345.00, sell: 3378.00, trend: "down" },
  { currency: "EUR/TZS", flag: "🇪🇺", buy: 2872.50, sell: 2898.00, trend: "up" },
];
```

`trend` accepts `"up"` or `"down"` — controls the green/red arrow icon.

> **Note:** These rates are currently hardcoded. To make them live, replace this array with a fetch call to the bank's forex API.

---

#### Products Carousel — `src/components/home/ProductsCarousel.tsx`

Edit the `tabs` array. Each tab has a `label` and a `products` array:

```ts
const tabs: Tab[] = [
  {
    label: "Accounts & Deposits",
    products: [
      { name: "Mama Africa Account", desc: "...", icon: <Heart size={20} /> },
      // add products here
    ],
  },
  // add tabs here
];
```

Icons come from Lucide React — import any icon at the top of the file.

---

### 6.2 Personal Banking

**File:** `src/app/(main)/personal-banking/page.tsx`

All account products are in the `accounts` array. Each entry has this shape:

```ts
{
  id: 1,
  slug: "jasiri",            // used for the URL anchor (#jasiri)
  category: "SAVINGS",       // "SAVINGS" | "FIXED" | "GROUP" | "CURRENT"
  name: "Jasiri Account",
  shortDesc: "Youth empowerment account",
  longDesc: "Full description shown in expanded panel...",
  image: "/images/products/jasiri.jpg",
  features: [
    "Zero minimum opening balance",
    "Free CoopEsa mobile banking",
    // ...
  ],
  requirements: [
    "National ID or Passport",
    // ...
  ],
  channels: ["Branch", "CoopEsa App", "CoopWakala"],
}
```

To **add a new account**: copy an existing object, change the `id` (must be unique), `slug`, and content fields.

To **change the category badge colour**, edit `categoryColors` near the top:

```ts
const categoryColors: Record<CategoryType, string> = {
  SAVINGS: "bg-[#1A8A3A]/15 text-[#1A8A3A] ...",
  FIXED:   "bg-blue-500/15 text-blue-700 ...",
  // ...
};
```

---

### 6.3 Digital Banking

**File:** `src/app/(main)/digital-banking/page.tsx`

The main page lists digital channels in the `channels` array. Each channel has:

```ts
{
  id: 2,
  slug: "coopesa",
  name: "CoopEsa Mobile App",
  description: "A simple, secure...",
  image: "/images/products/coopesa-oldman.jpg",
  detailHref: "https://play.google.com/...",  // external link or internal page
  accordions: [
    {
      title: "FEATURES & BENEFITS",
      items: ["Fingerprint & Face ID login", "..."],
    },
    {
      title: "HOW TO GET STARTED",
      items: ["Download from Play Store", "..."],
    },
  ],
}
```

Sub-pages for each channel live at:
- `src/app/(main)/digital-banking/coopnet/page.tsx`
- `src/app/(main)/digital-banking/ussd/page.tsx`
- `src/app/(main)/digital-banking/qr-pay/page.tsx`
- `src/app/(main)/digital-banking/coopwakala/page.tsx`

Each sub-page follows the same data-array pattern — find the data section near the top of each file and edit directly.

---

### 6.4 Loan Products

**File:** `src/app/(main)/loan-products/page.tsx`

Loans are in the `loanProducts` array:

```ts
{
  id: 1,
  slug: "agri-business",
  name: "Agri-Business Loan",
  tag: "Agriculture",
  category: "agri",            // "personal" | "sme" | "agri"
  icon: Tractor,               // Lucide icon component
  longDesc: "...",
  image: "/images/products/agri-loan.jpg",
  features: ["Loans from TSH 100,000 to 50,000,000", "..."],
  requirements: ["National ID", "..."],
  loanDetails: ["Minimum: TSH 100,000", "Tenor: 12–36 months", "..."],
}
```

The filter tabs at the top of the page filter by `category`. If you add a new category, also add it to the `categories` array:

```ts
const categories = [
  { id: "all",      label: "All Loans" },
  { id: "personal", label: "Personal" },
  { id: "sme",      label: "SME & Business" },
  { id: "agri",     label: "Agriculture" },
] as const;
```

**Loan Calculator** is at `src/app/(main)/loan-products/calculator/page.tsx` — a standalone interactive calculator, self-contained with no external data.

---

### 6.5 About Us

**Files:**
- `src/app/(main)/about-us/page.tsx` — Main overview
- `src/app/(main)/about-us/board/page.tsx` — Board of Directors
- `src/app/(main)/about-us/management/page.tsx` — Management team
- `src/app/(main)/about-us/layout.tsx` — Sidebar navigation shell

#### Board of Directors — `about-us/board/page.tsx`

Edit the `boardDirectors` array:

```ts
const boardDirectors = [
  {
    name: "Dr. John Doe",
    title: "Chairman",
    image: "/images/board/john-doe.jpg",
    bio: "Short biography...",
  },
  // ...
];
```

Board member photos go in `/public/images/board/`.

#### Management Team — `about-us/management/page.tsx`

Same pattern — edit the `managementTeam` array. Photos go in `/public/images/management/`.

#### About Us sidebar

The sidebar links are defined in `src/app/(main)/about-us/layout.tsx`. Edit the `navLinks` array there to add or rename sidebar items.

---

### 6.6 Branches

**File:** `src/app/(main)/branches/page.tsx`

Branch data is in the `branches` array:

```ts
{
  id: 1,
  name: "Dar es Salaam (HQ)",
  region: "Dar es Salaam",
  address: "Cooperative House, Lumumba Street, Dar es Salaam",
  phone: "+255 27 275 4470",
  email: "info@coopbank.co.tz",
  coords: { lat: -6.8161, lng: 39.2804 },
  hours: {
    weekday: "Mon–Fri: 8:30 AM – 4:00 PM",
    saturday: "Sat: 8:30 AM – 1:30 PM",
  },
}
```

The `coords` field powers the Leaflet map on the branch detail panel. The map component lives in `src/components/coopwakala/AgentsMap.tsx`.

Branch open/closed status is calculated automatically from the system clock using the `getBranchStatus()` helper in the same file.

---

### 6.7 Careers

**File:** `src/app/(main)/careers/page.tsx`

#### Hero stats

```ts
const heroStats = [
  { value: "500+", label: "Employees" },
  { value: "30+",  label: "Roles Available" },
  // ...
];
```

#### Job listings

Find the `jobListings` array. Each job has:

```ts
{
  id: 1,
  title: "Senior Software Engineer",
  department: "Technology",
  location: "Dar es Salaam",
  type: "Full-time",
  posted: "2026-04-01",
  closing: "2026-05-15",
  description: "...",
  requirements: ["Bachelor's degree in CS", "..."],
  icon: Code,    // Lucide icon
}
```

To close a position, change its `closing` date to a past date — the page automatically marks it as closed.

---

### 6.8 Tenders

**File:** `src/app/(main)/tenders/page.tsx`

Edit the `tenders` array:

```ts
{
  id: 1,
  title: "Supply of Computer Equipment",
  category: "IT Equipment",      // see TenderCategory type
  reference: "CBT/ICT/2026/001",
  tenderType: "Open Tender",
  publishedDate: "2026-04-01",
  closingDate: "2026-05-01",
  status: "Open",                // "Open" | "Closed"
  description: "...",
  documents: [
    { name: "Tender Document", url: "/tenders/CBT-ICT-2026-001.pdf" },
  ],
}
```

Tender documents should be placed in `/public/tenders/` and referenced by path.

---

### 6.9 Whistleblower

**File:** `src/app/(main)/whistleblower/page.tsx`

The misconduct type cards are in `misconductTypes`. The reporting form is a pure front-end form (no backend submission currently — submissions are handled by email or another channel depending on bank policy).

To add a new misconduct category:

```ts
{
  icon: ShieldCheck,          // Lucide icon
  title: "New Category",
  description: "Description of the misconduct type.",
}
```

---

### 6.10 News

**File:** `src/app/(main)/news/page.tsx`

News articles are in the `articles` array. Each article links out to an external news source:

```ts
{
  id: 1,
  title: "CoopBank Partners with Tanzania Post",
  category: "News",                // "News" | "Press" | "Insights" | "Agriculture"
  date: "2026-04-10",
  source: "The Citizen",           // must match a key in the `sources` object
  excerpt: "Short preview text...",
  url: "https://www.thecitizen.co.tz/...",
  image: "/images/news/article-1.jpg",
}
```

To add a new source, add it to the `sources` object at the top of the file:

```ts
const sources: Record<string, Source> = {
  "New Source Name": {
    name: "New Source Name",
    logo: "/images/news/sources/new-source.jpg",
    url: "https://example.com",
  },
};
```

---

### 6.11 Open Account Form

**File:** `src/app/(main)/open-account/page.tsx`

This is a multi-step form. The account type options are in `ACCOUNT_GROUPS`:

```ts
const ACCOUNT_GROUPS = [
  {
    label: "Individual Savings",
    accounts: [
      { value: "jasiri", label: "Jasiri Account (Youth 18–35)" },
      // add new account types here
    ],
  },
  // add new groups here
];
```

When adding a new account type here, also add its label mapping in `src/app/api/open-account/route.ts` inside `ACCOUNT_LABELS`:

```ts
const ACCOUNT_LABELS: Record<string, string> = {
  "jasiri": "Jasiri Account (Youth 18–35)",
  "your-new-slug": "Your New Account Name",
};
```

Submitted forms are emailed via the `open-account` API route (see §9).

---

## 7. Shared Components

### 7.1 Navbar

**File:** `src/components/layout/Navbar.tsx`

#### Mega menu items

The mega menu data is split into named arrays near the top of the file:

- `personalBankingMenu` — columns for Personal Banking dropdown
- `digitalBankingMenu` — columns for Digital Banking dropdown
- `loanProductsMenu` — columns for Loan Products dropdown

Each column follows this shape:

```ts
{
  title: "Column Heading",
  items: [
    { label: "Menu Item",   href: "/path",      desc: "Short description" },
    { label: "Another Item", href: "/path#anchor" },
  ],
}
```

#### Top-level nav links

The `navItems` array defines the top navigation bar entries. Each item can have an optional `megaMenu` and `cta` (a highlighted call-to-action card inside the dropdown):

```ts
const navItems: NavItem[] = [
  {
    label: "Personal Banking",
    href: "/personal-banking",
    megaMenu: personalBankingMenu,
    cta: { label: "Open an Account", href: "/open-account", desc: "Apply online in minutes" },
  },
  // ...
];
```

#### Utility links (top bar)

The top-bar links (Internet Banking, Branch Locator, etc.) are hardcoded in the JSX. Search for `topLinks` or the `Lock` icon import to find them.

---

### 7.2 Footer

**File:** `src/components/layout/Footer.tsx`

Footer links are in six plain arrays at the top of the file:

```ts
const personalBanking = [
  { label: "Jasiri Account", href: "/personal-banking#jasiri" },
  // ...
];

const digitalBanking = [ ... ];
const cardsPayments  = [ ... ];
const loanProducts   = [ ... ];
const helpSupport    = [ ... ];
```

Contact details (phone, email, address) are hardcoded in the JSX below the arrays. Search for `+255 27 275 4470` to find and update them.

---

### 7.3 Chat Widget (Mshirika)

**File:** `src/components/ChatWidget.tsx`  
**API route:** `src/app/api/chat/route.ts`

The chat bubble appears on every page (injected by the main layout). It is powered by **Google Gemini** (`gemini-2.0-flash`).

#### Changing the AI personality or knowledge

Edit the `SYSTEM_PROMPT` string in `src/app/api/chat/route.ts`. This controls:
- The assistant's tone and language behaviour
- Bank facts it knows (branches, account types, contact info)
- What to say when it doesn't know something

#### Changing the avatar image

Replace `/public/images/mshirika-avatar.jpg` with a new image (keep the same filename), or update the `AVATAR` constant in `ChatWidget.tsx`:

```ts
const AVATAR = "/images/mshirika-avatar.jpg";
```

#### Changing the greeting message

In `ChatWidget.tsx`, edit the initial message in `useState`:

```ts
const [messages, setMessages] = useState<Message[]>([
  {
    role: "assistant",
    content: "Habari! Mimi ni Mshirika...",  // ← edit this
  },
]);
```

---

## 8. Adding Images

All images are served from `/public/images/`. The Next.js `<Image>` component is used throughout — always prefer it over a plain `<img>` tag for automatic optimisation.

### Where to put images

| Image type | Folder |
|---|---|
| Hero/banner images | `/public/images/` |
| Product/feature images | `/public/images/products/` |
| Board of Directors photos | `/public/images/board/` |
| Management team photos | `/public/images/management/` |
| News article thumbnails | `/public/images/news/` |
| News source logos | `/public/images/news/sources/` |

### Using an image in a component

```tsx
import Image from "next/image";

<Image
  src="/images/products/your-image.jpg"
  alt="Descriptive alt text"
  width={800}
  height={500}
  className="rounded-xl object-cover"
/>
```

### Supported formats

JPG, PNG, WebP, GIF, AVIF. WebP is recommended for best performance.

### External images

If you need to use an image from an external URL, add its hostname to `next.config.ts`:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "your-cdn.example.com" },  // add here
  ],
},
```

---

## 9. API Routes

All API routes live in `src/app/api/` and are **server-side only**.

### `POST /api/chat`

Powers the Mshirika chat widget. Accepts `{ messages: Message[] }` and streams a response from Google Gemini. Requires `GEMINI_API_KEY` in `.env.local`.

### `POST /api/open-account`

Receives the account-opening form (`multipart/form-data` with optional file attachments) and emails it to the configured `EMAIL_TO` address. Returns `{ success: true }` on success.

### `POST /api/wakala-application`

Same pattern as open-account but for CoopWakala agent applications.

---

## 10. Common Tasks (Cheat Sheet)

### Update a phone number or email sitewide

1. **Footer:** `src/components/layout/Footer.tsx` — search for the number
2. **Navbar top bar:** `src/components/layout/Navbar.tsx` — search for the number
3. **Chat widget system prompt:** `src/app/api/chat/route.ts`
4. **About Us page:** `src/app/(main)/about-us/page.tsx`
5. **Branches page:** `src/app/(main)/branches/page.tsx`

### Add a new page

1. Create a folder under `src/app/(main)/your-page/`
2. Add a `page.tsx` file — it will automatically get Navbar + Footer from the layout
3. Add a link to it in the Navbar (`src/components/layout/Navbar.tsx`) and Footer

### Add a new navigation menu item

1. Open `src/components/layout/Navbar.tsx`
2. Add an entry to the `navItems` array
3. If it needs a mega menu, create a new `columns` array (follow the `personalBankingMenu` pattern)

### Add a page hero section

All hero sections follow this pattern (copy from any existing page):

```tsx
<section className="relative min-h-[480px] flex items-end overflow-hidden bg-[#0F3D7A]">
  <Image src="/images/your-hero.jpg" alt="..." fill className="object-cover opacity-30" />
  <div className="hero-overlay absolute inset-0" />
  <div className="glass relative z-10 mx-6 mb-12 rounded-2xl p-8 max-w-xl">
    <h1 className="text-4xl font-bold text-white">Page Title</h1>
    <p className="text-white/80 mt-2">Subtitle text</p>
  </div>
</section>
```

### Change the forex rates

Open `src/components/home/ForexTicker.tsx` and edit the `rates` array. Update `buy`, `sell`, and `trend` values.

### Add a tender document

1. Place the PDF in `/public/tenders/`
2. Open `src/app/(main)/tenders/page.tsx`
3. Add an entry to the `tenders` array with `status: "Open"` and a `documents` array pointing to the PDF path

### Close/archive a job posting

In `src/app/(main)/careers/page.tsx`, set the job's `closing` date to a past date. The UI automatically shows it as closed.

---

## Brand Reference

| Item | Value |
|---|---|
| Official name | Cooperative Bank Tanzania Plc. |
| Slogan | Ustawi kwa wote |
| Primary phone | +255 27 275 4470 |
| HQ address | Cooperative House, Lumumba Street, Dar es Salaam |
| CoopNet URL | coopnet.coopbank.co.tz |
| CoopEsa Play Store | play.google.com/store/apps/details?id=tz.co.coopbank.coopesa |

---

*For questions about the design direction or content, reach out to jumbenylon@gmail.com or hello@sakuragroup.co.tz
