/**
 * Seed Media + Pages from the existing repo, so the admin shows real content
 * instead of an empty skeleton.
 *
 * Media:   walks public/images/, uploads each file as a Media doc.
 *          Skips .DS_Store; alt is humanised from the filename.
 *          Idempotent on filename — re-running won't duplicate.
 *
 * Pages:   walks src/app/(main)/&#42;&#42;/page.tsx, creates a Page stub per route.
 *          Title from the last path segment, slug from the path,
 *          layout = a single rich-text block with a placeholder so editors
 *          can replace it with real blocks.
 *
 * Usage:
 *   npm run seed:assets                # both
 *   npm run seed:assets -- --only media
 *   npm run seed:assets -- --only pages
 */
import { getPayload } from "payload";
import config from "../payload.config";
import fs from "node:fs";
import path from "node:path";

const argv = new Set(process.argv.slice(2));
const ONLY = (() => {
  const i = process.argv.indexOf("--only");
  return i > -1 ? process.argv[i + 1] : null;
})();
const want = (k: string) => !ONLY || ONLY === k;

const repoRoot = path.resolve(__dirname, "..");

// ─── helpers ──────────────────────────────────────────────────────────

function humanise(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function lexicalParagraph(text: string) {
  return {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          version: 1,
          format: "" as const,
          indent: 0,
          direction: "ltr" as const,
          children: [
            { type: "text", version: 1, text, format: 0, detail: 0, mode: "normal", style: "" },
          ],
        },
      ],
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
      version: 1,
    },
  };
}

function mimeFromExt(ext: string): string {
  const e = ext.toLowerCase().replace(/^\./, "");
  if (e === "jpg" || e === "jpeg") return "image/jpeg";
  if (e === "png") return "image/png";
  if (e === "webp") return "image/webp";
  if (e === "gif") return "image/gif";
  if (e === "svg") return "image/svg+xml";
  if (e === "pdf") return "application/pdf";
  return "application/octet-stream";
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// ─── Media ────────────────────────────────────────────────────────────

async function seedMedia(payload: Awaited<ReturnType<typeof getPayload>>) {
  const root = path.join(repoRoot, "public", "images");
  if (!fs.existsSync(root)) {
    console.log("[media] public/images not found — skipping");
    return;
  }
  const files = walk(root);
  console.log(`[media] found ${files.length} files in public/images`);

  let created = 0, skipped = 0, failed = 0;
  for (const file of files) {
    const name = path.basename(file);
    const ext = path.extname(name);
    const mimetype = mimeFromExt(ext);
    if (!/^(image\/|application\/pdf)/.test(mimetype)) { skipped++; continue; }

    // idempotency: skip if a doc with this filename already exists
    const existing = await payload.find({
      collection: "media",
      where: { filename: { equals: name } },
      limit: 1,
    });
    if (existing.docs[0]) { skipped++; continue; }

    try {
      const data = fs.readFileSync(file);
      const alt = humanise(name);
      const subfolder = path.relative(root, path.dirname(file));
      await payload.create({
        collection: "media",
        data: {
          alt,
          caption: subfolder ? `From /images/${subfolder}` : "",
        },
        file: { data, mimetype, name, size: data.length },
      });
      created++;
    } catch (e) {
      failed++;
      console.error(`[media] failed ${name}:`, (e as Error).message);
    }
  }
  console.log(`[media] created=${created} skipped(existing or non-image)=${skipped} failed=${failed}`);
}

// ─── Pages ────────────────────────────────────────────────────────────

async function seedPages(payload: Awaited<ReturnType<typeof getPayload>>) {
  const root = path.join(repoRoot, "src", "app", "(main)");
  if (!fs.existsSync(root)) {
    console.log("[pages] src/app/(main) not found — skipping");
    return;
  }

  // Find every page.tsx and derive a slug from its relative dir
  const pageFiles = walk(root).filter((f) => path.basename(f) === "page.tsx");
  console.log(`[pages] found ${pageFiles.length} hand-coded pages`);

  let created = 0, skipped = 0, failed = 0;
  for (const file of pageFiles) {
    const rel = path.relative(root, path.dirname(file));
    // (main)/page.tsx → empty rel → slug 'home'
    const slug = rel === "" ? "home" : rel.replace(/\//g, "-").replace(/\[|\]/g, "");
    const lastSegment = rel === "" ? "home" : rel.split("/").pop()!.replace(/\[|\]/g, "");
    const title = humanise(lastSegment) || "Home";

    const existing = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
      draft: true,
    });
    if (existing.docs[0]) { skipped++; continue; }

    try {
      await payload.create({
        collection: "pages",
        data: {
          title,
          slug,
          seo: { metaTitle: title, metaDescription: "" },
          layout: [
            {
              blockType: "rich-text",
              width: "narrow",
              content: lexicalParagraph(
                `Placeholder for ${title}. This page exists at /${rel || ""} on the live site and is currently hand-coded. Replace this block with the real content using the block library on the right.`
              ),
            },
          ],
        },
        // create as draft so they don't accidentally publish placeholder text
        draft: true,
      });
      created++;
    } catch (e) {
      failed++;
      console.error(`[pages] failed ${slug}:`, (e as Error).message);
    }
  }
  console.log(`[pages] created=${created} skipped(existing)=${skipped} failed=${failed}`);
}

// ─── main ─────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding assets (only=${ONLY ?? "all"})`);
  const payload = await getPayload({ config });

  if (want("media")) await seedMedia(payload);
  if (want("pages")) await seedPages(payload);

  console.log("\n=== final counts ===");
  for (const c of ["media", "pages"] as const) {
    const r = await payload.find({ collection: c, limit: 0, draft: true });
    console.log(`${c.padEnd(8)} ${r.totalDocs}`);
  }
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
