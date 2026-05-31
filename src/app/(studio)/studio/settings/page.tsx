import Link from "next/link";
import { ChevronRight, Settings as SettingsIcon } from "lucide-react";
import { getPayload } from "payload";
import config from "../../../../../payload.config";
import { requireStudioUser } from "@/lib/studio/auth";
import { SettingsHub } from "@/components/studio/settings/SettingsHub";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireStudioUser();
  const payload = await getPayload({ config });

  const [site, header, footer, homepage] = await Promise.all([
    payload.findGlobal({ slug: "site-settings", depth: 0 }),
    payload.findGlobal({ slug: "header", depth: 0 }),
    payload.findGlobal({ slug: "footer", depth: 0 }),
    payload.findGlobal({ slug: "homepage", depth: 0 }),
  ]);

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto animate-fade-up">
      <div className="flex items-center gap-2 text-xs text-studio-ink-3 mb-6">
        <Link href="/studio" className="hover:text-studio-ink">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-studio-ink font-medium">Settings</span>
      </div>

      <div className="flex items-start gap-4 mb-8">
        <span className="w-12 h-12 rounded-xl bg-cb-navy/8 text-cb-navy inline-flex items-center justify-center">
          <SettingsIcon className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-studio-ink">Settings</h1>
          <p className="text-sm text-studio-ink-3 mt-1">
            Site-wide configuration · contact details · header / footer · emergency banner
          </p>
        </div>
      </div>

      <SettingsHub
        siteSettings={site as Record<string, unknown>}
        header={header as Record<string, unknown>}
        footer={footer as Record<string, unknown>}
        homepage={homepage as Record<string, unknown>}
      />
    </div>
  );
}
