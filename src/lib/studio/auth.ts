// Studio session helper. Reads the payload-token cookie that Payload sets
// after a successful POST to /api/users/login, validates it against the
// `me` endpoint, and returns the authenticated user (or null).
// We use the local Payload API for the validate step so there's no HTTP
// roundtrip — server component → DB directly.
import { cookies } from "next/headers";
import { getPayload } from "payload";
import config from "../../../payload.config";

export type StudioUser = {
  id: string | number;
  name?: string;
  email: string;
  role?: string;
  departments?: string[];
};

export async function getStudioUser(): Promise<StudioUser | null> {
  const jar = await cookies();
  const token = jar.get("payload-token")?.value;
  if (!token) return null;

  try {
    const payload = await getPayload({ config });
    // Verify the token + load the user via Payload's auth strategy.
    const result = await payload.auth({
      headers: new Headers({ Authorization: `JWT ${token}` }),
    });
    const u = result?.user;
    if (!u || u.collection !== "users") return null;
    return {
      id: u.id,
      name: (u as { name?: string }).name,
      email: u.email || "",
      role: (u as { role?: string }).role,
      departments: (u as { departments?: string[] }).departments,
    };
  } catch {
    return null;
  }
}

export async function requireStudioUser(): Promise<StudioUser> {
  const u = await getStudioUser();
  if (!u) {
    // Server component context — redirect.
    const { redirect } = await import("next/navigation");
    redirect("/studio/login");
  }
  return u as StudioUser;
}
