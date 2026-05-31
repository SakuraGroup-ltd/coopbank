// Live Preview target. Payload admin iframes the URL set on each
// collection's livePreview config:
//   Pages       → /preview/<slug>           (or /preview/home)
//   Job listing → /preview/careers/<id>
//   Tender      → /preview/tenders/<ref>
//   Blog post   → /preview/news/<slug>
//
// We dispatch on the first segment so each scope renders an appropriate
// focused preview. Pages use the block renderer (WYSIWYG via postMessage);
// detail previews render a single record with the live-site styling.
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import PreviewClient from "@/components/preview/PreviewClient";
import CareersClient, { type ClientJob } from "../../careers/CareersClient";

const JOB_TYPE_LABEL: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  consultancy: "Consultancy",
  internship: "Internship",
};
const DEPT_LABEL: Record<string, string> = {
  technology: "Technology",
  "ict-security": "ICT Security",
  "it-digital": "IT & Digital Transformation",
  operations: "Operations",
  credit: "Credit",
  marketing: "Marketing",
  treasury: "Treasury",
  hr: "Human Resources",
  finance: "Finance",
  other: "Other",
};

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

type Args = { params: Promise<{ slug?: string[] }> };

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: Args) {
  const { slug = [] } = await params;
  const payload = await getPayload({ config });

  const [scope, ...rest] = slug;
  const key = rest.join("/");

  // ─── Jobs ────────────────────────────────────────────────────────
  // Renders the actual /careers page focused on the requested job — same
  // chrome, navbar, hero, filter chips. The matching row opens by default
  // and scrolls into view. URL `key` may be slug OR id.
  if (scope === "careers" && key) {
    // Find the focused job to confirm it exists (returns 404 if not).
    const bySlug = await payload.find({
      collection: "job-listings",
      where: { slug: { equals: key } },
      limit: 1,
      draft: true,
      depth: 0,
    });
    const focused = bySlug.docs[0]
      ? bySlug.docs[0]
      : await payload
          .findByID({ collection: "job-listings", id: key, draft: true, depth: 0 })
          .catch(() => null);
    if (!focused) return notFound();

    // Load every published job so the page renders the full listing context.
    // We deliberately do NOT filter by status here — drafts being previewed
    // need to show up too. The editor's session passes through naturally.
    const all = await payload.find({
      collection: "job-listings",
      limit: 200,
      depth: 0,
      sort: "-applyByDate",
      draft: true,
    });
    const today = Date.now();
    const jobs: ClientJob[] = all.docs
      .map((d) => {
        const r = d as unknown as {
          id: string | number;
          jobTitle: string;
          slug?: string;
          department?: string;
          location?: string;
          jobType?: string;
          applyByDate?: string;
          summary?: string;
          descriptionHtml?: string;
          requirementsHtml?: string;
        };
        return {
          id: r.slug || String(r.id),
          job_title: r.jobTitle,
          department: DEPT_LABEL[r.department || "other"] || r.department || "Other",
          location: r.location || "",
          job_type: JOB_TYPE_LABEL[r.jobType || "full-time"] || r.jobType || "Full-time",
          apply_by_date: r.applyByDate || "",
          description: r.summary || stripHtml(r.descriptionHtml),
          description_html: r.descriptionHtml || "",
          requirements_html: r.requirementsHtml || "",
        };
      })
      .filter((j) => !j.apply_by_date || new Date(j.apply_by_date).getTime() >= today);

    const focusedSlug = (focused as { slug?: string; id?: string | number }).slug
      || String((focused as { id: string | number }).id);
    return <CareersClient jobs={jobs} expandSlug={focusedSlug} />;
  }

  // ─── Tenders ─────────────────────────────────────────────────────
  if (scope === "tenders" && key) {
    // tender refs and ids are both supported (the Studio link uses tenderRef
    // when present, falls back to id).
    let tender = await payload
      .findByID({ collection: "tenders", id: key, draft: true, depth: 1 })
      .catch(() => null);
    if (!tender) {
      const result = await payload.find({
        collection: "tenders",
        where: { tenderRef: { equals: key } },
        limit: 1,
        draft: true,
        depth: 1,
      });
      tender = (result.docs[0] as never) || null;
    }
    if (!tender) return notFound();
    const t = tender as {
      title?: string;
      tenderRef?: string;
      category?: string;
      closingDate?: string;
      descriptionHtml?: string;
    };
    const closingLabel = t.closingDate ? `Closes ${t.closingDate.slice(0, 10)}` : "";
    return <SimpleHtmlPreview
      kind="Tender"
      title={t.title || ""}
      meta={[t.tenderRef || "", t.category || "", closingLabel].filter(Boolean)}
      html={t.descriptionHtml || ""}
    />;
  }

  // ─── Blog ────────────────────────────────────────────────────────
  if (scope === "news" && key) {
    let post = await payload
      .findByID({ collection: "blog-posts", id: key, draft: true, depth: 1 })
      .catch(() => null);
    if (!post) {
      const result = await payload.find({
        collection: "blog-posts",
        where: { slug: { equals: key } },
        limit: 1,
        draft: true,
        depth: 1,
      });
      post = (result.docs[0] as never) || null;
    }
    if (!post) return notFound();
    const p = post as {
      title?: string;
      category?: string;
      publishDate?: string;
      bodyHtml?: string;
    };
    const publishLabel = p.publishDate
      ? new Date(p.publishDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : "";
    return <SimpleHtmlPreview
      kind="News"
      title={p.title || ""}
      meta={[p.category || "", publishLabel].filter(Boolean)}
      html={p.bodyHtml || ""}
    />;
  }

  // ─── Pages (default — also handles /preview/home) ────────────────
  const path = slug.length ? slug.join("/") : "home";
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: path } },
    limit: 1,
    draft: true,
    depth: 2,
  });
  const page = result.docs[0];
  if (!page) return notFound();

  return (
    <PreviewClient
      initialData={page as never}
      serverURL={process.env.NEXT_PUBLIC_SITE_URL || "https://dev.coopbank.co.tz"}
    />
  );
}

// Minimal single-record preview for tenders + blog posts. Jobs get a
// dedicated component so the Apply section and styling match careers.
function SimpleHtmlPreview({
  kind,
  title,
  meta,
  html,
}: {
  kind: string;
  title: string;
  meta: string[];
  html: string;
}) {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <p className="text-xs uppercase tracking-[0.12em] font-semibold text-[#1A8A3A] mb-3">{kind}</p>
      <h1 className="text-3xl md:text-4xl font-bold text-[#0F3D7A] leading-tight mb-3">{title}</h1>
      {meta.length > 0 && (
        <p className="text-sm text-gray-500 mb-8">{meta.join(" · ")}</p>
      )}
      {html ? (
        <div
          className="prose prose-lg max-w-none
                     prose-headings:text-[#0F3D7A]
                     prose-strong:text-[#0F3D7A]
                     prose-a:text-[#1A8A3A]
                     prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-1.5
                     prose-li:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-sm text-gray-400 italic">No content yet — write something in the Studio.</p>
      )}
    </article>
  );
}
