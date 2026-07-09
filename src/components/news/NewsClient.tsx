"use client";

import { useState, useCallback } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export interface Source {
  name: string;
  logo: string;
  url: string;
}

export interface Article {
  title: string;
  date: string;
  source: string;
  author?: string;
  category: string;
  url: string;
  image: string;
}

const CATEGORIES = ["All", "News", "Press", "Insights", "Agriculture"];

export function NewsClient({
  articles,
  sources,
}: {
  articles: Article[];
  sources: Record<string, Source>;
}) {
  const [active, setActive] = useState<string>("All");

  const filtered = active === "All" ? articles : articles.filter((a) => a.category === active);

  const trackClick = useCallback((article: Article) => {
    window.gtag?.("event", "news_article_click", {
      article_title: article.title,
      article_source: article.source,
      article_category: article.category,
      article_url: article.url,
      article_date: article.date,
    });
  }, []);

  const trackFilter = useCallback((category: string) => {
    window.gtag?.("event", "news_filter", { filter_category: category });
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f3fe]">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-5 pt-40 pb-6">
        <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-[#2C3345] tracking-tight leading-tight">
          News &amp; Insights
        </h1>
        <p className="mt-3 text-[15px] text-[#888] leading-relaxed max-w-lg">
          What journalists across Tanzania and beyond are writing about the Cooperative Bank of
          Tanzania.
        </p>

        {/* Filters */}
        <div className="flex items-center gap-5 mt-8 border-b border-[#e0e0e8] pb-4">
          <span className="text-[13px] text-[#aaa] tracking-wide">Filter by</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActive(cat);
                trackFilter(cat);
              }}
              className={`text-[13px] font-medium transition-colors ${
                active === cat ? "text-[#2E69FF]" : "text-[#666] hover:text-[#2C3345]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
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
                <div className="relative overflow-hidden aspect-[16/10]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  {src && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded px-2 py-1.5 flex items-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src.logo} alt={src.name} className="h-3.5 w-auto object-contain" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="bg-[#2C3345]/80 text-[10px] font-semibold text-white px-2 py-1 rounded">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-[12px] text-[#999] mb-3">
                    <span>{article.date}</span>
                    {article.author && (
                      <>
                        <span className="text-[#ddd]">&middot;</span>
                        <span>{article.author}</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-[15px] font-bold text-[#2C3345] leading-snug group-hover:text-[#2E69FF] transition-colors duration-200 line-clamp-3">
                    {article.title}
                  </h2>

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

      {/* Sources strip */}
      {Object.keys(sources).length > 0 && (
        <div className="border-t border-[#e0e0e8] bg-white">
          <div className="max-w-6xl mx-auto px-5 py-12">
            <p className="text-[12px] text-[#aaa] uppercase tracking-widest mb-6">Originally published by</p>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
              {Object.values(sources).map((pub) => (
                <a
                  key={pub.name}
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-40 hover:opacity-100 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
      )}

      {/* Media contact */}
      <div className="bg-[#2C3345]">
        <div className="max-w-6xl mx-auto px-5 py-14 text-center">
          <h2 className="text-[1.5rem] font-bold text-white mb-3">Media Inquiries</h2>
          <p className="text-[15px] text-white/60 mb-6 max-w-md mx-auto">
            For press kits, interview requests, or story leads — reach our communications team.
            See our official <Link href="/press" className="underline hover:text-white">press releases</Link>.
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
