import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { ReportForm } from "@/components/studio/reports/ReportForm";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ id: string }> };

export default async function ReportEditPage({ params }: Args) {
  await requireStudioUser();
  const { id } = await params;

  if (id === "new") {
    return (
      <ReportForm
        mode="create"
        initial={{
          title: "",
          year: new Date().getFullYear(),
          kind: "annual",
          publishedDate: new Date().toISOString().slice(0, 10),
          summary: "",
        }}
      />
    );
  }

  const payload = await getPayload({ config });
  const result = await payload.findByID({ collection: "annual-reports", id, depth: 1 });
  const r = result as unknown as Record<string, unknown>;
  type Doc = { id?: string | number; url?: string; filename?: string };
  type Photo = { id?: string | number; url?: string; alt?: string };

  return (
    <ReportForm
      mode="edit"
      initial={{
        id: r.id as string | number,
        title: (r.title as string) || "",
        year: r.year as number | undefined,
        kind: (r.kind as string) || "annual",
        publishedDate: ((r.publishedDate as string) || "").slice(0, 10),
        summary: (r.summary as string) || "",
        document: r.document as Doc | undefined,
        cover: r.cover as Photo | undefined,
      }}
    />
  );
}
