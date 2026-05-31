// Studio logout — clears Payload's auth cookie and bounces to /studio/login.
// Calls Payload's own logout endpoint so the session is invalidated server-
// side too, not just on the client.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const jar = await cookies();
  const token = jar.get("payload-token")?.value;
  // Fire-and-forget call to Payload — best effort, we still clear the cookie
  // even if this fails so the user isn't stuck.
  if (token) {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3199"}/api/users/logout`, {
      method: "POST",
      headers: { Authorization: `JWT ${token}` },
    }).catch(() => {});
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("payload-token");
  return res;
}
