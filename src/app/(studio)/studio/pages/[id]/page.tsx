import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { PageComposer } from "@/components/studio/pages/PageComposer";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ id: string }> };

export default async function PageEditPage({ params }: Args) {
  await requireStudioUser();
  const { id } = await params;

  if (id === "new") {
    return (
      <PageComposer
        mode="create"
        initial={{
          title: "",
          slug: "",
          layout: [],
        }}
      />
    );
  }

  const payload = await getPayload({ config });
  const result = await payload.findByID({
    collection: "pages",
    id,
    depth: 1,
    draft: true,
  });
  const page = result as unknown as {
    id: string | number;
    title: string;
    slug?: string;
    layout?: Array<Record<string, unknown>>;
    seo?: { metaTitle?: string; metaDescription?: string };
    _status?: "draft" | "published";
  };

  return (
    <PageComposer
      mode="edit"
      initial={{
        id: page.id,
        title: page.title || "",
        slug: page.slug || "",
        layout: (page.layout || []) as Array<Record<string, unknown>>,
        seo: page.seo,
        status: page._status,
      }}
    />
  );
}
