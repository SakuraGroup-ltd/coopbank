"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Phone } from "lucide-react";
import { Badge } from "../ui/Badge";

export type MessageRow = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

const TONE: Record<string, "success" | "neutral" | "warning"> = {
  new: "warning",
  read: "neutral",
  handled: "success",
};

export function MessageList({ initial }: { initial: MessageRow[] }) {
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  async function setStatus(id: number, status: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setRows((r) => r.map((m) => (m.id === id ? { ...m, status } : m)));
    } finally {
      setBusy(null);
    }
  }

  if (!rows.length) {
    return <p className="text-sm text-studio-ink-3 border border-dashed border-studio-border rounded-2xl p-10 text-center">No messages yet.</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((m) => {
        const isOpen = open === m.id;
        return (
          <div key={m.id} className="rounded-2xl border border-studio-border bg-studio-panel overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              onClick={() => {
                setOpen(isOpen ? null : m.id);
                if (!isOpen && m.status === "new") setStatus(m.id, "read");
              }}
            >
              <Badge tone={TONE[m.status] || "neutral"}>{m.status}</Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-studio-ink truncate">{m.subject}</p>
                <p className="text-xs text-studio-ink-3 truncate">{m.name} · {m.email}{m.createdAt ? ` · ${new Date(m.createdAt).toLocaleString()}` : ""}</p>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-studio-ink-3" /> : <ChevronDown className="w-4 h-4 text-studio-ink-3" />}
            </button>
            {isOpen && (
              <div className="border-t border-studio-border bg-studio-soft/50 p-5 space-y-4">
                <p className="text-sm text-studio-ink whitespace-pre-wrap">{m.message}</p>
                <div className="flex items-center gap-4 text-xs text-studio-ink-2">
                  <a className="inline-flex items-center gap-1.5 hover:text-cb-navy" href={`mailto:${m.email}`}><Mail className="w-3.5 h-3.5" />{m.email}</a>
                  {m.phone && <a className="inline-flex items-center gap-1.5 hover:text-cb-navy" href={`tel:${m.phone}`}><Phone className="w-3.5 h-3.5" />{m.phone}</a>}
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={busy === m.id || m.status === "handled"}
                    onClick={() => setStatus(m.id, "handled")}
                    className="h-8 px-3 text-xs rounded-lg bg-studio-ink text-white font-medium disabled:opacity-40"
                  >
                    Mark handled
                  </button>
                  {m.status === "handled" && (
                    <button
                      disabled={busy === m.id}
                      onClick={() => setStatus(m.id, "read")}
                      className="h-8 px-3 text-xs rounded-lg border border-studio-border font-medium"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
