import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import type { Agent } from "@/components/coopwakala/AgentsMap";
import { COOPWAKALA_AGENTS } from "@/lib/coopwakala-agents-seed";
import AgentsClient from "./AgentsClient";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  let agents: Agent[] = [];

  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "coopwakala-agents",
      limit: 1000,
      depth: 0,
      sort: "name",
      where: { active: { not_equals: false } },
    });
    agents = res.docs.map((d) => {
      const a = d as unknown as Record<string, unknown>;
      return {
        name: (a.name as string) || "",
        region: (a.region as string) || "",
        district: (a.district as string) || "",
        ward: (a.ward as string) || "",
        street: (a.street as string) || "",
      };
    });
  } catch {
    agents = [];
  }

  // Fallback to the migrated seed list until the collection is populated,
  // so the public directory never renders empty.
  if (agents.length === 0) agents = COOPWAKALA_AGENTS;

  return <AgentsClient agents={agents} />;
}
