import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { FooterEditor } from "@/components/studio/footer/FooterEditor";
import type { FooterGlobal, SiteSettingsGlobal } from "@/components/layout/FooterView";

export const dynamic = "force-dynamic";

export default async function FooterStudioPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });
  const [footer, site] = await Promise.all([
    payload.findGlobal({ slug: "footer", depth: 0 }).catch(() => ({})),
    payload.findGlobal({ slug: "site-settings", depth: 0 }).catch(() => ({})),
  ]);
  return (
    <div className="p-8 lg:p-10 h-screen">
      <FooterEditor initialFooter={footer as FooterGlobal} initialSite={site as SiteSettingsGlobal} />
    </div>
  );
}
