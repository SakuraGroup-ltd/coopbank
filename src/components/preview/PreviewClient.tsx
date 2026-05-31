"use client";

// Live Preview client wrapper. When the page is loaded inside Payload admin's
// Live Preview iframe, this hook receives postMessage updates and re-renders
// the block tree on every keystroke in the admin — that's the WYSIWYG.
import { useLivePreview } from "@payloadcms/live-preview-react";
import { BlockRenderer } from "./BlockRenderer";

type PageData = {
  layout?: Array<{ blockType: string; [k: string]: unknown }>;
};

export default function PreviewClient({
  initialData,
  serverURL,
}: {
  initialData: PageData;
  serverURL: string;
}) {
  const { data } = useLivePreview<PageData>({
    initialData,
    serverURL,
    depth: 2,
  });

  return (
    <main className="min-h-screen bg-white">
      <BlockRenderer blocks={data?.layout || []} />
    </main>
  );
}
