import { fetchTenders } from "@/lib/sheets";
import TendersClient from "./TendersClient";

export const dynamic = "force-dynamic";

export default async function TendersPage() {
  const tenders = await fetchTenders();
  return <TendersClient tenders={tenders} />;
}
