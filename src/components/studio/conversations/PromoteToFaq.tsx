"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, AlertCircle } from "lucide-react";

// Turns a logged customer question into a draft FAQ and jumps to the FAQ
// editor to refine + publish it. The bot's reply (if any) seeds the answer.
export function PromoteToFaq({
  question,
  answer,
}: {
  question: string;
  answer?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function promote() {
    setState("saving");
    setErr(null);
    try {
      const res = await fetch("/api/studio/faq-from-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setErr(data?.error || `HTTP ${res.status}`);
        return;
      }
      router.push(`/studio/faqs/${data.id}`);
    } catch (e) {
      setState("error");
      setErr(e instanceof Error ? e.message : "Network error");
    }
  }

  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-rose-600" title={err || ""}>
        <AlertCircle className="w-3 h-3" />
        {err || "Failed"}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={promote}
      disabled={state === "saving"}
      className="inline-flex items-center gap-1 text-[11px] font-medium text-cb-navy hover:text-cb-green disabled:opacity-50 transition-colors shrink-0"
    >
      {state === "saving" ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Plus className="w-3 h-3" />
      )}
      Add to FAQ
    </button>
  );
}
