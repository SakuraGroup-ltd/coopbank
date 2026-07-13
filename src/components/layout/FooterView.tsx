import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Linkedin,
  Facebook,
} from "lucide-react";

// FooterView is the PURE presentational component for the site footer: no data
// fetching, driven entirely by props. Both the live site (via Footer.tsx) and
// the studio live-preview iframe render this exact component so they can never
// drift from each other. resolveFooterData() is the single mapper from the
// `site-settings` / `footer` Payload globals (or empty objects) to FooterData,
// applying the hardcoded fallbacks below so the footer can NEVER break a page
// render even if a global is empty or the DB read fails.

export type FooterLink = { label: string; href: string };
export type FooterColumn = { heading: string; links: FooterLink[] };
export type FooterData = {
  columns: FooterColumn[];
  contact: { phone: string; email: string; address: string };
  social: { facebook: string; instagram: string; linkedin: string };
  app: { androidUrl: string; iosUrl: string };
  tagline: string;
  copyright: string;
  banner: { enabled: boolean; heading: string; subtext: string; buttonLabel: string; buttonHref: string };
  about: string;
  branches: FooterLink[];
  branchesNote: string;
  legalLinks: FooterLink[];
  developerCredit: FooterLink;
};

// Loosely-typed shapes of the two Payload globals this resolver reads. Payload
// doesn't currently generate a types file for this project, so these mirror
// only the fields actually accessed here (everything optional — a global can
// be entirely empty).
type RawLink = { label?: string | null; href?: string | null };
type RawColumn = { heading?: string | null; links?: RawLink[] | null };
export type SiteSettingsGlobal = {
  contact?: { phone?: string | null; email?: string | null; headquartersAddress?: string | null } | null;
  social?: { facebook?: string | null; instagram?: string | null; linkedin?: string | null } | null;
  appStore?: { androidUrl?: string | null; iosUrl?: string | null } | null;
};
export type FooterGlobal = {
  columns?: RawColumn[] | null;
  tagline?: string | null;
  copyright?: string | null;
  openAccountBanner?: {
    enabled?: boolean | null;
    heading?: string | null;
    subtext?: string | null;
    buttonLabel?: string | null;
    buttonHref?: string | null;
  } | null;
  about?: string | null;
  branches?: RawLink[] | null;
  branchesNote?: string | null;
  legalLinks?: RawLink[] | null;
  developerCredit?: RawLink | null;
};

// ---- Fallback content (used when the matching global field is unset) --------
const FALLBACK_COLUMNS: FooterColumn[] = [
  {
    heading: "Personal Banking",
    links: [
      { label: "Jasiri Account", href: "/personal-banking#jasiri" },
      { label: "Normal Savings", href: "/personal-banking#normal-savings" },
      { label: "Msomi Account", href: "/personal-banking#msomi" },
      { label: "Kilimo Tija", href: "/personal-banking#kilimo-tija" },
      { label: "Fixed Deposit", href: "/personal-banking#fixed-deposit" },
      { label: "Current Account", href: "/personal-banking#individual-current" },
      { label: "Mama Africa", href: "/personal-banking#mama-africa" },
    ],
  },
  {
    heading: "Digital Banking",
    links: [
      { label: "CoopNet (Internet Banking)", href: "/digital-banking/coopnet" },
      { label: "CoopPesa (Mobile App)", href: "/digital-banking" },
      { label: "USSD *150*84#", href: "/digital-banking/ussd" },
      { label: "CoopWakala (Agency)", href: "/digital-banking/coopwakala" },
      { label: "QR Pay", href: "/digital-banking/qr-pay" },
    ],
  },
  {
    heading: "Cards & Payments",
    links: [
      { label: "Visa Prepaid Card", href: "/cards#visa-prepaid" },
      { label: "Online Shopping", href: "/cards#online" },
      { label: "QR Pay", href: "/cards#qr-pay" },
      { label: "Bill Payments", href: "/cards#bill-pay" },
      { label: "Money Transfers", href: "/cards#transfers" },
      { label: "International Payments", href: "/cards#intl-payments" },
      { label: "Treasury Services", href: "/treasury/foreign-exchange" },
    ],
  },
  {
    heading: "Loan Products",
    links: [
      { label: "Agri-Business Loans", href: "/loan-products#agri-business" },
      { label: "Salaried Loans", href: "/loan-products#salaried-loans" },
      { label: "SME Loans", href: "/loan-products#sme-loans" },
      { label: "MSE Loans", href: "/loan-products#mse-loans" },
      { label: "Asset Financing", href: "/loan-products#asset-financing" },
      { label: "Digital Loans", href: "/loan-products#digital-loans" },
      { label: "Bajaji Loans", href: "/loan-products#bajaji-loans" },
      { label: "Loan Calculator", href: "/loan-products/calculator" },
    ],
  },
  {
    heading: "Help & Support",
    links: [
      { label: "Contact Us", href: "/branches" },
      { label: "Branch Locator", href: "/branches" },
      { label: "Careers", href: "/careers" },
      { label: "Tenders", href: "/tenders" },
      { label: "Newsroom", href: "/press" },
      { label: "Whistleblower", href: "/whistleblower" },
      { label: "About Us", href: "/about-us" },
    ],
  },
];

const FALLBACK_CONTACT = {
  phone: "+255 27 275 4470",
  email: "info@cbtbank.co.tz",
  address: "Sikukuu St, Dodoma",
};

const FALLBACK_SOCIAL = {
  facebook: "https://www.facebook.com/coopbanktanzania/",
  instagram: "https://www.instagram.com/coopbanktanzania/",
  linkedin: "https://tz.linkedin.com/company/coop-bank-tanzania",
};

// Canonical Play package is tz.co.coopbank.coopesa (the old badge link used a
// non-existent com.coopbank.coopesa — standardised here).
const FALLBACK_APP = {
  androidUrl: "https://play.google.com/store/apps/details?id=tz.co.coopbank.coopesa&hl=en",
  iosUrl: "https://apps.apple.com/app/coopesa/id6504440657",
};

const FALLBACK_TAGLINE = "Ustawi kwa wote";
const FALLBACK_COPYRIGHT = "© 2026 Cooperative Bank Tanzania Plc. All rights reserved.";

const FALLBACK_BANNER = {
  enabled: true,
  heading: "Open your account instantly on CoopPesa",
  subtext: "No branch visit needed — open your account digitally in minutes from your phone",
  buttonLabel: "Download CoopPesa",
  buttonHref: FALLBACK_APP.androidUrl,
};
const FALLBACK_ABOUT =
  "Cooperative Bank Tanzania Plc. Empowering individuals, businesses, and communities through inclusive banking since 1991.";
const FALLBACK_BRANCHES: FooterLink[] = [
  { label: "Dodoma (HQ)", href: "/branches" },
  { label: "Mtwara (Tandahimba)", href: "/branches" },
  { label: "Tabora", href: "/branches" },
  { label: "Moshi", href: "/branches" },
];
const FALLBACK_BRANCHES_NOTE = "+ 4 more coming soon";
const FALLBACK_LEGAL: FooterLink[] = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "Whistleblower", href: "/whistleblower" },
];
const FALLBACK_DEV = { label: "Sakurahost", href: "https://sakurahost.co.tz/web-development/" };

// Short address for the compact footer line. The global stores the full postal
// address (used elsewhere); collapse it to the first line for the footer chip.
function shortAddress(full?: string | null): string {
  if (!full) return FALLBACK_CONTACT.address;
  return full.split(/[,\n]/)[0].trim() || FALLBACK_CONTACT.address;
}

// Editor-saved links may only be http(s), site-relative, or hash — anything
// else (javascript:, data:) would be a stored XSS via the rendered href.
function safeHref(href?: string | null): string {
  const h = (href || "").trim();
  return /^(https?:\/\/|\/|#)/i.test(h) ? h : "";
}

export function resolveFooterData(site: SiteSettingsGlobal, footer: FooterGlobal): FooterData {
  const globalColumns: FooterColumn[] = Array.isArray(footer?.columns)
    ? footer.columns
        .filter((c): c is RawColumn & { heading: string } => !!c?.heading)
        .map((c) => ({
          heading: c.heading,
          links: Array.isArray(c.links)
            ? c.links
                .filter((l): l is FooterLink => !!l?.label && !!l?.href)
                .map((l) => ({ label: l.label, href: safeHref(l.href) }))
            : [],
        }))
    : [];
  return {
    columns: globalColumns.length ? globalColumns : FALLBACK_COLUMNS,
    contact: {
      phone: site?.contact?.phone || FALLBACK_CONTACT.phone,
      email: site?.contact?.email || FALLBACK_CONTACT.email,
      address: shortAddress(site?.contact?.headquartersAddress),
    },
    social: {
      facebook: site?.social?.facebook || FALLBACK_SOCIAL.facebook,
      instagram: site?.social?.instagram || FALLBACK_SOCIAL.instagram,
      linkedin: site?.social?.linkedin || FALLBACK_SOCIAL.linkedin,
    },
    app: {
      androidUrl: site?.appStore?.androidUrl || FALLBACK_APP.androidUrl,
      iosUrl: site?.appStore?.iosUrl || FALLBACK_APP.iosUrl,
    },
    tagline: footer?.tagline || FALLBACK_TAGLINE,
    copyright: footer?.copyright || FALLBACK_COPYRIGHT,
    banner: {
      enabled: footer?.openAccountBanner?.enabled ?? FALLBACK_BANNER.enabled,
      heading: footer?.openAccountBanner?.heading || FALLBACK_BANNER.heading,
      subtext: footer?.openAccountBanner?.subtext || FALLBACK_BANNER.subtext,
      buttonLabel: footer?.openAccountBanner?.buttonLabel || FALLBACK_BANNER.buttonLabel,
      buttonHref:
        safeHref(footer?.openAccountBanner?.buttonHref) ||
        safeHref(site?.appStore?.androidUrl) ||
        FALLBACK_BANNER.buttonHref,
    },
    about: footer?.about || FALLBACK_ABOUT,
    branches:
      Array.isArray(footer?.branches) && footer.branches.length
        ? footer.branches
            .filter((b): b is RawLink & { label: string } => !!b?.label)
            .map((b) => ({ label: b.label, href: safeHref(b.href) }))
        : FALLBACK_BRANCHES,
    branchesNote: footer?.branchesNote || FALLBACK_BRANCHES_NOTE,
    legalLinks:
      Array.isArray(footer?.legalLinks) && footer.legalLinks.length
        ? footer.legalLinks
            .filter((l): l is RawLink & { label: string } => !!l?.label)
            .map((l) => ({ label: l.label, href: safeHref(l.href) }))
        : FALLBACK_LEGAL,
    developerCredit: {
      label: footer?.developerCredit?.label || FALLBACK_DEV.label,
      href: safeHref(footer?.developerCredit?.href) || FALLBACK_DEV.href,
    },
  };
}

export function FooterView(props: FooterData) {
  const { columns, contact, social, app, tagline, copyright, banner, about, branches, branchesNote, legalLinks, developerCredit } = props;

  const socialLinks = [
    { key: "instagram", url: social.instagram, Icon: Instagram, label: "Instagram" },
    { key: "linkedin", url: social.linkedin, Icon: Linkedin, label: "LinkedIn" },
    { key: "facebook", url: social.facebook, Icon: Facebook, label: "Facebook" },
  ].filter((s) => s.url);

  return (
    <footer>
      {/* Open Account Banner */}
      {banner.enabled && (
        <div className="bg-[#1A8A3A]">
          <div className="mx-auto max-w-7xl px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {banner.heading}
              </h3>
              <p className="text-sm text-white/70 mt-1">
                {banner.subtext}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={banner.buttonHref}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center px-6 py-2.5 rounded-full border-2 border-white text-sm font-bold text-white hover:bg-white hover:text-[#1A8A3A] transition-colors"
              >
                {banner.buttonLabel}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer */}
      <div className="bg-[#0F3D7A]">
        {/* Footer Columns */}
        <div className="px-6 py-12">
          <div className="mx-auto grid max-w-7xl gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
            {/* Column 1 — Logo & About */}
            <div>
              <Link href="/" className="inline-block mb-4">
                <Image
                  src="/images/coopbank-logo.png"
                  alt="CoopBank Logo"
                  width={120}
                  height={42}
                  className="brightness-0 invert"
                />
              </Link>
              <p className="text-xs text-white/60 leading-relaxed mb-3">
                {about}
              </p>
              <p className="text-[11px] text-white/40 italic font-bold">
                &ldquo;{tagline}&rdquo;
              </p>
            </div>

            {/* Nav columns — CMS-driven (footer global) with hardcoded fallback */}
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                  {col.heading}
                </h4>
                <ul className="space-y-1.5">
                  {col.links.map((item) => (
                    <li key={`${col.heading}-${item.label}`}>
                      <Link
                        href={item.href}
                        className="text-xs text-white/70 transition-colors hover:text-[#00C853]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Column — Headquarters & Branches */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                Headquarters
              </h4>
              <div className="space-y-1.5 mb-4">
                <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="text-xs text-white/70 transition-colors hover:text-[#00C853] flex items-center gap-1.5">
                  <Phone className="h-3 w-3 shrink-0 text-[#1A8A3A]" />
                  {contact.phone}
                </a>
                <a href={`mailto:${contact.email}`} className="text-xs text-white/70 transition-colors hover:text-[#00C853] flex items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0 text-[#1A8A3A]" />
                  {contact.email}
                </a>
                <span className="text-xs text-white/70 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0 text-[#1A8A3A]" />
                  {contact.address}
                </span>
              </div>

              <div className="border-t border-white/10 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50 mb-2">
                  Branches
                </p>
                <ul className="space-y-1.5">
                  {branches.map((branch) => (
                    <li key={branch.label}>
                      <Link href={branch.href} className="text-xs text-white/70 transition-colors hover:text-[#00C853] flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                        {branch.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/branches" className="text-[10px] text-white/40 transition-colors hover:text-[#00C853] mt-1 inline-block">
                      {branchesNote}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* App Download + Legal Links */}
        <div className="border-t border-white/10 px-6 py-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-white/50">
                Download CoopPesa:
              </span>
              <div className="flex gap-2">
                <a href={app.androidUrl} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Get it on Google Play"
                    className="h-8"
                  />
                </a>
                <a href={app.iosUrl} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
                  <img
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                    alt="Download on the App Store"
                    className="h-8"
                  />
                </a>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[11px] text-white/40 transition-colors hover:text-white/70"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="bg-[#06152B] px-6 py-5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-white/50">
              {copyright}
            </p>
            <p className="text-xs text-white/30">
              Developed by{" "}
              <a
                href={developerCredit.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 transition-colors hover:text-[#00C853]"
              >
                {developerCredit.label}
              </a>
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ key, url, Icon, label }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-white/50 transition-colors hover:text-[#00C853]"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
