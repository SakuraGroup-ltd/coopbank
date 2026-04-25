"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import Image from "next/image";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const AVATAR = "/images/mshirika-avatar.jpg";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Habari! Mimi ni Mshirika, msaidizi wako wa CoopBank. Nikusaidie nini leo?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Play attention sound after 3 seconds
  useEffect(() => {
    if (hasPlayedSound || open) return;
    const timer = setTimeout(() => {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        setHasPlayedSound(true);
      } catch {}
    }, 3000);
    return () => clearTimeout(timer);
  }, [hasPlayedSound, open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "API error");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (err) {
      console.error("Chat fetch error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Samahani, kuna tatizo la muda mfupi. Tafadhali piga +255 27 275 4470 kwa msaada wa haraka.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (q: string) => {
    const userMsg: Message = { role: "user", content: q };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    })
      .then((r) => r.json())
      .then((data) => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Samahani, jaribu tena baadaye." },
        ]);
      })
      .finally(() => setLoading(false));
  };

  const quickQuestions = [
    "Nataka kufungua akaunti",
    "Napataje mkopo?",
    "Mpo wapi?",
    "CoopEsa app",
    "Nawezaje kununua hisa?",
  ];

  return (
    <>
      {/* Floating Avatar Button + Tooltip */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-16 left-4 z-50 flex items-end gap-3"
          >
            {/* Avatar button */}
            <div className="relative flex-shrink-0">
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full bg-[#1A56A0]/20 animate-ping" style={{ animationDuration: "2s" }} />
              <button
                onClick={() => {
                  setOpen(true);
                  setTooltipDismissed(true);
                }}
                className="relative h-[56px] w-[56px] rounded-full overflow-hidden shadow-lg shadow-[#1A56A0]/20 ring-[3px] ring-white transition-transform hover:scale-105 active:scale-95"
              >
                <Image
                  src={AVATAR}
                  alt="Mshirika"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover object-[center_20%]"
                />
                {/* Online indicator */}
                <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#00C853]" />
              </button>
            </div>

            {/* Welcome tooltip */}
            {!tooltipDismissed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.3 }}
                className="relative mb-2 rounded-2xl bg-white px-4 py-3 shadow-lg border border-gray-100 max-w-[200px]"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTooltipDismissed(true);
                  }}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold hover:bg-gray-300"
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="text-[12px] font-bold text-[#1A56A0]">
                  Mshirika
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  Karibu, tukue pamoja!
                </p>
                <div className="absolute left-[-6px] bottom-4 w-3 h-3 bg-white border-l border-b border-gray-100 rotate-[45deg]" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={widgetRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-16 left-4 z-50 flex h-[480px] w-[340px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/20 border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-[#1A56A0] px-5 py-4">
              <div className="relative">
                <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/20">
                  <Image
                    src={AVATAR}
                    alt="Mshirika"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#1A56A0] bg-[#00C853]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">Mshirika</h3>
                <p className="text-[11px] text-white/60">
                  Msaidizi wa CoopBank - Online
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto px-4 py-4 bg-[#f7f8fa]"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="h-7 w-7 flex-shrink-0 rounded-full overflow-hidden">
                      <Image
                        src={AVATAR}
                        alt="Mshirika"
                        width={28}
                        height={28}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#1A56A0]">
                      <svg
                        className="h-3.5 w-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#1A56A0] text-white rounded-br-md"
                        : "bg-white text-[#333] shadow-sm border border-gray-100 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="h-7 w-7 flex-shrink-0 rounded-full overflow-hidden">
                    <Image
                      src={AVATAR}
                      alt="Mshirika"
                      width={28}
                      height={28}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1A56A0]" />
                      <span className="text-xs text-gray-400">
                        Mshirika anaandika...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Questions */}
              {messages.length === 1 && !loading && (
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Maswali ya haraka
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleQuickQuestion(q)}
                        className="rounded-full border border-[#1A56A0]/15 bg-white px-3 py-1.5 text-[11px] font-medium text-[#1A56A0] transition-colors hover:bg-[#1A56A0]/5 hover:border-[#1A56A0]/30"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Powered by */}
            <div className="border-t border-gray-100 bg-white px-4 py-1.5 text-center">
              <p className="text-[9px] text-gray-300 font-medium">
                Powered by{" "}
                <a
                  href="https://sms.sakuragroup.co.tz"
                  target="_blank"
                  rel="noopener"
                  className="text-gray-400 hover:text-[#1A56A0] transition-colors"
                >
                  Sakura SMS
                </a>
              </p>
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 bg-white px-3 py-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Andika ujumbe wako..."
                  className="flex-1 rounded-xl border border-gray-200 bg-[#f7f8fa] px-4 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-[#1A56A0]/40 focus:bg-white"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#1A56A0] text-white transition-all hover:bg-[#0F3D7A] disabled:opacity-40 disabled:hover:bg-[#1A56A0]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
