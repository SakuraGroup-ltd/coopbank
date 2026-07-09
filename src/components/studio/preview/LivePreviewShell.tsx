"use client";
import { useRef, useState } from "react";
import { Monitor, Smartphone, ExternalLink } from "lucide-react";
import { cn } from "@/components/studio/ui/cn";
import { useDraftBroadcast } from "./useDraftBroadcast";
import type { PreviewScope } from "@/lib/studio/livePreview";

export function LivePreviewShell<T>({
  previewSrc,
  livePath,
  scope,
  draft,
  headerRight,
  children,
}: {
  previewSrc: string;        // iframe src, e.g. "/studio-preview/footer"
  livePath: string;          // real public URL, e.g. "/"
  scope: PreviewScope;
  draft: T;
  headerRight?: React.ReactNode;
  children: React.ReactNode; // the form pane
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  useDraftBroadcast(iframeRef, scope, draft);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(360px,460px)_1fr] gap-6 h-full">
      <div className="min-w-0 overflow-y-auto">{children}</div>
      <div className="hidden xl:flex flex-col rounded-2xl border border-studio-border bg-studio-soft overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-studio-border bg-studio-panel">
          <div className="flex items-center gap-1">
            <ToggleBtn active={device === "desktop"} onClick={() => setDevice("desktop")}><Monitor className="w-4 h-4" /></ToggleBtn>
            <ToggleBtn active={device === "mobile"} onClick={() => setDevice("mobile")}><Smartphone className="w-4 h-4" /></ToggleBtn>
            <span className="text-xs text-studio-ink-3 ml-2">Live preview</span>
          </div>
          <div className="flex items-center gap-3">
            {headerRight}
            <a href={livePath} target="_blank" rel="noopener" className="text-xs text-studio-ink-3 hover:text-studio-ink inline-flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Open live
            </a>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 flex justify-center">
          <iframe
            ref={iframeRef}
            src={previewSrc}
            title="Live preview"
            className={cn("bg-white border border-studio-border rounded-lg transition-all", device === "mobile" ? "w-[390px]" : "w-full")}
            style={{ height: "100%", minHeight: 600 }}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("p-1.5 rounded-md transition-colors", active ? "bg-studio-ink text-white" : "text-studio-ink-3 hover:bg-studio-soft")}>
      {children}
    </button>
  );
}
