import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!process.env.ADMIN_PASSWORD || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/");
  revalidatePath("/branches");
  revalidatePath("/careers");
  revalidatePath("/tenders");
  revalidatePath("/news");

  return NextResponse.json({ ok: true, synced_at: new Date().toISOString() });
}
