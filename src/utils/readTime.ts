export function calcReadTime(bodyHtml: string, overrideMins?: string | number): number {
  if (overrideMins) {
    const n = Number(overrideMins);
    if (!isNaN(n) && n > 0) return n;
  }
  const text = bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function fmtDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
