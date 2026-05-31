import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { FaqForm } from "@/components/studio/faqs/FaqForm";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ id: string }> };

export default async function FaqEditPage({ params }: Args) {
  await requireStudioUser();
  const { id } = await params;

  if (id === "new") {
    return (
      <FaqForm
        mode="create"
        initial={{
          question: "",
          answerHtml: "",
          category: "general",
          sortOrder: 100,
          active: true,
        }}
      />
    );
  }

  const payload = await getPayload({ config });
  const result = await payload.findByID({ collection: "faqs", id, depth: 0 });
  const f = result as unknown as Record<string, unknown>;

  return (
    <FaqForm
      mode="edit"
      initial={{
        id: f.id as string | number,
        question: (f.question as string) || "",
        answerHtml: (f.answerHtml as string) || "",
        category: (f.category as string) || "general",
        sortOrder: (f.sortOrder as number) ?? 100,
        active: f.active !== false,
      }}
    />
  );
}
