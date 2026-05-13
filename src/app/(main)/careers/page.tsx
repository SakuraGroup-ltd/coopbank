import { fetchJobListings } from "@/lib/sheets";
import CareersClient from "./CareersClient";

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const jobs = await fetchJobListings();
  return <CareersClient jobs={jobs} />;
}
