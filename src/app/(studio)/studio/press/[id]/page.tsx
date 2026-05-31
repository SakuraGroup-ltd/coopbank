import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { PressComposer } from "@/components/studio/press/PressComposer";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ id: string }> };

export default async function PressEditPage({ params }: Args) {
  await requireStudioUser();
  const { id } = await params;

  if (id === "new") {
    return (
      <PressComposer
        mode="create"
        initial={{
          headline: "",
          slug: "",
          category: "corporate",
          releaseDate: new Date().toISOString().slice(0, 10),
          summary: "",
          bodyHtml: "",
        }}
      />
    );
  }

  const payload = await getPayload({ config });
  const result = await payload.findByID({ collection: "press-releases", id, depth: 1, draft: true });
  const r = result as unknown as Record<string, unknown>;

  return (
    <PressComposer
      mode="edit"
      initial={{
        id: r.id as string | number,
        headline: (r.headline as string) || "",
        slug: (r.slug as string) || "",
        category: (r.category as string) || "corporate",
        releaseDate: ((r.releaseDate as string) || "").slice(0, 10),
        summary: (r.summary as string) || "",
        bodyHtml: (r.bodyHtml as string) || "",
        document: r.document as { id?: string | number; url?: string; filename?: string } | undefined,
        status: r._status as "draft" | "published" | undefined,
      }}
    />
  );
}
