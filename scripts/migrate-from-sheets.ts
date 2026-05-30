/**
 * Migrate content from the existing Google Sheet into Payload.
 *
 * Usage:
 *   npx tsx scripts/migrate-from-sheets.ts                # upsert by natural key
 *   npx tsx scripts/migrate-from-sheets.ts --clean        # wipe each collection first
 *   npx tsx scripts/migrate-from-sheets.ts --only forex   # one collection at a time
 *
 * Idempotent on natural keys where they exist:
 *   forex-rates  → currencyCode
 *   tenders      → tenderRef
 *   branches     → name
 *   blog-posts   → slug
 *   job-listings → (no natural key; uses jobTitle+applyByDate compound)
 */
// @next/env shim + dotenv are loaded via --require ./scripts/_bootstrap-payload.cjs
// (see the `migrate:sheets` npm script).
import { getPayload } from "payload";
import config from "../payload.config";
import {
  fetchSheet,
  fetchJobListings,
  fetchTenders,
  fetchBranches,
  fetchBlogPosts,
  bool,
  type ForexRate,
} from "../src/lib/sheets";

const argv = new Set(process.argv.slice(2));
const CLEAN = argv.has("--clean");
const ONLY = (() => {
  const i = process.argv.indexOf("--only");
  return i > -1 ? process.argv[i + 1] : null;
})();

const want = (slug: string) => !ONLY || ONLY === slug;

// ─── helpers ────────────────────────────────────────────────────────────────

/** Wrap a plain string as a minimal Lexical rich-text document. */
function textToLexical(text: string) {
  const lines = (text || "").split(/\n+/).filter(Boolean);
  if (lines.length === 0) {
    return {
      root: {
        type: "root",
        children: [
          { type: "paragraph", version: 1, children: [], format: "", indent: 0, direction: null as null },
        ],
        direction: null as null,
        format: "" as const,
        indent: 0,
        version: 1,
      },
    };
  }
  return {
    root: {
      type: "root",
      children: lines.map((t) => ({
        type: "paragraph",
        version: 1,
        format: "",
        indent: 0,
        direction: "ltr" as const,
        children: [{ type: "text", version: 1, text: t.trim(), format: 0, detail: 0, mode: "normal", style: "" }],
      })),
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
      version: 1,
    },
  };
}

/** Very rough HTML → Lexical paragraphs (just strips tags). Editors can re-format later. */
function htmlToLexical(html: string) {
  return textToLexical((html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

const slugify = (s: string) =>
  (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const stripRegion = (s: string) =>
  slugify((s || "").replace(/\s+region$/i, "").trim());

// ─── Forex ──────────────────────────────────────────────────────────────────

async function migrateForex(payload: Awaited<ReturnType<typeof getPayload>>) {
  const url = process.env.SHEET_FOREX_URL;
  if (!url) { console.log("[forex] SHEET_FOREX_URL missing — skipping"); return; }
  const rows = await fetchSheet<ForexRate>(url, 0, true, "forex");
  console.log(`[forex] ${rows.length} rows from sheet`);
  let created = 0, updated = 0, skipped = 0;

  if (CLEAN) {
    const existing = await payload.find({ collection: "forex-rates", limit: 1000 });
    for (const doc of existing.docs) await payload.delete({ collection: "forex-rates", id: doc.id });
  }

  for (const r of rows) {
    const code = (r.currency_code || "").toUpperCase().trim();
    if (!/^[A-Z]{3}$/.test(code)) { skipped++; continue; }
    const data = {
      currencyCode: code,
      currencyName: r.currency_name?.trim() || code,
      flagEmoji: r.flag_emoji?.trim() || "",
      buyRate: Number(r.buy_rate) || 0,
      sellRate: Number(r.sell_rate) || 0,
      trend: (["up", "down", "neutral"].includes(r.trend) ? r.trend : "neutral") as "up" | "down" | "neutral",
      updatedDate: r.updated_date || new Date().toISOString().slice(0, 10),
      active: bool(r.active),
    };
    const existing = await payload.find({ collection: "forex-rates", where: { currencyCode: { equals: code } }, limit: 1 });
    if (existing.docs[0]) {
      await payload.update({ collection: "forex-rates", id: existing.docs[0].id, data });
      updated++;
    } else {
      await payload.create({ collection: "forex-rates", data });
      created++;
    }
  }
  console.log(`[forex] created=${created} updated=${updated} skipped=${skipped}`);
}

// ─── Tenders ────────────────────────────────────────────────────────────────

async function migrateTenders(payload: Awaited<ReturnType<typeof getPayload>>) {
  const rows = await fetchTenders(true, true);
  console.log(`[tenders] ${rows.length} rows from sheet`);
  let created = 0, updated = 0, skipped = 0;

  if (CLEAN) {
    const existing = await payload.find({ collection: "tenders", limit: 1000, draft: true });
    for (const doc of existing.docs) await payload.delete({ collection: "tenders", id: doc.id });
  }

  const cats: Record<string, string> = {
    "it equipment": "it-equipment", "it services": "it-services",
    "construction": "construction", "services": "services",
    "goods": "goods", "consultancy": "consultancy",
  };
  const ctypes: Record<string, string> = {
    "supply": "supply", "supply & installation": "supply-install",
    "service contract": "service", "construction works": "construction",
    "consulting services": "consulting",
  };

  for (const r of rows) {
    const ref = r.tender_ref?.trim();
    if (!ref) { skipped++; continue; }
    const data = {
      tenderRef: ref,
      title: r.tender_title?.trim() || ref,
      category: (cats[r.category?.toLowerCase().trim()] || "goods") as
        "it-equipment" | "it-services" | "construction" | "services" | "goods" | "consultancy",
      contractType: ctypes[r.contract_type?.toLowerCase().trim()] as
        "supply" | "supply-install" | "service" | "construction" | "consulting" | undefined,
      publishedDate: r.published_date,
      closingDate: r.closing_date,
      description: textToLexical(r.description),
      _status: (r.status === "draft" ? "draft" : "published") as "draft" | "published",
    };
    const existing = await payload.find({
      collection: "tenders", where: { tenderRef: { equals: ref } }, limit: 1, draft: true,
    });
    if (existing.docs[0]) {
      await payload.update({ collection: "tenders", id: existing.docs[0].id, data });
      updated++;
    } else {
      await payload.create({ collection: "tenders", data });
      created++;
    }
  }
  console.log(`[tenders] created=${created} updated=${updated} skipped=${skipped}`);
}

// ─── Jobs ───────────────────────────────────────────────────────────────────

async function migrateJobs(payload: Awaited<ReturnType<typeof getPayload>>) {
  const rows = await fetchJobListings(true, true);
  console.log(`[jobs] ${rows.length} rows from sheet`);
  let created = 0, updated = 0, skipped = 0;

  if (CLEAN) {
    const existing = await payload.find({ collection: "job-listings", limit: 1000, draft: true });
    for (const doc of existing.docs) await payload.delete({ collection: "job-listings", id: doc.id });
  }

  const depts: Record<string, string> = {
    "technology": "technology", "ict security": "ict-security",
    "it & digital transformation": "it-digital", "operations": "operations",
    "credit": "credit", "marketing": "marketing", "treasury": "treasury",
    "human resources": "hr", "finance": "finance",
  };
  const jtypes: Record<string, string> = {
    "full-time": "full-time", "part-time": "part-time",
    "contract": "contract", "consultancy": "consultancy", "internship": "internship",
  };

  for (const r of rows) {
    const title = r.job_title?.trim();
    if (!title) { skipped++; continue; }
    const data = {
      jobTitle: title,
      department: (depts[r.department?.toLowerCase().trim()] || "other") as
        "technology" | "ict-security" | "it-digital" | "operations" | "credit" | "marketing"
        | "treasury" | "hr" | "finance" | "other",
      location: r.location?.trim() || "Head Office – Dodoma",
      jobType: (jtypes[r.job_type?.toLowerCase().trim()] || "full-time") as
        "full-time" | "part-time" | "contract" | "consultancy" | "internship",
      applyByDate: r.apply_by_date,
      summary: (r.description || "").slice(0, 200),
      description: textToLexical(r.description),
      requirements: textToLexical(r.requirements),
      applyEmail: "hr@cbtbank.co.tz",
      _status: (r.status === "draft" ? "draft" : "published") as "draft" | "published",
    };
    // Compound key: title + applyByDate
    const existing = await payload.find({
      collection: "job-listings",
      where: { and: [{ jobTitle: { equals: title } }, { applyByDate: { equals: r.apply_by_date } }] },
      limit: 1, draft: true,
    });
    if (existing.docs[0]) {
      await payload.update({ collection: "job-listings", id: existing.docs[0].id, data });
      updated++;
    } else {
      await payload.create({ collection: "job-listings", data });
      created++;
    }
  }
  console.log(`[jobs] created=${created} updated=${updated} skipped=${skipped}`);
}

// ─── Branches ───────────────────────────────────────────────────────────────

async function migrateBranches(payload: Awaited<ReturnType<typeof getPayload>>) {
  const rows = await fetchBranches(true, true);
  console.log(`[branches] ${rows.length} rows from sheet`);
  let created = 0, updated = 0, skipped = 0;

  if (CLEAN) {
    const existing = await payload.find({ collection: "branches", limit: 1000 });
    for (const doc of existing.docs) await payload.delete({ collection: "branches", id: doc.id });
  }

  const validRegions = new Set([
    "arusha", "dar-es-salaam", "dodoma", "kagera", "kilimanjaro",
    "mbeya", "mtwara", "mwanza", "tabora",
  ]);

  for (const r of rows) {
    const name = r.name?.trim();
    if (!name) { skipped++; continue; }
    const rawType = (r.type || "branch").toLowerCase().trim();
    const type = (rawType === "agency" ? "agency" : rawType === "sub-branch" ? "sub-branch"
                  : rawType === "atm" ? "atm" : "branch") as "branch" | "agency" | "sub-branch" | "atm";
    const regionSlug = stripRegion(r.region);
    const region = (validRegions.has(regionSlug) ? regionSlug : "other") as
      "arusha" | "dar-es-salaam" | "dodoma" | "kagera" | "kilimanjaro"
      | "mbeya" | "mtwara" | "mwanza" | "tabora" | "other";

    const data = {
      name,
      type,
      region,
      address: r.address?.trim() || "",
      phone: r.phone?.trim() || "",
      hoursWeekday: r.hours_weekday?.trim() || "8:30AM–4:00PM",
      hoursSaturday: r.hours_saturday?.trim() || "8:30AM–1:30PM",
      mapsUrl: r.maps_url?.trim() || "",
      isHq: bool(r.is_hq),
      comingSoon: bool(r.coming_soon),
      expectedOpening: r.expected_opening?.trim() || "",
      active: bool(r.active),
    };
    const existing = await payload.find({ collection: "branches", where: { name: { equals: name } }, limit: 1 });
    if (existing.docs[0]) {
      await payload.update({ collection: "branches", id: existing.docs[0].id, data });
      updated++;
    } else {
      await payload.create({ collection: "branches", data });
      created++;
    }
  }
  console.log(`[branches] created=${created} updated=${updated} skipped=${skipped}`);
}

// ─── Blog ───────────────────────────────────────────────────────────────────

async function migrateBlog(payload: Awaited<ReturnType<typeof getPayload>>) {
  const rows = await fetchBlogPosts(true, true);
  console.log(`[blog] ${rows.length} rows from sheet`);
  let created = 0, updated = 0, skipped = 0;

  if (CLEAN) {
    const existing = await payload.find({ collection: "blog-posts", limit: 1000, draft: true });
    for (const doc of existing.docs) await payload.delete({ collection: "blog-posts", id: doc.id });
  }

  const validCats = new Set(["news", "press", "literacy", "agm", "product", "insight"]);

  for (const r of rows) {
    const slug = (r.slug || slugify(r.title)).trim();
    const title = r.title?.trim();
    if (!slug || !title) { skipped++; continue; }
    const cat = (r.category || "news").toLowerCase().trim();
    const data = {
      title,
      slug,
      category: (validCats.has(cat) ? cat : "news") as
        "news" | "press" | "literacy" | "agm" | "product" | "insight",
      publishDate: r.publish_date,
      excerpt: r.excerpt?.trim() || "",
      body: htmlToLexical(r.body_html),
      tags: (r.tags || "").split(",").map((t) => t.trim()).filter(Boolean).map((tag) => ({ tag })),
      featured: bool(r.featured),
      readTimeMins: r.read_time_mins ? Number(r.read_time_mins) : undefined,
      _status: (r.status === "published" ? "published" : "draft") as "draft" | "published",
    };
    const existing = await payload.find({
      collection: "blog-posts", where: { slug: { equals: slug } }, limit: 1, draft: true,
    });
    if (existing.docs[0]) {
      await payload.update({ collection: "blog-posts", id: existing.docs[0].id, data });
      updated++;
    } else {
      await payload.create({ collection: "blog-posts", data });
      created++;
    }
  }
  console.log(`[blog] created=${created} updated=${updated} skipped=${skipped}`);
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Sheets → Payload migration (clean=${CLEAN}, only=${ONLY ?? "all"})`);
  const payload = await getPayload({ config });

  if (want("forex-rates")) await migrateForex(payload);
  if (want("tenders"))     await migrateTenders(payload);
  if (want("job-listings"))await migrateJobs(payload);
  if (want("branches"))    await migrateBranches(payload);
  if (want("blog-posts"))  await migrateBlog(payload);

  console.log("\n=== final document counts ===");
  for (const c of ["forex-rates", "tenders", "job-listings", "branches", "blog-posts"] as const) {
    if (!want(c)) continue;
    const r = await payload.find({ collection: c, limit: 0, draft: true });
    console.log(`${c.padEnd(14)} ${r.totalDocs}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
