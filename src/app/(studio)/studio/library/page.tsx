import Link from "next/link";
import { ChevronRight, Images } from "lucide-react";
import { Storage } from "@google-cloud/storage";
import { requireStudioUser } from "@/lib/studio/auth";
import { LibraryGrid, type LibraryItem } from "@/components/studio/library/LibraryGrid";

export const dynamic = "force-dynamic";

// Plain mirror of gs://coopbank-media — list every object, allow upload + delete
// directly against the bucket. No Payload media collection involvement.
const BUCKET = process.env.GCS_BUCKET || "coopbank-media";
const PROJECT = process.env.GCS_PROJECT_ID || "sakura-group-482908";

async function listBucket(): Promise<LibraryItem[]> {
  try {
    const storage = new Storage({ projectId: PROJECT });
    const [files] = await storage.bucket(BUCKET).getFiles({ autoPaginate: false, maxResults: 1000 });
    return files
      .map((f) => ({
        name: f.name,
        size: Number(f.metadata.size) || 0,
        contentType: f.metadata.contentType || "application/octet-stream",
        updated: f.metadata.updated || "",
        publicUrl: `https://storage.googleapis.com/${BUCKET}/${encodeURIComponent(f.name)}`,
      }))
      .sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));
  } catch (e) {
    console.error("listBucket failed:", e);
    return [];
  }
}

export default async function LibraryPage() {
  await requireStudioUser();
  const items = await listBucket();
  const images = items.filter((i) => i.contentType.startsWith("image/"));
  const docs = items.filter((i) => !i.contentType.startsWith("image/"));

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Media library</span>
      </div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
            <Images className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-studio-ink">Media library</h1>
            <p className="text-sm text-studio-ink-3 mt-1">
              {images.length} image{images.length === 1 ? "" : "s"} · {docs.length} doc{docs.length === 1 ? "" : "s"} · live mirror of <span className="font-mono">gs://{BUCKET}</span>
            </p>
          </div>
        </div>
      </div>
      <LibraryGrid items={items} bucket={BUCKET} />
    </div>
  );
}
