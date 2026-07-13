import { getPayload } from "payload";
import config from "../../../../../payload.config";
import {
  resolveFooterData,
  type FooterGlobal,
  type SiteSettingsGlobal,
} from "@/components/layout/FooterView";
import FooterPreviewClient from "@/components/preview/FooterPreviewClient";

export const dynamic = "force-dynamic";

export default async function FooterPreviewPage() {
  const payload = await getPayload({ config });
  const [site, footer] = await Promise.all([
    payload.findGlobal({ slug: "site-settings", depth: 0 }).catch(() => ({})),
    payload.findGlobal({ slug: "footer", depth: 0 }).catch(() => ({})),
  ]);
  const initial = resolveFooterData(site as SiteSettingsGlobal, footer as FooterGlobal);
  return <FooterPreviewClient initial={initial} />;
}
