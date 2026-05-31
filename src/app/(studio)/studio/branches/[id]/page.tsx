import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { BranchForm } from "@/components/studio/branches/BranchForm";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ id: string }> };

export default async function BranchEditPage({ params }: Args) {
  await requireStudioUser();
  const { id } = await params;

  if (id === "new") {
    return (
      <BranchForm
        mode="create"
        initial={{
          name: "",
          type: "branch",
          region: "dar-es-salaam",
          address: "",
          phone: "",
          hoursWeekday: "8:30AM–4:00PM",
          hoursSaturday: "8:30AM–1:30PM",
          coordinates: { lat: undefined, lng: undefined },
          mapsUrl: "",
          isHq: false,
          comingSoon: false,
          active: true,
        }}
      />
    );
  }

  const payload = await getPayload({ config });
  const result = await payload.findByID({ collection: "branches", id, depth: 1 });
  const b = result as unknown as Record<string, unknown>;
  type Coords = { lat?: number; lng?: number };
  type Photo = { id?: string | number; url?: string; alt?: string };

  return (
    <BranchForm
      mode="edit"
      initial={{
        id: b.id as string | number,
        name: (b.name as string) || "",
        type: (b.type as string) || "branch",
        region: (b.region as string) || "dar-es-salaam",
        address: (b.address as string) || "",
        phone: (b.phone as string) || "",
        hoursWeekday: (b.hoursWeekday as string) || "",
        hoursSaturday: (b.hoursSaturday as string) || "",
        coordinates: (b.coordinates as Coords) || {},
        mapsUrl: (b.mapsUrl as string) || "",
        photo: b.photo as Photo,
        isHq: !!b.isHq,
        comingSoon: !!b.comingSoon,
        expectedOpening: (b.expectedOpening as string) || "",
        active: b.active !== false,
      }}
    />
  );
}
