import { google } from "googleapis";

const SPREADSHEET_ID = "14ufHtk9tmsAs9GsmOL50bVNgF7TS8xtyM18hF8sfKjU";

function getSheets() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not configured");
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(raw),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// ── Generic helpers ──────────────────────────────────────────────────────────

async function getRows(tab: string): Promise<string[][]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tab}!A:Z`,
  });
  return (res.data.values as string[][]) ?? [];
}

async function appendRow(tab: string, values: string[]): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tab}!A:A`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

async function updateRow(tab: string, rowIndex: number, values: string[]): Promise<void> {
  const sheets = getSheets();
  const colLetter = String.fromCharCode(64 + values.length); // A=65
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tab}!A${rowIndex}:${colLetter}${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

async function deleteRow(tab: string, rowIndex: number): Promise<void> {
  const sheets = getSheets();
  // Get sheet GID first
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = meta.data.sheets?.find(s => s.properties?.title === tab);
  if (!sheet?.properties?.sheetId) throw new Error(`Sheet tab "${tab}" not found`);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheet.properties.sheetId,
            dimension: "ROWS",
            startIndex: rowIndex - 1, // 0-based
            endIndex: rowIndex,       // exclusive
          },
        },
      }],
    },
  });
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

const JOB_COLS = ["job_title","department","location","job_type","apply_by_date","description","requirements","status"];

export interface JobPayload {
  job_title: string;
  department: string;
  location: string;
  job_type: string;
  apply_by_date: string;
  description: string;
  requirements: string;
  status: string;
  [key: string]: string;
}

export async function createJob(payload: JobPayload): Promise<void> {
  await appendRow("job_listings", JOB_COLS.map(k => (payload as Record<string,string>)[k] ?? ""));
}

export async function updateJob(originalTitle: string, payload: JobPayload): Promise<void> {
  const rows = await getRows("job_listings");
  const idx = rows.findIndex(r => r[0] === originalTitle);
  if (idx < 1) throw new Error("Job not found");
  await updateRow("job_listings", idx + 1, JOB_COLS.map(k => (payload as Record<string,string>)[k] ?? ""));
}

export async function deleteJob(title: string): Promise<void> {
  const rows = await getRows("job_listings");
  const idx = rows.findIndex(r => r[0] === title);
  if (idx < 1) throw new Error("Job not found");
  await deleteRow("job_listings", idx + 1);
}

// ── Tenders ──────────────────────────────────────────────────────────────────

const TENDER_COLS = ["tender_ref","tender_title","category","contract_type","published_date","closing_date","description","document_url","status"];

export interface TenderPayload {
  tender_ref: string;
  tender_title: string;
  category: string;
  contract_type: string;
  published_date: string;
  closing_date: string;
  description: string;
  document_url: string;
  status: string;
  [key: string]: string;
}

export async function createTender(payload: TenderPayload): Promise<void> {
  await appendRow("tenders", TENDER_COLS.map(k => (payload as Record<string,string>)[k] ?? ""));
}

export async function updateTender(originalRef: string, payload: TenderPayload): Promise<void> {
  const rows = await getRows("tenders");
  const idx = rows.findIndex(r => r[0] === originalRef);
  if (idx < 1) throw new Error("Tender not found");
  await updateRow("tenders", idx + 1, TENDER_COLS.map(k => (payload as Record<string,string>)[k] ?? ""));
}

export async function deleteTender(ref: string): Promise<void> {
  const rows = await getRows("tenders");
  const idx = rows.findIndex(r => r[0] === ref);
  if (idx < 1) throw new Error("Tender not found");
  await deleteRow("tenders", idx + 1);
}

// ── Blog Posts ───────────────────────────────────────────────────────────────

const BLOG_COLS = ["slug","title","category","author","publish_date","excerpt","body_html","cover_image_url","tags","featured","status","read_time_mins"];

export interface BlogPayload {
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
  [key: string]: string;
}

export async function createBlogPost(payload: BlogPayload): Promise<void> {
  await appendRow("blog_posts", BLOG_COLS.map(k => (payload as Record<string,string>)[k] ?? ""));
}

export async function updateBlogPost(originalSlug: string, payload: BlogPayload): Promise<void> {
  const rows = await getRows("blog_posts");
  const idx = rows.findIndex(r => r[0] === originalSlug);
  if (idx < 1) throw new Error("Post not found");
  await updateRow("blog_posts", idx + 1, BLOG_COLS.map(k => (payload as Record<string,string>)[k] ?? ""));
}

export async function deleteBlogPost(slug: string): Promise<void> {
  const rows = await getRows("blog_posts");
  const idx = rows.findIndex(r => r[0] === slug);
  if (idx < 1) throw new Error("Post not found");
  await deleteRow("blog_posts", idx + 1);
}
