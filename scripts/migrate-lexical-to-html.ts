// One-time migration: walk every blog-post, job-listing and tender row,
// take the legacy Lexical `body` / `description` / `requirements` JSON,
// render it as HTML, and write the result into the corresponding
// `*Html` column that the Studio editor reads. After this runs, opening
// any existing record in the Studio shows the actual published content
// instead of an empty editor.
//
// Idempotent — skips rows where the HTML field is already populated.

import { getPayload } from "payload";
import config from "../payload.config";

type LexicalNode = {
  type: string;
  tag?: string;
  listType?: string;
  format?: number;
  text?: string;
  url?: string;
  fields?: { url?: string };
  children?: LexicalNode[];
};

type LexicalDoc = { root?: LexicalNode } | string | null | undefined;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Lexical text format flags (powers of 2).
const F_BOLD = 1, F_ITALIC = 2, F_STRIKE = 4, F_UNDERLINE = 8, F_CODE = 16, F_SUB = 32, F_SUP = 64;

function nodeToHtml(node: LexicalNode | undefined): string {
  if (!node) return "";

  if (node.type === "text") {
    let text = escapeHtml(node.text || "");
    const f = node.format || 0;
    if (f & F_CODE) text = `<code>${text}</code>`;
    if (f & F_STRIKE) text = `<s>${text}</s>`;
    if (f & F_UNDERLINE) text = `<u>${text}</u>`;
    if (f & F_ITALIC) text = `<em>${text}</em>`;
    if (f & F_BOLD) text = `<strong>${text}</strong>`;
    if (f & F_SUB) text = `<sub>${text}</sub>`;
    if (f & F_SUP) text = `<sup>${text}</sup>`;
    return text;
  }

  const children = (node.children || []).map(nodeToHtml).join("");

  switch (node.type) {
    case "paragraph":
      return `<p>${children || "&nbsp;"}</p>`;
    case "heading": {
      const tag = node.tag || "h2";
      return `<${tag}>${children}</${tag}>`;
    }
    case "list": {
      const tag = node.listType === "number" ? "ol" : "ul";
      return `<${tag}>${children}</${tag}>`;
    }
    case "listitem":
      return `<li>${children}</li>`;
    case "link":
    case "autolink": {
      const url = node.fields?.url || node.url || "#";
      return `<a href="${escapeHtml(url)}">${children}</a>`;
    }
    case "quote":
      return `<blockquote>${children}</blockquote>`;
    case "linebreak":
      return "<br>";
    case "horizontalrule":
      return "<hr>";
    case "root":
      return children;
    default:
      return children;
  }
}

function lexicalToHtml(value: LexicalDoc): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.root) {
    return nodeToHtml(value.root);
  }
  return "";
}

async function main() {
  const payload = await getPayload({ config });

  // ─── Blog posts ────────────────────────────────────────────────
  const blog = await payload.find({
    collection: "blog-posts",
    limit: 1000,
    depth: 0,
    draft: true,
  });
  let bMigrated = 0;
  for (const p of blog.docs) {
    const row = p as unknown as { id: string | number; body?: LexicalDoc; bodyHtml?: string };
    if (row.bodyHtml) continue;
    const html = lexicalToHtml(row.body);
    if (!html) continue;
    await payload.update({
      collection: "blog-posts",
      id: row.id,
      data: { bodyHtml: html } as never,
    });
    bMigrated++;
    console.log(`  ✓ blog-posts/${row.id}  (${html.length} chars)`);
  }
  console.log(`blog-posts migrated: ${bMigrated}/${blog.docs.length}\n`);

  // ─── Job listings ──────────────────────────────────────────────
  const jobs = await payload.find({
    collection: "job-listings",
    limit: 1000,
    depth: 0,
    draft: true,
  });
  let jMigrated = 0;
  for (const j of jobs.docs) {
    const row = j as unknown as {
      id: string | number;
      description?: LexicalDoc;
      requirements?: LexicalDoc;
      descriptionHtml?: string;
      requirementsHtml?: string;
    };
    const data: Record<string, string> = {};
    if (!row.descriptionHtml) {
      const html = lexicalToHtml(row.description);
      if (html) data.descriptionHtml = html;
    }
    if (!row.requirementsHtml) {
      const html = lexicalToHtml(row.requirements);
      if (html) data.requirementsHtml = html;
    }
    if (Object.keys(data).length > 0) {
      await payload.update({
        collection: "job-listings",
        id: row.id,
        data: data as never,
      });
      jMigrated++;
      const desc = data.descriptionHtml ? `${data.descriptionHtml.length}d ` : "";
      const req = data.requirementsHtml ? `${data.requirementsHtml.length}r ` : "";
      console.log(`  ✓ job-listings/${row.id}  ${desc}${req}`);
    }
  }
  console.log(`job-listings migrated: ${jMigrated}/${jobs.docs.length}\n`);

  // ─── Tenders ───────────────────────────────────────────────────
  const tenders = await payload.find({
    collection: "tenders",
    limit: 1000,
    depth: 0,
    draft: true,
  });
  let tMigrated = 0;
  for (const t of tenders.docs) {
    const row = t as unknown as {
      id: string | number;
      description?: LexicalDoc;
      descriptionHtml?: string;
    };
    if (row.descriptionHtml) continue;
    const html = lexicalToHtml(row.description);
    if (!html) continue;
    await payload.update({
      collection: "tenders",
      id: row.id,
      data: { descriptionHtml: html } as never,
    });
    tMigrated++;
    console.log(`  ✓ tenders/${row.id}  (${html.length} chars)`);
  }
  console.log(`tenders migrated: ${tMigrated}/${tenders.docs.length}\n`);

  console.log("done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
