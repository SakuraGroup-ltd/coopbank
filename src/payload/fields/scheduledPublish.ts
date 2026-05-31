import type { Field } from "payload";

// Optional future-publish timestamp. The cron at /api/cron/publish flips
// matching drafts to published when the time hits, then clears the field.
export const scheduledPublishField: Field = {
  name: "scheduledPublishAt",
  type: "date",
  admin: {
    description:
      "Optional. Publish at a specific date/time — leave the status as Draft and the cron will flip it.",
    date: { pickerAppearance: "dayAndTime" },
    position: "sidebar",
  },
};
