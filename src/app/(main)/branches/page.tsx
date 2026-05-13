import { fetchBranches } from "@/lib/sheets";
import BranchesClient from "./BranchesClient";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  const branches = await fetchBranches();
  return <BranchesClient branches={branches} />;
}
