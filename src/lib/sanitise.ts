import DOMPurify from "isomorphic-dompurify";

export function sanitiseHtml(dirty: string): string {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p","h2","h3","h4","ul","ol","li","strong","em",
      "a","blockquote","br","img","table","thead",
      "tbody","tr","th","td","caption",
    ],
    ALLOWED_ATTR: ["href","src","alt","width","height","class","target","rel"],
    FORCE_BODY: true,
    HOOK_EVENT_FIXER: undefined,
  } as Parameters<typeof DOMPurify.sanitize>[1]);
}
