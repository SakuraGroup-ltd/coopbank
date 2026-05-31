import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { TenderComposer } from "@/components/studio/tenders/TenderComposer";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ id: string }> };

export default async function TenderComposerPage({ params }: Args) {
  await requireStudioUser();
  const { id } = await params;

  // Auto-suggest next tender ref: TB-<year>-001 if no others exist this year.
  const payload = await getPayload({ config });
  const year = new Date().getFullYear();

  if (id === "new") {
    const existingThisYear = await payload.find({
      collection: "tenders",
      limit: 50,
      depth: 0,
      where: { tenderRef: { like: `TB-${year}-` } },
    });
    const maxNum = existingThisYear.docs.reduce((max, d) => {
      const ref = (d as { tenderRef?: string }).tenderRef || "";
      const m = ref.match(/TB-\d{4}-(\d{3,})/);
      const n = m ? Number(m[1]) : 0;
      return n > max ? n : max;
    }, 0);
    const nextNum = String(maxNum + 1).padStart(3, "0");
    return (
      <TenderComposer
        mode="create"
        initial={{
          tenderRef: `TB-${year}-${nextNum}`,
          title: "",
          category: "goods",
          contractType: "supply",
          publishedDate: new Date().toISOString().slice(0, 10),
          closingDate: new Date(Date.now() + 21 * 86_400_000).toISOString().slice(0, 10),
          descriptionHtml: "",
        }}
      />
    );
  }

  const result = await payload.findByID({
    collection: "tenders",
    id,
    depth: 1,
    draft: true,
  });

  const tender = result as unknown as {
    id: string | number;
    tenderRef: string;
    title: string;
    category?: string;
    contractType?: string;
    publishedDate?: string;
    closingDate?: string;
    descriptionHtml?: string;
    document?: { id?: string | number; url?: string; filename?: string };
    _status?: "draft" | "published";
  };

  return (
    <TenderComposer
      mode="edit"
      initial={{
        id: tender.id,
        tenderRef: tender.tenderRef || "",
        title: tender.title || "",
        category: tender.category || "goods",
        contractType: tender.contractType || "supply",
        publishedDate: tender.publishedDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        closingDate: tender.closingDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        descriptionHtml: tender.descriptionHtml || "",
        document: tender.document,
        status: tender._status,
      }}
    />
  );
}
