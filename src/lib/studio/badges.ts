// Computes counts to render as badges on sidebar nav items. Run once per
// request from the studio layout; surfaces editor focus on the things
// that actually need their attention right now.
import { getPayload } from "payload";
import config from "../../../payload.config";

export type Badges = Record<string, string | number>;

export async function computeBadges(): Promise<Badges> {
  const payload = await getPayload({ config });
  const now = new Date();
  const todayIso = now.toISOString();
  const weekFromNow = new Date(now.getTime() + 7 * 86_400_000).toISOString();

  const [blogDrafts, pressDrafts, pagesDrafts, tendersClosing, jobsExpiring, newCases, scheduled] = await Promise.all([
    payload.count({ collection: "blog-posts", where: { _status: { equals: "draft" } } }).catch(() => ({ totalDocs: 0 })),
    payload.count({ collection: "press-releases", where: { _status: { equals: "draft" } } }).catch(() => ({ totalDocs: 0 })),
    payload.count({ collection: "pages", where: { _status: { equals: "draft" } } }).catch(() => ({ totalDocs: 0 })),
    payload.count({
      collection: "tenders",
      where: {
        and: [
          { closingDate: { greater_than_equal: todayIso } },
          { closingDate: { less_than_equal: weekFromNow } },
        ],
      },
    }).catch(() => ({ totalDocs: 0 })),
    payload.count({
      collection: "job-listings",
      where: {
        and: [
          { applyByDate: { greater_than_equal: todayIso } },
          { applyByDate: { less_than_equal: weekFromNow } },
        ],
      },
    }).catch(() => ({ totalDocs: 0 })),
    payload.count({ collection: "whistleblower-reports", where: { status: { equals: "new" } } }).catch(() => ({ totalDocs: 0 })),
    payload.count({ collection: "press-releases", where: { scheduledPublishAt: { not_equals: null } } }).catch(() => ({ totalDocs: 0 })),
  ]);

  return {
    blog: blogDrafts.totalDocs || 0,
    press: pressDrafts.totalDocs || 0,
    pages: pagesDrafts.totalDocs || 0,
    tenders: tendersClosing.totalDocs || 0,
    jobs: jobsExpiring.totalDocs || 0,
    whistleblower: newCases.totalDocs || 0,
    // The scheduled count surfaces on the dashboard, not a sidebar entry
    scheduled: scheduled.totalDocs || 0,
  };
}
