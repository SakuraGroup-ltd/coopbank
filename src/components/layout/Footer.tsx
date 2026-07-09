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
import { getPayload } from "payload";
import config from "../../../payload.config";

// Footer is CMS-driven: contact details, social links, and the app-store URLs
// come from the `site-settings` global; the tagline, copyright, and (optionally)
// the nav-link columns come from the `footer` global. Everything degrades to the
// hardcoded fallbacks below if a global is empty or the DB read fails, so the
// footer can NEVER break a page render.

type LinkItem = { label: string; href: string };
type Column = { heading: string; links: LinkItem[] };

// ---- Fallback content (used when the matching global field is unset) --------
const FALLBACK_COLUMNS: Column[] = [
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

// Short address for the compact footer line. The global stores the full postal
// address (used elsewhere); collapse it to the first line for the footer chip.
function shortAddress(full?: string): string {
  if (!full) return FALLBACK_CONTACT.address;
  return full.split(/[,\n]/)[0].trim() || FALLBACK_CONTACT.address;
}

async function loadFooterData() {
  try {
    const payload = await getPayload({ config });
    const [site, footer] = await Promise.all([
      payload.findGlobal({ slug: "site-settings", depth: 0 }),
      payload.findGlobal({ slug: "footer", depth: 0 }),
    ]);
    return { site: site as Record<string, any>, footer: footer as Record<string, any> };
  } catch {
    // DB unavailable (e.g. during a static build) — fall back entirely.
    return { site: {} as Record<string, any>, footer: {} as Record<string, any> };
  }
}

export default async function Footer() {
  const { site, footer } = await loadFooterData();

  const contact = {
    phone: site?.contact?.phone || FALLBACK_CONTACT.phone,
    email: site?.contact?.email || FALLBACK_CONTACT.email,
    address: shortAddress(site?.contact?.headquartersAddress),
  };
  const social = {
    facebook: site?.social?.facebook || FALLBACK_SOCIAL.facebook,
    instagram: site?.social?.instagram || FALLBACK_SOCIAL.instagram,
    linkedin: site?.social?.linkedin || FALLBACK_SOCIAL.linkedin,
  };
  const app = {
    androidUrl: site?.appStore?.androidUrl || FALLBACK_APP.androidUrl,
    iosUrl: site?.appStore?.iosUrl || FALLBACK_APP.iosUrl,
  };
  const tagline = footer?.tagline || FALLBACK_TAGLINE;
  const copyright = footer?.copyright || FALLBACK_COPYRIGHT;

  // Only use the global's columns if it actually has content, else fall back.
  const globalColumns: Column[] = Array.isArray(footer?.columns)
    ? footer.columns
        .filter((c: any) => c?.heading)
        .map((c: any) => ({
          heading: c.heading,
          links: Array.isArray(c.links)
            ? c.links.filter((l: any) => l?.label && l?.href)
            : [],
        }))
    : [];
  const columns: Column[] = globalColumns.length > 0 ? globalColumns : FALLBACK_COLUMNS;

  const socialLinks = [
    { key: "instagram", url: social.instagram, Icon: Instagram, label: "Instagram" },
    { key: "linkedin", url: social.linkedin, Icon: Linkedin, label: "LinkedIn" },
    { key: "facebook", url: social.facebook, Icon: Facebook, label: "Facebook" },
  ].filter((s) => s.url);

  return (
    <footer>
      {/* Open Account Banner */}
      <div className="bg-[#1A8A3A]">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              Open your account instantly on CoopPesa
            </h3>
            <p className="text-sm text-white/70 mt-1">
              No branch visit needed — open your account digitally in minutes from your phone
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={app.androidUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center px-6 py-2.5 rounded-full border-2 border-white text-sm font-bold text-white hover:bg-white hover:text-[#1A8A3A] transition-colors"
            >
              Download CoopPesa
            </a>
          </div>
        </div>
      </div>

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
                Cooperative Bank Tanzania Plc. Empowering individuals, businesses, and communities through inclusive banking since 1991.
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
                  <li>
                    <Link href="/branches" className="text-xs text-white/70 transition-colors hover:text-[#00C853] flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                      Dodoma (HQ)
                    </Link>
                  </li>
                  <li>
                    <Link href="/branches" className="text-xs text-white/70 transition-colors hover:text-[#00C853] flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                      Mtwara (Tandahimba)
                    </Link>
                  </li>
                  <li>
                    <Link href="/branches" className="text-xs text-white/70 transition-colors hover:text-[#00C853] flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                      Tabora
                    </Link>
                  </li>
                  <li>
                    <Link href="/branches" className="text-xs text-white/70 transition-colors hover:text-[#00C853] flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00C853]" />
                      Moshi
                    </Link>
                  </li>
                  <li>
                    <Link href="/branches" className="text-[10px] text-white/40 transition-colors hover:text-[#00C853] mt-1 inline-block">
                      + 4 more coming soon
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
              <span className="text-[11px] text-white/40 hover:text-white/70 transition-colors cursor-default">Privacy Policy</span>
              <span className="text-[11px] text-white/40 hover:text-white/70 transition-colors cursor-default">Terms of Service</span>
              <span className="text-[11px] text-white/40 hover:text-white/70 transition-colors cursor-default">Cookie Policy</span>
              <Link href="/whistleblower" className="text-[11px] text-white/40 transition-colors hover:text-white/70">Whistleblower</Link>
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
                href="https://sakurahost.co.tz/web-development/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 transition-colors hover:text-[#00C853]"
              >
                Sakurahost
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
