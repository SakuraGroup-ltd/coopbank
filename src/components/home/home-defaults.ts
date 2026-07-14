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
