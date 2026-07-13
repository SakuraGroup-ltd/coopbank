import { getPayload } from "payload";
import config from "../../../payload.config";
import Link from "next/link";

// Renders the site-settings emergency banner above the navbar when active.
// Server component — reads the global directly; renders nothing on error so a
// DB hiccup can never break the page shell.
const LEVEL_STYLES: Record<string, string> = {
  info: "bg-[#0F3D7A] text-white",
  warning: "bg-amber-500 text-black",
  urgent: "bg-red-600 text-white",
};

type BannerData = {
  active?: boolean | null;
  level?: string | null;
  message?: string | null;
  linkLabel?: string | null;
  linkHref?: string | null;
};

export default async function EmergencyBanner() {
  let banner: BannerData | null = null;
  try {
    const payload = await getPayload({ config });
    const site = (await payload.findGlobal({ slug: "site-settings", depth: 0 })) as {
      emergencyBanner?: BannerData | null;
    };
    banner = site?.emergencyBanner ?? null;
  } catch {
    return null;
  }
  if (!banner?.active || !banner.message) return null;

  const style = LEVEL_STYLES[banner.level || "info"] || LEVEL_STYLES.info;
  return (
    <div className={`${style} px-4 py-2.5 text-center text-sm font-medium`}>
      <span>{banner.message}</span>
      {banner.linkLabel && banner.linkHref && (
        <Link href={banner.linkHref} className="ml-2 underline underline-offset-2 hover:opacity-80">
          {banner.linkLabel}
        </Link>
      )}
    </div>
  );
}
