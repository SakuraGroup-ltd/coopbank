import { getPayload } from "payload";
import config from "../../../../../payload.config";
import LeadershipPreviewClient, { type LeadershipPreviewData } from "@/components/preview/LeadershipPreviewClient";
import type { Person } from "@/components/about/LeadershipGrid";

export const dynamic = "force-dynamic";

export default async function LeadershipPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "board" } = await searchParams;
  const payload = await getPayload({ config });
  const res = await payload
    .find({
      collection: "leadership-team",
      where: { and: [{ category: { equals: category } }, { active: { not_equals: false } }] },
      sort: "sortOrder",
      depth: 1,
      limit: 100,
    })
    .catch(() => ({ docs: [] as unknown[] }));
  // Same photo-URL rule as src/lib/leadership.ts: only absolute URLs render;
  // legacy /api/media/file/* paths 500 on live and aren't next/image hosts.
  const people: Person[] = (res.docs as { name: string; title: string; photo?: { url?: string } }[]).map(
    (d) => {
      const url = d.photo?.url;
      const usable = url && /^https?:\/\//.test(url) && !url.includes("/api/media/file/");
      return { name: d.name, title: d.title, image: usable ? url : undefined };
    },
  );
  const initial: LeadershipPreviewData = { intro: "", highlightCount: category === "board" ? 2 : 1, people };
  return <LeadershipPreviewClient initial={initial} />;
}
