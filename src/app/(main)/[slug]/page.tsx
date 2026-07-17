// Marketing can publish brand-new pages from Studio → Pages with no deploy:
// a published doc with slug `savings-week` serves at /savings-week. Every
// existing route segment is reserved so this can never shadow real routes.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBlocks from "@/components/blocks/PageBlocks";
import { getPublishedPage } from "@/lib/get-page";

export const dynamic = "force-dynamic";

export const RESERVED_SLUGS = new Set([
  "home", "about-us", "contact-us", "bank-charges", "blog", "branches",
  "careers", "digital-banking", "faqs", "home-2", "loan-products", "news",
  "open-account", "personal-banking", "press", "preview", "tenders",
  "treasury", "whistleblower", "privacy", "cards", "studio", "studio-preview", "api",
  "admin", "sitemap.xml", "robots.txt",
]);

type Args = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) return {};
  const page = await getPublishedPage(slug);
  if (!page) return {};
  return {
    title: page.seo?.metaTitle || `${page.title || slug} | Cooperative Bank Tanzania`,
    description: page.seo?.metaDescription || undefined,
  };
}

export default async function CmsPage({ params }: Args) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) notFound();
  const page = await getPublishedPage(slug);
  if (!page) notFound();
  return <PageBlocks blocks={page.layout} />;
}
