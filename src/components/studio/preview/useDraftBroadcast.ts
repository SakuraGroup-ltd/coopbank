"use client";
import { useCallback, useEffect, useRef } from "react";
import { STUDIO_PREVIEW_MESSAGE, type PreviewScope } from "@/lib/studio/livePreview";

// Posts the current draft into the preview iframe on every change (coalesced to
// one post per frame) and re-posts once the iframe finishes loading, so a
// freshly-mounted preview immediately reflects unsaved edits.
export function useDraftBroadcast<T>(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  scope: PreviewScope,
  draft: T,
) {
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const post = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: STUDIO_PREVIEW_MESSAGE, scope, data: draftRef.current }, "*");
  }, [iframeRef, scope]);

  useEffect(() => {
    const raf = requestAnimationFrame(post);
    return () => cancelAnimationFrame(raf);
  }, [draft, post]);

  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;
    el.addEventListener("load", post);
    return () => el.removeEventListener("load", post);
  }, [iframeRef, post]);
}
