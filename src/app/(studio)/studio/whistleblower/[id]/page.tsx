import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { WhistleblowerCase } from "@/components/studio/whistleblower/WhistleblowerCase";

export const dynamic = "force-dynamic";

type Args = { params: Promise<{ id: string }> };

export default async function WhistleblowerCasePage({ params }: Args) {
  await requireStudioUser();
  const { id } = await params;
  const payload = await getPayload({ config });
  const result = await payload.findByID({
    collection: "whistleblower-reports",
    id,
    depth: 1,
  });
  const report = result as unknown as Record<string, unknown>;
  return <WhistleblowerCase report={report} />;
}
