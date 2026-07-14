// Scheme guards for editor-controlled URLs (stored-XSS defence, see 069e092).
// safeHref: only http(s), site-relative, or hash links survive.
// safeImg:  only https or local-public image URLs survive; the legacy
//           /api/media/file/* proxy 500s on live and is rejected outright.
// Rejects protocol-relative, backslash, and control-character URLs
// (browsers normalize these, turning local paths into cross-origin attacks).
export function safeHref(href: string | null | undefined): string {
  const h = (href || "").trim();
  // Reject control chars and backslashes outright (browsers strip/normalize
  // them, turning "local-looking" paths into cross-origin URLs), and reject
  // protocol-relative //host.
  if (/[\x00-\x1f\\]/.test(h) || h.startsWith("//")) return "";
  return /^(https?:\/\/|\/|#)/i.test(h) ? h : "";
}

export function safeImg(url: string | null | undefined): string {
  const u = (url || "").trim();
  if (/[\x00-\x1f\\]/.test(u) || u.startsWith("//")) return "";
  if (!u || u.includes("/api/media/file/")) return "";
  return /^(https:\/\/|\/)/i.test(u) ? u : "";
}
