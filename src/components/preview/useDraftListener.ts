"use client";
import { useEffect, useState } from "react";
import { STUDIO_PREVIEW_MESSAGE, type PreviewScope, type StudioPreviewMessage } from "@/lib/studio/livePreview";

// Inside the preview iframe: start from server-fetched `initial`, then re-render
// with whatever the studio editor posts. Scope-guarded so unrelated messages
// (or other embeds) are ignored.
export function useDraftListener<T>(scope: PreviewScope, initial: T): T {
  const [data, setData] = useState<T>(initial);
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const msg = e.data as StudioPreviewMessage<T> | undefined;
      if (!msg || msg.type !== STUDIO_PREVIEW_MESSAGE || msg.scope !== scope) return;
      setData(msg.data);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [scope]);
  return data;
}
