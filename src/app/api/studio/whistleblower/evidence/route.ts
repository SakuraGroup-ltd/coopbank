// Streams whistleblower evidence from the PRIVATE bucket to authenticated
// Compliance/Admin Studio users only. The evidence object is never public;
// this proxy is the sole read path. No signed URLs (avoids SA signing setup).
import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { getStudioUser } from "@/lib/studio/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ROLES = new Set(["master_admin", "admin", "compliance"]);

export async function GET(req: Request) {
  const user = await getStudioUser();
  if (!user || !ALLOWED_ROLES.has(user.role ?? "")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const bucket = process.env.WHISTLEBLOWER_BUCKET || "coopbank-whistleblower";
  const path = new URL(req.url).searchParams.get("path") ?? "";

  // Accept gs://<bucket>/<object> or a bare object key; only this bucket is allowed.
  let objectName = path;
  const m = path.match(/^gs:\/\/([^/]+)\/(.+)$/);
  if (m) {
    if (m[1] !== bucket) return NextResponse.json({ error: "invalid bucket" }, { status: 400 });
    objectName = m[2];
  }
  if (!objectName || objectName.includes("..")) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }

  try {
    const storage = new Storage({ projectId: process.env.GCS_PROJECT_ID || "sakura-group-482908" });
    const fileRef = storage.bucket(bucket).file(objectName);
    const [exists] = await fileRef.exists();
    if (!exists) return NextResponse.json({ error: "not found" }, { status: 404 });

    const [meta] = await fileRef.getMetadata();
    const [buf] = await fileRef.download();
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": String(meta.contentType || "application/octet-stream"),
        "Content-Disposition": `inline; filename="${objectName.split("/").pop() ?? "evidence"}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
