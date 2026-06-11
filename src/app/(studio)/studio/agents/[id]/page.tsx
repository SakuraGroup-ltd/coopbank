import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { AgentForm } from "@/components/studio/agents/AgentForm";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ id: string }> };

export default async function AgentEditPage({ params }: Args) {
  await requireStudioUser();
  const { id } = await params;

  if (id === "new") {
    return (
      <AgentForm
        mode="create"
        initial={{ name: "", region: "", district: "", ward: "", street: "", active: true }}
      />
    );
  }

  const payload = await getPayload({ config });
  const a = (await payload.findByID({
    collection: "coopwakala-agents",
    id,
    depth: 0,
  })) as unknown as Record<string, unknown>;

  return (
    <AgentForm
      mode="edit"
      initial={{
        id: a.id as string | number,
        name: (a.name as string) || "",
        region: (a.region as string) || "",
        district: (a.district as string) || "",
        ward: (a.ward as string) || "",
        street: (a.street as string) || "",
        active: a.active !== false,
      }}
    />
  );
}
