"use client";

import { useState, useCallback } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

type Category = "All" | "News" | "Press" | "Insights" | "Agriculture";

interface Source {
  name: string;
  logo: string;
  url: string;
}

const sources: Record<string, Source> = {
  "The Citizen": {
    name: "The Citizen",
    logo: "/images/news/sources/the-citizen.jpg",
    url: "https://www.thecitizen.co.tz",
  },
  "Daily News": {
    name: "Daily News",
    logo: "/images/news/sources/daily-news.png",
    url: "https://dailynews.co.tz",
  },
  "The Chanzo": {
    name: "The Chanzo",
    logo: "/images/news/sources/the-chanzo.webp",
    url: "https://thechanzo.com",
  },
  "The Guardian": {
    name: "The Guardian",
    logo: "/images/news/sources/the-guardian.png",
    url: "https://www.ippmedia.com/the-guardian",
  },
  "Fintech Futures": {
    name: "Fintech Futures",
    logo: "/images/news/sources/fintech-futures.svg",
    url: "https://www.fintechfutures.com",
  },
  allAfrica: {
    name: "allAfrica",
    logo: "/images/news/sources/allafrica.jpg",
    url: "https://allafrica.com",
  },
  "Co-operative News": {
    name: "Co-operative News",
    logo: "/images/news/sources/the-citizen.jpg",
    url: "https://www.thenews.coop",
  },
  "Kilimo Kwanza": {
    name: "Kilimo Kwanza",
    logo: "/images/news/sources/daily-news.png",
    url: "https://kilimokwanza.org",
  },
};

interface Article {
  title: string;
  date: string;
  source: string;
  author?: string;
  category: Exclude<Category, "All">;
  url: string;
  image: string;
}

const articles: Article[] = [
  {
    title: "Coop Bank Targets Sh300 Billion in JUHUDI Savings Drive",
    date: "02.24.2026",
    source: "The Citizen",
    author: "Business Desk",
    category: "News",
    url: "https://www.thecitizen.co.tz/tanzania/business/coop-bank-targets-sh300-billion-in-juhudi-savings-drive-5371152",
    image: "/images/news/articles/chongolo-loan.jpg",
  },
  {
    title: "Focus on Cybersecurity, Coop Bank Told",
    date: "01.15.2026",
    source: "The Citizen",
    author: "National Desk",
    category: "Insights",
    url: "https://www.thecitizen.co.tz/tanzania/news/national/focus-on-cybersecurity-coop-bank-told-5300024",
    image: "/images/news/articles/cybersecurity.jpg",
  },
  {
    title: "UJE Urged to Safeguard Co-op Stake at Coop Bank",
    date: "01.10.2026",
    source: "Daily News",
    author: "Dodoma Correspondent",
    category: "News",
    url: "https://dailynews.co.tz/uje-urged-to-safeguard-co-op-stake-at-coop-bank/",
    image: "/images/news/articles/coop-bank-uje.png",
  },
  {
    title: "Coop Bank Unveils CooPesa to Mark a New Era of Digital Banking",
    date: "12.08.2025",
    source: "The Citizen",
    category: "Press",
    url: "https://www.thecitizen.co.tz/tanzania/supplement/coop-bank-unveils-coopesa-to-mark-a-new-era-of-digital-banking-5301614",
    image: "/images/news/articles/coopesa-launch.jpg",
  },
  {
    title: "Coop Bank Tanzania Unveils CooPesa Mobile App",
    date: "12.05.2025",
    source: "Fintech Futures",
    author: "Editorial Team",
    category: "Press",
    url: "https://www.fintechfutures.com/credit-unions-building-societies/coop-bank-tanzania-unveils-coopesa-mobile-app",
    image: "/images/news/articles/coopesa-launch.jpg",
  },
  {
    title: "Coop Bank Hailed for Increasing Loan Portfolio from 15bn/- to 52bn/-",
    date: "11.18.2025",
    source: "Daily News",
    author: "Business Reporter",
    category: "News",
    url: "https://dailynews.co.tz/coop-bank-hailed-for-increasing-loan-portfolio-from-15bn-to-52bn/",
    image: "/images/news/articles/chongolo-loan.jpg",
  },
  {
    title: "Coop Bank Issues Over 49bn/- in Loans to Cooperative Unions",
    date: "10.07.2025",
    source: "allAfrica",
    category: "News",
    url: "https://allafrica.com/stories/202510070301.html",
    image: "/images/news/articles/ghala-pesa.jpg",
  },
  {
    title: "Stored Crops to Secure Loans Under Ghala Pesa",
    date: "09.15.2025",
    source: "Daily News",
    author: "Agriculture Desk",
    category: "Agriculture",
    url: "https://dailynews.co.tz/stored-crops-to-secure-loans-under-ghala-pesa/",
    image: "/images/news/articles/ghala-pesa.jpg",
  },
  {
    title: "Coop Bank on Mission to End the Financial Inclusion Divide",
    date: "05.20.2025",
    source: "The Citizen",
    author: "Business Desk",
    category: "Insights",
    url: "https://www.thecitizen.co.tz/tanzania/business/coop-bank-on-mission-to-end-the-financial-inclusion-divide-5006316",
    image: "/images/news/articles/cashew-inclusion.jpg",
  },
  {
    title: "How Coop Bank Plans to Tackle Unlicensed Middlemen Exploitation",
    date: "05.12.2025",
    source: "The Citizen",
    author: "National Desk",
    category: "Agriculture",
    url: "https://www.thecitizen.co.tz/tanzania/news/national/how-coop-bank-plans-to-tackle-unlicensed-middlemen-exploitation-5010250",
    image: "/images/news/articles/cashew-inclusion.jpg",
  },
  {
    title: "Fresh Hope for Agriculture as Samia Launches Cooperative Bank",
    date: "04.28.2025",
    source: "The Citizen",
    author: "Special Report",
    category: "Press",
    url: "https://www.thecitizen.co.tz/tanzania/news/national/fresh-hope-for-agriculture-as-samia-launches-cooperative-bank-5020726",
    image: "/images/news/articles/samia-launch.jpg",
  },
  {
    title: "New Cooperative Bank Set to Transform Tanzania\u2019s Agricultural Financing",
    date: "04.11.2025",
    source: "The Chanzo",
    author: "Investigative Desk",
    category: "Insights",
    url: "https://thechanzo.com/2025/04/11/new-cooperative-bank-set-to-transform-tanzanias-agricultural-financing/",
    image: "/images/news/articles/ushirika-chanzo.jpg",
  },
  {
    title: "Tanzania Launches National Co-op Bank to Transform Financial Landscape",
    date: "04.05.2025",
    source: "Co-operative News",
    author: "International Desk",
    category: "Press",
    url: "https://www.thenews.coop/tanzania-launches-national-co-op-bank-to-transform-financial-landscape/",
    image: "/images/news/articles/samia-coop-news.jpg",
  },
  {
    title: "Mama Samia Coop Banking Vision Realized: Driving Financial Inclusion",
    date: "04.02.2025",
    source: "Kilimo Kwanza",
    category: "Press",
    url: "https://kilimokwanza.org/mama-samia-coop-banking-vision-realized-driving-financial-inclusion-sharing-prosperitythe-new-era-of-banking-has-come/",
    image: "/images/news/articles/kilimo-mama-samia.png",
  },
  {
    title: "From Grassroots to Growth: The Rise of Coop Bank Tanzania",
    date: "04.01.2025",
    source: "Kilimo Kwanza",
    author: "Feature",
    category: "Insights",
    url: "https://kilimokwanza.org/from-grassroots-to-growth-the-rise-of-coop-bank-tanzania/",
    image: "/images/news/articles/ushirika-chanzo.jpg",
  },
  {
    title: "Bashe Lauds TCDC Chair for Driving Establishment of Cooperative Bank",
    date: "10.18.2024",
    source: "The Guardian",
    author: "Business Desk",
    category: "Press",
    url: "https://www.ippmedia.com/the-guardian/business/read/bashe-lauds-tcdc-chair-for-driving-establishment-of-cooperative-bank-2024-10-18-095523",
    image: "/images/news/articles/samia-launch.jpg",
  },
  {
    title: "National Cooperative Bank Takes Shape in Tanzania",
    date: "07.15.2024",
    source: "Kilimo Kwanza",
    category: "News",
    url: "https://kilimokwanza.org/national-cooperative-bank-takes-shape-in-tanzania-a-major-leap-for-cooperative-banking/",
    image: "/images/news/articles/coop-bank-uje.png",
  },
  {
    title: "CRDB Seeks Bigger Pie of Planned Co-op Bank",
    date: "06.12.2023",
    source: "The Citizen",
    author: "Business Desk",
    category: "News",
    url: "https://www.thecitizen.co.tz/tanzania/news/business/crdb-seeks-bigger-pie-of-planned-co-op-bank-4598878",
    image: "/images/news/articles/coopesa-launch.jpg",
  },
  {
    title: "KCBL Wins Big at First TIOB Awards",
    date: "11.20.2022",
    source: "The Citizen",
    author: "Business Desk",
    category: "Press",
    url: "https://www.thecitizen.co.tz/tanzania/news/business/kcbl-wins-big-at-first-tiob-awards-4184590",
    image: "/images/news/articles/chongolo-loan.jpg",
  },
];

const categories: Category[] = [
  "All",
  "News",
  "Press",
  "Insights",
  "Agriculture",
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function NewsPage() {
  const [active, setActive] = useState<Category>("All");

  const filtered =
    active === "All" ? articles : articles.filter((a) => a.category === active);

  const trackClick = useCallback((article: Article) => {
    window.gtag?.("event", "news_article_click", {
      article_title: article.title,
      article_source: article.source,
      article_category: article.category,
      article_url: article.url,
      article_date: article.date,
    });
  }, []);

  const trackFilter = useCallback((category: Category) => {
    window.gtag?.("event", "news_filter", {
      filter_category: category,
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f3fe]">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 pt-40 pb-6">
        <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-[#2C3345] tracking-tight leading-tight">
          News &amp; Insights
        </h1>
        <p className="mt-3 text-[15px] text-[#888] leading-relaxed max-w-lg">
          What journalists across Tanzania and beyond are writing about the
          Cooperative Bank of Tanzania.
        </p>

        {/* Filters */}
        <div className="flex items-center gap-5 mt-8 border-b border-[#e0e0e8] pb-4">
          <span className="text-[13px] text-[#aaa] tracking-wide">
            Filter by
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActive(cat); trackFilter(cat); }}
              className={`text-[13px] font-medium transition-colors ${
                active === cat
                  ? "text-[#2E69FF]"
                  : "text-[#666] hover:text-[#2C3345]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((article, i) => {
            const src = sources[article.source];
            return (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick(article)}
                className="group bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[16/10]">
                  <img
                    src={article.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {/* Source logo pill */}
                  {src && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded px-2 py-1.5 flex items-center gap-1.5">
                      <img
                        src={src.logo}
                        alt={src.name}
                        className="h-3.5 w-auto object-contain"
                      />
                    </div>
                  )}
                  {/* Category */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-[#2C3345]/80 text-[10px] font-semibold text-white px-2 py-1 rounded">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Meta */}
                  <div className="flex items-center gap-1.5 text-[12px] text-[#999] mb-3">
                    <span>{article.date}</span>
                    {article.author && (
                      <>
                        <span className="text-[#ddd]">&middot;</span>
                        <span>{article.author}</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-[15px] font-bold text-[#2C3345] leading-snug group-hover:text-[#2E69FF] transition-colors duration-200 line-clamp-3">
                    {article.title}
                  </h2>

                  {/* Read link */}
                  <div className="flex items-center gap-1.5 mt-4 text-[12px] font-medium text-[#2E69FF]">
                    Read on {article.source}
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-[15px] text-[#999] py-16 text-center">
            No articles in this category yet.
          </p>
        )}
      </div>

      {/* ── Sources strip ──────────────────────────────────────── */}
      <div className="border-t border-[#e0e0e8] bg-white">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <p className="text-[12px] text-[#aaa] uppercase tracking-widest mb-6">
            Originally published by
          </p>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
            {Object.values(sources).map((pub) => (
              <a
                key={pub.name}
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-40 hover:opacity-100 transition-opacity"
              >
                <img
                  src={pub.logo}
                  alt={pub.name}
                  className="h-6 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Media contact ──────────────────────────────────────── */}
      <div className="bg-[#2C3345]">
        <div className="max-w-6xl mx-auto px-5 py-14 text-center">
          <h2 className="text-[1.5rem] font-bold text-white mb-3">
            Media Inquiries
          </h2>
          <p className="text-[15px] text-white/60 mb-6 max-w-md mx-auto">
            For press kits, interview requests, or story leads — reach our
            communications team.
          </p>
          <Link
            href="mailto:info@cbtbank.co.tz"
            className="inline-block text-[13px] font-bold uppercase tracking-wider text-white border border-white/30 rounded px-6 py-3 hover:bg-white hover:text-[#2C3345] transition-all"
          >
            info@cbtbank.co.tz
          </Link>
        </div>
      </div>
    </div>
  );
}
