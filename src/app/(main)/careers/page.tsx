import { fetchJobListings } from "@/lib/sheets";
import CareersClient from "./CareersClient";

export default async function CareersPage() {
  const jobs = await fetchJobListings();
  return <CareersClient jobs={jobs} />;
}
