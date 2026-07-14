// Scheme guards for editor-controlled URLs (stored-XSS defence, see 069e092).
// safeHref: only http(s), site-relative, or hash links survive.
// safeImg:  only https or local-public image URLs survive; the legacy
//           /api/media/file/* proxy 500s on live and is rejected outright.
export function safeHref(href: string | null | undefined): string {
  const h = (href || "").trim();
  return /^(https?:\/\/|\/|#)/i.test(h) ? h : "";
}

export function safeImg(url: string | null | undefined): string {
  const u = (url || "").trim();
  if (!u || u.includes("/api/media/file/")) return "";
  return /^(https:\/\/|\/)/i.test(u) ? u : "";
}
