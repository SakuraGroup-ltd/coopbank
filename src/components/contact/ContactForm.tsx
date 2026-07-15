"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/about/FadeIn";
import { defaultContactForm } from "./contact-defaults";

type State = "idle" | "sending" | "sent" | "error";

export default function ContactForm(props: Partial<typeof defaultContactForm> = {}) {
  const c = { ...defaultContactForm, ...props };
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = Object.fromEntries(fd.entries());
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again or email us directly.");
      }
      setState("sent");
      form.reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const input =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-[#1A1A2E] placeholder:text-[#4A5568]/50 focus:border-[#1A8A3A] focus:ring-2 focus:ring-[#1A8A3A]/15 focus:outline-none";

  return (
    <section className="py-14 bg-[#F2F4F8]" id="message">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] mb-2">{c.heading}</h2>
          <p className="text-[#4A5568] mb-8">{c.intro}</p>
        </FadeIn>
        {state === "sent" ? (
          <div className="rounded-2xl border border-[#1A8A3A]/25 bg-[#1A8A3A]/5 p-8 flex items-start gap-4">
            <CheckCircle2 className="text-[#1A8A3A] shrink-0 mt-0.5" size={22} />
            <p className="text-[#1A1A2E] leading-relaxed">{c.successMessage}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Honeypot — humans never see or fill this */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={input} name="name" placeholder="Full name" aria-label="Full name" required maxLength={120} />
              <input className={input} name="email" type="email" placeholder="Email address" aria-label="Email address" required maxLength={160} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={input} name="phone" placeholder="Phone (optional)" aria-label="Phone (optional)" maxLength={30} />
              <input className={input} name="subject" placeholder="Subject" aria-label="Subject" required maxLength={160} />
            </div>
            <textarea className={input} name="message" placeholder="How can we help?" aria-label="How can we help?" required rows={6} maxLength={4000} />
            {state === "error" && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1A8A3A] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#00C853] disabled:opacity-60"
            >
              {state === "sending" && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
