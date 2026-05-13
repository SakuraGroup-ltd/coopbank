import Papa from "papaparse";

// ── Generic fetcher ───────────────────────────────────────────────────────────

export async function fetchSheet<T>(url: string, ttl = 300, noCache = false, tag?: string): Promise<T[]> {
  try {
    const res = await fetch(url, noCache
      ? { cache: "no-store" }
      : { next: { revalidate: ttl, tags: tag ? [tag, "sheets"] : ["sheets"] } });
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    const csv = await res.text();

    // Strip leading banner rows (Google Sheets title/instruction rows where only the
    // first cell is non-empty). The real header row has values in multiple columns.
    const lines = csv.trim().split("\n");
    let headerLineIdx = 0;
    for (let i = 0; i < Math.min(6, lines.length); i++) {
      const nonEmpty = lines[i].split(",").filter(c => c.replace(/"/g, "").trim()).length;
      if (nonEmpty > 1) { headerLineIdx = i; break; }
    }
    const cleanedCsv = lines.slice(headerLineIdx).join("\n");

    const { data, errors } = Papa.parse<T>(cleanedCsv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => {
        // Some sheets merge the title cell into column A of the header row —
        // the real column name appears as the last whitespace-separated token.
        const parts = h.trim().split(/\s+/);
        const last = parts[parts.length - 1].toLowerCase();
        if (parts.length > 1 && /^[a-z][a-z0-9_]*$/.test(last)) return last;
        return h.trim().toLowerCase().replace(/\s+/g, "_");
      },
      transform: (v) => v.trim(),
    });
    if (errors.length) console.warn("[sheets] Parse warnings:", errors.slice(0, 3));
    // Strip instruction/note rows (first column starts with ℹ or is empty)
    return (data as Record<string, string>[]).filter((row) => {
      const first = Object.values(row)[0] || "";
      return first && !first.startsWith("ℹ") && !first.startsWith("#");
    }) as T[];
  } catch (err) {
    console.error("[sheets] fetchSheet error:", err);
    return [];
  }
}

// ── Type definitions ──────────────────────────────────────────────────────────

export interface ForexRate {
  currency_code: string;
  currency_name: string;
  flag_emoji: string;
  buy_rate: string;
  sell_rate: string;
  trend: string;
  updated_date: string;
  active: string;
}

export interface JobListing {
  job_title: string;
  department: string;
  location: string;
  job_type: string;
  apply_by_date: string;
  description: string;
  requirements: string;
  status: string;
}

export interface Tender {
  tender_ref: string;
  tender_title: string;
  category: string;
  contract_type: string;
  published_date: string;
  closing_date: string;
  description: string;
  document_url: string;
  status: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  author: string;
  publish_date: string;
  excerpt: string;
  body_html: string;
  cover_image_url: string;
  tags: string;
  featured: string;
  status: string;
  read_time_mins: string;
}

export interface Faq {
  question: string;
  answer: string;
  category: string;
  order: string;
  active: string;
}

export interface Branch {
  name: string;
  type: string;
  region: string;
  address: string;
  phone: string;
  hours_weekday: string;
  hours_saturday: string;
  maps_url: string;
  is_hq: string;
  coming_soon: string;
  expected_opening: string;
  active: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export const bool = (v: string) => v?.toLowerCase() === "true";

export const isTenderOpen = (t: Tender) => {
  if (t.status === "closed" || t.status === "draft") return false;
  if (!t.closing_date) return t.status === "open";
  return new Date(t.closing_date) >= new Date(new Date().toDateString());
};

// ── Typed fetch functions ─────────────────────────────────────────────────────

export async function fetchForexRates(noCache = false): Promise<ForexRate[]> {
  const url = process.env.SHEET_FOREX_URL;
  if (!url) return [];
  const rows = await fetchSheet<ForexRate>(url, 300, noCache, "forex");
  return rows.filter((r) => bool(r.active));
}

export async function fetchJobListings(includeAll = false, noCache = false): Promise<JobListing[]> {
  const url = process.env.SHEET_JOBS_URL;
  if (!url) return [];
  const rows = await fetchSheet<JobListing>(url, 600, noCache, "jobs");
  return includeAll ? rows : rows.filter((r) => r.status === "open");
}

export async function fetchTenders(includeAll = false, noCache = false): Promise<Tender[]> {
  const url = process.env.SHEET_TENDERS_URL;
  if (!url) return [];
  const rows = await fetchSheet<Tender>(url, 600, noCache, "tenders");
  return includeAll ? rows : rows.filter((r) => r.status !== "draft");
}

export async function fetchBlogPosts(includeAll = false, noCache = false): Promise<BlogPost[]> {
  const url = process.env.SHEET_BLOG_URL;
  if (!url) return [];
  const today = new Date().toISOString().split("T")[0];
  const raw = await fetchSheet<Record<string, string>>(url, 300, noCache, "blog");
  // Fix sheet typo: "tittle" → "title"
  const rows = raw.map(r => ({ ...r, title: r.title ?? r["tittle"] ?? "" })) as unknown as BlogPost[];
  const all = rows.filter((p) => p.slug && p.title);
  if (includeAll) return all.sort((a, b) => b.publish_date.localeCompare(a.publish_date));
  return all
    .filter((p) => p.status === "published" && p.publish_date <= today)
    .sort((a, b) => {
      if (a.featured === "TRUE" && b.featured !== "TRUE") return -1;
      if (b.featured === "TRUE" && a.featured !== "TRUE") return 1;
      return b.publish_date.localeCompare(a.publish_date);
    });
}

export async function fetchBranches(includeAll = false, noCache = false): Promise<Branch[]> {
  const url = process.env.SHEET_BRANCHES_URL;
  if (!url) return [];
  const rows = await fetchSheet<Branch>(url, 3600, noCache, "branches");
  return includeAll ? rows : rows.filter((r) => bool(r.active));
}

// Starter FAQs used when the sheet tab is missing or empty. Marketing can override
// per row by adding a `faqs` tab to the master sheet and setting SHEET_FAQS_URL.
const FALLBACK_FAQS: Faq[] = [
  {
    question: "How do I open an account with Cooperative Bank?",
    answer:
      "You can open an account instantly through the CoopEsa mobile app (Android & iOS) without visiting a branch, or walk into any of our branches in Dodoma, Mtwara, Tabora, or Moshi with your National ID/Passport and one passport-sized photo.",
    category: "Accounts",
    order: "1",
    active: "TRUE",
  },
  {
    question: "What is the USSD code for mobile banking?",
    answer:
      "Dial *150*84# from any registered phone number to access balance checks, mini-statements, transfers, airtime top-up, and bill payments — works on all networks, no internet required.",
    category: "Digital Banking",
    order: "2",
    active: "TRUE",
  },
  {
    question: "Am I eligible for a loan?",
    answer:
      "Loan eligibility depends on the product. Salaried Loans require 6 months of consistent payroll; SME and Agri-Business loans require business records and collateral. Use our online Loan Calculator or visit a branch for a tailored assessment.",
    category: "Loans",
    order: "3",
    active: "TRUE",
  },
  {
    question: "What do I do if I lose my Visa card?",
    answer:
      "Call our 24/7 hotline +255 27 275 4470 immediately to block the card, or freeze it yourself in seconds via the CoopEsa app under Cards → Manage. Visit any branch to request a replacement.",
    category: "Cards",
    order: "4",
    active: "TRUE",
  },
  {
    question: "What are your branch operating hours?",
    answer:
      "All branches: Monday to Friday 8:30 AM – 4:00 PM, Saturdays 8:30 AM – 1:30 PM. Closed on Sundays and public holidays. CoopEsa, USSD, and ATM services are available 24/7.",
    category: "Branches",
    order: "5",
    active: "TRUE",
  },
];

export async function fetchFaqs(includeAll = false, noCache = false): Promise<Faq[]> {
  const url = process.env.SHEET_FAQS_URL;
  if (!url) return FALLBACK_FAQS;
  const rows = await fetchSheet<Faq>(url, 600, noCache, "faqs");
  const filtered = includeAll ? rows : rows.filter((r) => bool(r.active));
  if (filtered.length === 0) return FALLBACK_FAQS;
  return filtered.sort((a, b) => (parseInt(a.order || "999") - parseInt(b.order || "999")));
}
