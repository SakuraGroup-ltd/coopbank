import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { AuctionForm } from "@/components/studio/auctions/AuctionForm";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ id: string }> };

export default async function AuctionEditPage({ params }: Args) {
  await requireStudioUser();
  const { id } = await params;

  if (id === "new") {
    const today = new Date().toISOString().slice(0, 10);
    return (
      <AuctionForm
        mode="create"
        initial={{
          instrument: "",
          tenor: "",
          announcementDate: today,
          auctionDate: today,
          valueDate: "",
          maturityDate: "",
          notes: "",
          status: "upcoming",
          active: true,
        }}
      />
    );
  }

  const payload = await getPayload({ config });
  const result = await payload.findByID({ collection: "auctions", id, depth: 0 });
  const a = result as unknown as Record<string, unknown>;

  return (
    <AuctionForm
      mode="edit"
      initial={{
        id: a.id as string | number,
        instrument: (a.instrument as string) || "",
        tenor: (a.tenor as string) || "",
        announcementDate: ((a.announcementDate as string) || "").slice(0, 10),
        auctionDate: ((a.auctionDate as string) || "").slice(0, 10),
        valueDate: ((a.valueDate as string) || "").slice(0, 10),
        maturityDate: ((a.maturityDate as string) || "").slice(0, 10),
        notes: (a.notes as string) || "",
        status: (a.status as string) || "upcoming",
        active: a.active !== false,
      }}
    />
  );
}
