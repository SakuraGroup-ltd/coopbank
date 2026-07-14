import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { MessageList, type MessageRow } from "@/components/studio/messages/MessageList";

export const dynamic = "force-dynamic";

export default async function MessagesStudioPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const res = await payload
    .find({ collection: "contact-messages", sort: "-createdAt", limit: 200, depth: 0, overrideAccess: true })
    .catch(() => ({ docs: [] as unknown[] }));
  const rows: MessageRow[] = (res.docs as Record<string, unknown>[]).map((d) => ({
    id: d.id as number,
    name: (d.name as string) || "",
    email: (d.email as string) || "",
    phone: (d.phone as string) || "",
    subject: (d.subject as string) || "",
    message: (d.message as string) || "",
    status: (d.status as string) || "new",
    createdAt: (d.createdAt as string) || "",
  }));
  return (
    <div className="p-8 lg:p-10">
      <h1 className="text-2xl font-semibold text-studio-ink mb-1">Contact messages</h1>
      <p className="text-sm text-studio-ink-3 mb-6">Submissions from the /contact-us form. Mark as read or handled as you triage.</p>
      <MessageList initial={rows} />
    </div>
  );
}
