import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/isAdmin";
import { effectiveRole } from "../access/roles";

// Read-only log of the Mshirika chat widget (coopbank.co.tz /api/chat).
// One row per customer message + bot reply, written server-side only —
// there is no public create path, so `create` stays closed here.
// Purpose: let Marketing/Compliance see what customers are actually asking
// the bot, instead of every conversation vanishing once the tab closes.
export const ChatConversations: CollectionConfig = {
  slug: "chat-conversations",
  admin: {
    group: "Marketing",
    useAsTitle: "userMessage",
    defaultColumns: ["userMessage", "botReply", "page", "createdAt"],
    description:
      "Read-only log of Mshirika chat widget conversations. One row per customer message + bot reply. Written automatically by /api/chat — nothing to edit here.",
  },
  access: {
    create: () => false,
    read: ({ req: { user } }) => {
      if (!user || user.collection !== "users") return false;
      const role = effectiveRole(user as { role?: string; departments?: string[] });
      return ["master_admin", "admin", "marketer", "viewer"].includes(role);
    },
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: "sessionId",
      type: "text",
      index: true,
      admin: { description: "Groups messages from the same browser chat session." },
    },
    { name: "userMessage", type: "textarea", required: true },
    { name: "botReply", type: "textarea" },
    {
      name: "page",
      type: "text",
      admin: { description: "Page the widget was opened from (referer path)." },
    },
  ],
  timestamps: true,
};
