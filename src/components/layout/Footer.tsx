import { getPayload } from "payload";
import config from "../../../payload.config";
import { FooterView, resolveFooterData, type SiteSettingsGlobal, type FooterGlobal } from "./FooterView";

// Footer is CMS-driven: contact details, social links, and the app-store URLs
// come from the `site-settings` global; the tagline, copyright, banner, about
// text, branches, legal links, developer credit, and (optionally) the nav-link
// columns come from the `footer` global. Everything degrades to the hardcoded
// fallbacks in FooterView.tsx if a global is empty or the DB read fails, so the
// footer can NEVER break a page render.
//
// This is a thin server wrapper: all markup and fallback logic live in the pure
// FooterView component, which is also rendered by the studio live-preview route
// so preview and production can never drift from each other.

async function loadFooterData() {
  try {
    const payload = await getPayload({ config });
    const [site, footer] = await Promise.all([
      payload.findGlobal({ slug: "site-settings", depth: 0 }),
      payload.findGlobal({ slug: "footer", depth: 0 }),
    ]);
    return { site: site as SiteSettingsGlobal, footer: footer as FooterGlobal };
  } catch {
    // DB unavailable (e.g. during a static build) — fall back entirely.
    return { site: {} as SiteSettingsGlobal, footer: {} as FooterGlobal };
  }
}

export default async function Footer() {
  const { site, footer } = await loadFooterData();
  return <FooterView {...resolveFooterData(site, footer)} />;
}
