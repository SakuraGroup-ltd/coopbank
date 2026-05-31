// Scheduled-publish cron. Hits every minute (or whatever your scheduler does)
// and flips any draft document whose scheduledPublishAt has passed into the
// published state, then clears the schedule field so it doesn't re-fire.
//
// Auth: pass ?secret=<CRON_SECRET> in the URL. Set CRON_SECRET in env.
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "../../../../../payload.config";

const SCOPES = ["blog-posts", "pages", "tenders", "job-listings", "press-releases"] as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = await getPayload({ config });
  const now = new Date().toISOString();
  const summary: Record<string, number> = {};

  for (const collection of SCOPES) {
    let published = 0;
    const due = await payload.find({
      collection: collection as never,
      where: {
        and: [
          { _status: { equals: "draft" } },
          { scheduledPublishAt: { less_than_equal: now } },
        ],
      },
      limit: 100,
      depth: 0,
      draft: true,
    });
    for (const doc of due.docs) {
      try {
        await payload.update({
          collection: collection as never,
          id: (doc as { id: string | number }).id,
          data: { _status: "published", scheduledPublishAt: null } as never,
        });
        published++;
      } catch (e) {
        console.error(`cron/publish failed for ${collection}/${(doc as { id: string }).id}:`, e);
      }
    }
    summary[collection] = published;
  }

  return NextResponse.json({ ok: true, published: summary, ranAt: now });
}
