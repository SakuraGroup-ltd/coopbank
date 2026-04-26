import { fetchBranches } from "@/lib/sheets";
import BranchesClient from "./BranchesClient";

export default async function BranchesPage() {
  const branches = await fetchBranches();
  return <BranchesClient branches={branches} />;
}
