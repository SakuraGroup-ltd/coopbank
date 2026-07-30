import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "../../payload.config";

// Rendered on demand so the blog list stays current and the build never
// depends on a DB connection.
export const dynamic = "force-dynamic";

const BASE = "https://coopbank.co.tz";

// Public marketing routes (no trailing slash — matches the site's canonical URLs).
const ROUTES = [
  "",
  "/about-us",
  "/about-us/board",
  "/about-us/management",
  "/personal-banking",
  "/loan-products",
  "/loan-products/calculator",
  "/digital-banking",
  "/digital-banking/coopnet",
  "/digital-banking/coopwakala",
  "/digital-banking/coopwakala/agents",
  "/digital-banking/qr-pay",
  "/digital-banking/ussd",
  "/treasury/fixed-deposits",
  "/treasury/foreign-exchange",
  "/treasury/government-securities",
  "/branches",
  "/investors",
  "/bank-charges",
  "/open-account",
  "/news",
  "/blog",
  "/faqs",
  "/careers",
  "/tenders",
  "/whistleblower",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = ROUTES.map((path) => ({
    url: BASE + path,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "blog-posts",
      where: { _status: { equals: "published" } },
      limit: 1000,
      depth: 0,
    });
    const docs = res.docs as Array<{ slug?: string; updatedAt?: string }>;
    blogEntries = docs
      .filter((d) => Boolean(d?.slug))
      .map((d) => ({
        url: `${BASE}/blog/${d.slug}`,
        lastModified: d.updatedAt ? new Date(d.updatedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6 as const,
      }));
  } catch {
    blogEntries = [];
  }

  return [...staticEntries, ...blogEntries];
}
