import { getPayload } from "payload";
import config from "../../../../payload.config";
import { NewsClient, type Article, type Source } from "@/components/news/NewsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "News & Insights | Cooperative Bank Tanzania",
  description: "What journalists across Tanzania and beyond are writing about the Cooperative Bank of Tanzania.",
};

// Fallback (used only if the media-coverage collection is empty/unreachable).
const FALLBACK_SOURCES: Record<string, Source> = {
  "The Citizen": { name: "The Citizen", logo: "/images/news/sources/the-citizen.jpg", url: "https://www.thecitizen.co.tz" },
  "Daily News": { name: "Daily News", logo: "/images/news/sources/daily-news.png", url: "https://dailynews.co.tz" },
  "The Chanzo": { name: "The Chanzo", logo: "/images/news/sources/the-chanzo.webp", url: "https://thechanzo.com" },
  "The Guardian": { name: "The Guardian", logo: "/images/news/sources/the-guardian.png", url: "https://www.ippmedia.com/the-guardian" },
  "Fintech Futures": { name: "Fintech Futures", logo: "/images/news/sources/fintech-futures.svg", url: "https://www.fintechfutures.com" },
  allAfrica: { name: "allAfrica", logo: "/images/news/sources/allafrica.jpg", url: "https://allafrica.com" },
  "Co-operative News": { name: "Co-operative News", logo: "/images/news/sources/the-citizen.jpg", url: "https://www.thenews.coop" },
  "Kilimo Kwanza": { name: "Kilimo Kwanza", logo: "/images/news/sources/daily-news.png", url: "https://kilimokwanza.org" },
};

const FALLBACK_ARTICLES: Article[] = [
  { title: "Coop Bank Targets Sh300 Billion in JUHUDI Savings Drive", date: "02.24.2026", source: "The Citizen", author: "Business Desk", category: "News", url: "https://www.thecitizen.co.tz/tanzania/business/coop-bank-targets-sh300-billion-in-juhudi-savings-drive-5371152", image: "/images/news/articles/chongolo-loan.jpg" },
  { title: "Focus on Cybersecurity, Coop Bank Told", date: "01.15.2026", source: "The Citizen", author: "National Desk", category: "Insights", url: "https://www.thecitizen.co.tz/tanzania/news/national/focus-on-cybersecurity-coop-bank-told-5300024", image: "/images/news/articles/cybersecurity.jpg" },
  { title: "UJE Urged to Safeguard Co-op Stake at Coop Bank", date: "01.10.2026", source: "Daily News", author: "Dodoma Correspondent", category: "News", url: "https://dailynews.co.tz/uje-urged-to-safeguard-co-op-stake-at-coop-bank/", image: "/images/news/articles/coop-bank-uje.png" },
];

function fmtDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}.${dd}.${d.getFullYear()}`;
}

type Doc = {
  title: string;
  url: string;
  source: string;
  sourceUrl?: string;
  sourceLogo?: string;
  author?: string;
  category?: string;
  image?: string;
  publishedDate?: string;
};

export default async function NewsPage() {
  let articles = FALLBACK_ARTICLES;
  let sources = FALLBACK_SOURCES;

  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "media-coverage",
      where: { active: { not_equals: false } },
      sort: ["-publishedDate", "sortOrder"],
      limit: 200,
      depth: 0,
    });
    const docs = res.docs as unknown as Doc[];
    if (docs.length) {
      articles = docs.map((d) => ({
        title: d.title,
        date: fmtDate(d.publishedDate),
        source: d.source,
        author: d.author || undefined,
        category: d.category || "News",
        url: d.url,
        image: d.image || "",
      }));
      const map: Record<string, Source> = {};
      for (const d of docs) {
        if (d.source && !map[d.source]) {
          map[d.source] = { name: d.source, logo: d.sourceLogo || "", url: d.sourceUrl || "#" };
        }
      }
      sources = map;
    }
  } catch {
    // fall back to hardcoded set
  }

  return <NewsClient articles={articles} sources={sources} />;
}
