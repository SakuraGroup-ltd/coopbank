// Delete an object from gs://coopbank-media. Caller must be a signed-in
// Studio user.
import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { getStudioUser } from "@/lib/studio/auth";

export async function DELETE(req: Request) {
  const user = await getStudioUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const name = url.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "missing name" }, { status: 400 });

  const bucket = process.env.GCS_BUCKET || "coopbank-media";
  const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID || "sakura-group-482908",
  });

  try {
    await storage.bucket(bucket).file(name).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
