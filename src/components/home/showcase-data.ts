// Pure data + resolution for the homepage products carousel. No "use client"
// directive — this module is imported by BOTH the server wrapper
// (ProductsCarousel) and client components (ProductsCarouselView, the studio
// editor). Putting it in a client file would turn resolveShowcaseCards into an
// uncallable client reference on the server.

export type ShowcaseCard = {
  title: string;
  bullets: string[];
  image: string;
  href: string;
};

// Fallback cards used until the showcase-cards collection has content — the
// exact set that used to be hardcoded, with each Explore link pointing at the
// actual product section (they all used to go to the Play Store).
export const FALLBACK_SHOWCASE_CARDS: ShowcaseCard[] = [
  {
    title: "Mama Africa Account",
    bullets: ["Everyday savings for all Tanzanians", "Low opening balance from TSH 10,000", "Free CoopPesa mobile banking"],
    image: "/images/products/mama-africa.jpg",
    href: "/personal-banking#mama-africa",
  },
  {
    title: "Kilimo Tija Account",
    bullets: ["Designed for Tanzanian farmers", "Seasonal deposit flexibility", "Access to agri-business loans"],
    image: "/images/products/kilimo-tija.jpg",
    href: "/personal-banking#kilimo-tija",
  },
  {
    title: "Jasiri Account",
    bullets: ["Youth empowerment (18-35)", "Zero account opening balance", "Business mentorship access"],
    image: "/images/products/jasiri.jpg",
    href: "/personal-banking#jasiri",
  },
  {
    title: "Fixed Deposit Account",
    bullets: ["Up to 10% p.a. interest", "Flexible tenure from 3 months", "Capital protection guaranteed"],
    image: "/images/products/fixed-deposit.jpg",
    href: "/personal-banking#fixed-deposit",
  },
  {
    title: "Msomi Account",
    bullets: ["No monthly fees", "Free debit card", "Financial literacy training"],
    image: "/images/products/wanafunzi.jpg",
    href: "/personal-banking#msomi",
  },
  {
    title: "Group Accounts",
    bullets: ["For SACCOs, Vikoba & Chamas", "Joint account management", "Group loan access"],
    image: "/images/products/group.jpg",
    href: "/personal-banking#group-savings",
  },
  {
    title: "CoopPesa Mobile",
    bullets: ["Send money instantly", "Pay bills and buy airtime", "Apply for digital loans"],
    image: "/images/products/coopesa.jpg",
    href: "/digital-banking",
  },
  {
    title: "Visa Debit Card",
    bullets: ["Accepted locally and internationally", "Secure online shopping", "Free with qualifying accounts"],
    image: "/images/products/visa-debit.jpg",
    href: "/digital-banking",
  },
  {
    title: "Agri-Business Loans",
    bullets: ["TSH 100K to 50M financing", "Up to 3 years repayment", "Grace period available"],
    image: "/images/products/agri-business.jpg",
    href: "/loan-products#agri-business",
  },
  {
    title: "SME Loans",
    bullets: ["Flexible repayment terms", "Free SME Hub membership", "Access to business advisory"],
    image: "/images/products/sme-loans.jpg",
    href: "/loan-products#sme-loans",
  },
];

export type ShowcaseDoc = {
  title?: string;
  bullets?: string | null;
  image?: { url?: string | null } | number | null;
  href?: string | null;
  active?: boolean | null;
};

// Editor-saved links may only be http(s), site-relative, or hash — anything
// else (javascript:, data:) would be a stored XSS via the card's href.
export function safeHref(href: string | null | undefined): string {
  const h = (href || "").trim();
  return /^(https?:\/\/|\/|#)/i.test(h) ? h : "";
}

// Maps CMS docs to view cards. Rejects legacy /api/media/file/* photo URLs
// (they 500 on live — same gotcha as leadership photos) and falls back to a
// same-title hardcoded image, else a generic one.
export function resolveShowcaseCards(docs: ShowcaseDoc[]): ShowcaseCard[] {
  const localByTitle = Object.fromEntries(FALLBACK_SHOWCASE_CARDS.map((c) => [c.title, c.image]));
  const cards = docs
    .filter((d) => d.title && d.active !== false)
    .map((d) => {
      const url = typeof d.image === "object" && d.image ? d.image.url : undefined;
      const usable = url && /^https?:\/\//.test(url) && !url.includes("/api/media/file/");
      return {
        title: d.title as string,
        bullets: (d.bullets || "")
          .split("\n")
          .map((b) => b.trim())
          .filter(Boolean),
        image: usable ? (url as string) : localByTitle[d.title as string] || "/images/products/group.jpg",
        href: safeHref(d.href) || "/personal-banking",
      };
    });
  return cards.length ? cards : FALLBACK_SHOWCASE_CARDS;
}
