import Papa from "papaparse";

// ── Generic fetcher ───────────────────────────────────────────────────────────

export async function fetchSheet<T>(url: string, ttl = 300, noCache = false): Promise<T[]> {
  try {
    const res = await fetch(url, noCache ? { cache: "no-store" } : { next: { revalidate: ttl } });
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    const csv = await res.text();
    const { data, errors } = Papa.parse<T>(csv, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
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
  const rows = await fetchSheet<ForexRate>(url, 300, noCache);
  return rows.filter((r) => bool(r.active));
}

export async function fetchJobListings(includeAll = false, noCache = false): Promise<JobListing[]> {
  const url = process.env.SHEET_JOBS_URL;
  if (!url) return [];
  const rows = await fetchSheet<JobListing>(url, 600, noCache);
  return includeAll ? rows : rows.filter((r) => r.status === "open");
}

export async function fetchTenders(includeAll = false, noCache = false): Promise<Tender[]> {
  const url = process.env.SHEET_TENDERS_URL;
  if (!url) return [];
  const rows = await fetchSheet<Tender>(url, 600, noCache);
  return includeAll ? rows : rows.filter((r) => r.status !== "draft");
}

export async function fetchBranches(includeAll = false, noCache = false): Promise<Branch[]> {
  const url = process.env.SHEET_BRANCHES_URL;
  if (!url) return [];
  const rows = await fetchSheet<Branch>(url, 3600, noCache);
  return includeAll ? rows : rows.filter((r) => bool(r.active));
}
