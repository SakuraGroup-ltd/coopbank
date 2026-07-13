// Shared contract between the studio editor (sender) and the preview iframe
// (receiver). One message type; `scope` guards against cross-wiring if two
// previews ever share an origin.
export const STUDIO_PREVIEW_MESSAGE = "studio-live-preview" as const;

export type PreviewScope = "footer" | "leadership" | "showcase";

export type StudioPreviewMessage<T = unknown> = {
  type: typeof STUDIO_PREVIEW_MESSAGE;
  scope: PreviewScope;
  data: T;
};
