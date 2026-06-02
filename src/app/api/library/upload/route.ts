// Streams an uploaded file straight into gs://coopbank-media. Caller must
// be a signed-in Studio user.
import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { getStudioUser } from "@/lib/studio/auth";

export async function POST(req: Request) {
  const user = await getStudioUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }

  const bucket = process.env.GCS_BUCKET || "coopbank-media";
  const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID || "sakura-group-482908",
  });

  // Avoid name collisions: prefix a short timestamp on duplicate names.
  let name = file.name;
  const [exists] = await storage.bucket(bucket).file(name).exists();
  if (exists) {
    const dot = name.lastIndexOf(".");
    const stem = dot >= 0 ? name.slice(0, dot) : name;
    const ext = dot >= 0 ? name.slice(dot) : "";
    name = `${stem}-${Date.now().toString(36)}${ext}`;
  }

  const buf = Buffer.from(await file.arrayBuffer());
  await storage.bucket(bucket).file(name).save(buf, {
    contentType: file.type || "application/octet-stream",
  });

  return NextResponse.json({
    ok: true,
    name,
    url: `https://storage.googleapis.com/${bucket}/${encodeURIComponent(name)}`,
  });
}
