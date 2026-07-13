// Reads from Payload — no Sheets. Branches publish from /studio/branches
// and land here on the next request.
import { getPayload } from "payload";
import config from "../../../../payload.config";
import BranchesClient from "./BranchesClient";
import type { ClientBranch } from "./BranchesClient";

export const dynamic = "force-dynamic";

const REGION_LABEL: Record<string, string> = {
  arusha: "Arusha",
  "dar-es-salaam": "Dar es Salaam",
  dodoma: "Dodoma",
  kagera: "Kagera",
  kilimanjaro: "Kilimanjaro",
  mbeya: "Mbeya",
  mtwara: "Mtwara",
  mwanza: "Mwanza",
  tabora: "Tabora",
  other: "Other",
};
const TYPE_LABEL: Record<string, string> = {
  branch: "Branch",
  agency: "Agency",
  "sub-branch": "Sub-branch",
  atm: "ATM",
};

export default async function BranchesPage() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "branches",
    limit: 500,
    // depth 1 so the photo upload resolves to a URL (depth 0 returns a bare id)
    depth: 1,
    sort: "name",
  });

  const branches: ClientBranch[] = result.docs.map((d) => {
    const r = d as unknown as {
      name: string;
      type?: string;
      region?: string;
      address?: string;
      phone?: string;
      hoursWeekday?: string;
      hoursSaturday?: string;
      mapsUrl?: string;
      photo?: { url?: string } | number | null;
      coordinates?: { lat?: number | null; lng?: number | null } | null;
      isHq?: boolean;
      comingSoon?: boolean;
      expectedOpening?: string;
      active?: boolean;
    };
    // Same photo-URL rule as leadership: only absolute URLs render; legacy
    // /api/media/file/* paths 500 on live.
    const photoUrl = typeof r.photo === "object" && r.photo ? r.photo.url : undefined;
    const photoUsable =
      photoUrl && /^https?:\/\//.test(photoUrl) && !photoUrl.includes("/api/media/file/");
    return {
      name: r.name,
      type: TYPE_LABEL[r.type || "branch"] || r.type || "Branch",
      region: REGION_LABEL[r.region || "other"] || r.region || "Other",
      address: r.address || "",
      phone: r.phone || "",
      hours_weekday: r.hoursWeekday || "",
      hours_saturday: r.hoursSaturday || "",
      maps_url: r.mapsUrl || "",
      photo: photoUsable ? (photoUrl as string) : "",
      lat: r.coordinates?.lat != null ? String(r.coordinates.lat) : "",
      lng: r.coordinates?.lng != null ? String(r.coordinates.lng) : "",
      is_hq: r.isHq ? "true" : "false",
      coming_soon: r.comingSoon ? "true" : "false",
      expected_opening: r.expectedOpening || "",
      active: r.active === false ? "false" : "true",
    };
  })
  // Hide branches the editor has paused via active=false
  .filter((b) => b.active !== "false");

  return <BranchesClient branches={branches} />;
}
