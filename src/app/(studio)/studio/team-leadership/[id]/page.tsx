import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { LeadershipForm, type LeadershipDraft } from "@/components/studio/leadership/LeadershipForm";

export const dynamic = "force-dynamic";

const EMPTY: LeadershipDraft = {
  name: "",
  title: "",
  category: "executive",
  bio: "",
  email: "",
  linkedin: "",
  sortOrder: 100,
  active: true,
};

export default async function LeadershipDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireStudioUser();
  const { id } = await params;
  if (id === "new") return <LeadershipForm mode="create" initial={EMPTY} />;
  const payload = await getPayload({ config });
  const doc = await payload.findByID({ collection: "leadership-team", id, depth: 1 }).catch(() => null);
  if (!doc) return <LeadershipForm mode="create" initial={EMPTY} />;
  const d = doc as Record<string, unknown>;
  const photo = d.photo as { id?: number; url?: string } | null;
  const initial: LeadershipDraft = {
    id: d.id as number,
    name: (d.name as string) || "",
    title: (d.title as string) || "",
    category: (d.category as LeadershipDraft["category"]) || "executive",
    photo: photo?.id && photo?.url ? { id: photo.id, url: photo.url } : undefined,
    bio: (d.bio as string) || "",
    email: (d.email as string) || "",
    linkedin: (d.linkedin as string) || "",
    sortOrder: (d.sortOrder as number) ?? 100,
    active: d.active !== false,
  };
  return <LeadershipForm mode="edit" initial={initial} />;
}
