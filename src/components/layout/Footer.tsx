"use client";

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

const personalBanking = [
  { label: "Jasiri Account", href: "/personal-banking#jasiri" },
  { label: "Normal Savings", href: "/personal-banking#normal-savings" },
  { label: "Msomi Account", href: "/personal-banking#msomi" },
  { label: "Kilimo Tija", href: "/personal-banking#kilimo-tija" },
  { label: "Fixed Deposit", href: "/personal-banking#fixed-deposit" },
  { label: "Current Account", href: "/personal-banking#individual-current" },
  { label: "Mama Africa", href: "/personal-banking#mama-africa" },
];

const digitalBanking = [
  { label: "CoopNet (Internet Banking)", href: "/digital-banking/coopnet" },
  { label: "CoopEsa (Mobile App)", href: "/digital-banking" },
  { label: "USSD *150*84#", href: "/digital-banking/ussd" },
  { label: "CoopWakala (Agency)", href: "/digital-banking/coopwakala" },
  { label: "QR Pay", href: "/digital-banking/qr-pay" },
];

const cardsPayments = [
  { label: "Visa Prepaid Card", href: "/cards#visa-prepaid" },
  { label: "Online Shopping", href: "/cards#online" },
  { label: "QR Pay", href: "/cards#qr-pay" },
  { label: "Bill Payments", href: "/cards#bill-pay" },
  { label: "Money Transfers", href: "/cards#transfers" },
  { label: "International Payments", href: "/cards#intl-payments" },
  { label: "Treasury Services", href: "/treasury/foreign-exchange" },
];

const loanProducts = [
  { label: "Agri-Business Loans", href: "/loan-products#agri-business" },
  { label: "Salaried Loans", href: "/loan-products#salaried-loans" },
  { label: "SME Loans", href: "/loan-products#sme-loans" },
  { label: "MSE Loans", href: "/loan-products#mse-loans" },
  { label: "Asset Financing", href: "/loan-products#asset-financing" },
  { label: "Digital Loans", href: "/loan-products#digital-loans" },
  { label: "Bajaji Loans", href: "/loan-products#bajaji-loans" },
  { label: "Loan Calculator", href: "/loan-products/calculator" },
];

const helpSupport = [
  { label: "Contact Us", href: "/branches" },
  { label: "Branch Locator", href: "/branches" },
  { label: "Careers", href: "/careers" },
  { label: "Tenders", href: "/tenders" },
  { label: "Whistleblower", href: "/whistleblower" },
  { label: "About Us", href: "/about-us" },
];

export default function Footer() {
  return (
    <footer>
      {/* Open Account Banner */}
      <div className="bg-[#1A8A3A]">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              Open your account instantly on CoopEsa
            </h3>
            <p className="text-sm text-white/70 mt-1">
              No branch visit needed — open your account digitally in minutes from your phone
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://play.google.com/store/apps/details?id=tz.co.coopbank.coopesa&hl=en"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center px-6 py-2.5 rounded-full border-2 border-white text-sm font-bold text-white hover:bg-white hover:text-[#1A8A3A] transition-colors"
            >
              Download CoopEsa
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
                &ldquo;Ustawi kwa wote&rdquo;
              </p>
            </div>

            {/* Column 2 — Personal Banking */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                Personal Banking
              </h4>
              <ul className="space-y-1.5">
                {personalBanking.map((item) => (
                  <li key={item.label}>
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

            {/* Column 3 — Digital Banking */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                Digital Banking
              </h4>
              <ul className="space-y-1.5">
                {digitalBanking.map((item) => (
                  <li key={item.label}>
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

            {/* Column 4 — Cards & Payments */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                Cards &amp; Payments
              </h4>
              <ul className="space-y-1.5">
                {cardsPayments.map((item) => (
                  <li key={item.label}>
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

            {/* Column 5 — Loan Products */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                Loan Products
              </h4>
              <ul className="space-y-1.5">
                {loanProducts.map((item) => (
                  <li key={item.label}>
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

            {/* Column 5 — Help & Support */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                Help &amp; Support
              </h4>
              <ul className="space-y-1.5">
                {helpSupport.map((item) => (
                  <li key={item.label}>
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

            {/* Column 6 — Headquarters & Branches */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white">
                Headquarters
              </h4>
              <div className="space-y-1.5 mb-4">
                <a href="tel:+255272754470" className="text-xs text-white/70 transition-colors hover:text-[#00C853] flex items-center gap-1.5">
                  <Phone className="h-3 w-3 shrink-0 text-[#1A8A3A]" />
                  +255 27 275 4470
                </a>
                <a href="mailto:info@cbtbank.co.tz" className="text-xs text-white/70 transition-colors hover:text-[#00C853] flex items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0 text-[#1A8A3A]" />
                  info@cbtbank.co.tz
                </a>
                <span className="text-xs text-white/70 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0 text-[#1A8A3A]" />
                  Kuu St, Dodoma
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
                Download CoopEsa:
              </span>
              <div className="flex gap-2">
                <a href="https://play.google.com/store/apps/details?id=com.coopbank.coopesa" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Get it on Google Play"
                    className="h-8"
                  />
                </a>
                <a href="https://apps.apple.com/app/coopesa/id6504440657" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
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
              &copy; 2026 Cooperative Bank Tanzania Plc. All rights reserved.
            </p>
            <p className="text-xs text-white/30">
              Developed by{" "}
              <a
                href="https://sakuragroup.co.tz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 transition-colors hover:text-[#00C853]"
              >
                Sakura Group (T) Limited
              </a>
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/coopbanktanzania/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white/50 transition-colors hover:text-[#00C853]"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://tz.linkedin.com/company/coop-bank-tanzania"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-white/50 transition-colors hover:text-[#00C853]"
              >
                <Linkedin className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://www.facebook.com/coopbanktanzania/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-white/50 transition-colors hover:text-[#00C853]"
              >
                <Facebook className="h-5 w-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
