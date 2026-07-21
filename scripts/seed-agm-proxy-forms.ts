/**
 * One-off: upload the two AGM proxy form PDFs and attach them to the
 * "Notice of the Second AGM" press release (slug: notice-second-agm-2026).
 *
 * Idempotent on attachment label: re-running skips labels already present.
 *
 * Usage:
 *   npm run seed:agm-proxy-forms
 */
import { getPayload } from "payload";
import config from "../payload.config";
import fs from "node:fs";
import path from "node:path";

const SLUG = "notice-second-agm-2026";

const FORMS = [
  { label: "Proxy Form (English)", path: "/Users/jumbenylon/Downloads/PROXY  FORM (english).pdf" },
  { label: "Fomu ya Uwakilishi (Kiswahili)", path: "/Users/jumbenylon/Downloads/PROXY FORM (KISWAHILI).pdf" },
];

async function main() {
  const payload = await getPayload({ config });

  const found = await payload.find({
    collection: "press-releases",
    where: { slug: { equals: SLUG } },
    limit: 1,
  });
  const release = found.docs[0] as { id: string | number; headline: string; attachments?: { label?: string }[] } | undefined;
  if (!release) {
    console.error(`[agm-proxy-forms] no press-releases doc with slug "${SLUG}" — aborting`);
    process.exit(1);
  }

  const existingLabels = new Set(
    (release.attachments || []).map((a) => a.label).filter(Boolean)
  );

  const newAttachments: { label: string; file: string | number }[] = [];

  for (const form of FORMS) {
    if (existingLabels.has(form.label)) {
      console.log(`[agm-proxy-forms] skip "${form.label}" — already attached`);
      continue;
    }
    if (!fs.existsSync(form.path)) {
      console.error(`[agm-proxy-forms] file not found: ${form.path} — aborting`);
      process.exit(1);
    }
    const data = fs.readFileSync(form.path);
    const name = path.basename(form.path);
    const media = await payload.create({
      collection: "media",
      data: { alt: form.label },
      file: { data, mimetype: "application/pdf", name, size: data.length },
    });
    console.log(`[agm-proxy-forms] uploaded "${name}" as media #${media.id}`);
    newAttachments.push({ label: form.label, file: media.id });
  }

  if (newAttachments.length === 0) {
    console.log("[agm-proxy-forms] nothing to do — both forms already attached");
    return;
  }

  await payload.update({
    collection: "press-releases",
    id: release.id,
    data: {
      attachments: [...(release.attachments || []), ...newAttachments],
    },
  });
  console.log(`[agm-proxy-forms] attached ${newAttachments.length} form(s) to "${release.headline}"`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[agm-proxy-forms] failed:", e);
    process.exit(1);
  });
