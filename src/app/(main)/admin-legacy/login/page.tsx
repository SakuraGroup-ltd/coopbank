"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const from    = params.get("from") || "/admin";
  const [pw, setPw]           = useState("");
  const [show, setShow]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push(from);
    } else {
      setError("Incorrect password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left — photo panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col justify-between p-12">

        {/* Background photo */}
        <Image
          src="/images/coopbank-dodoma.gif"
          alt="Co-operative Bank of Tanzania — Dodoma Branch"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#03080f]/90 via-[#03080f]/40 to-[#03080f]/10" />

        {/* Logo — top left */}
        <div className="relative z-10">
          <Image
            src="/images/coopbank-logo.png"
            alt="Cooperative Bank Tanzania"
            width={160}
            height={56}
            className="brightness-0 invert"
            priority
          />
        </div>

        {/* Bottom copy */}
        <div className="relative z-10">
          <h2 className="text-white text-3xl font-bold tracking-tight leading-snug mb-3">
            Co-operative Bank<br />of Tanzania
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-[320px]">
            Ustawi kwa Wote &mdash; Prosperity for All
          </p>
        </div>
      </div>

      {/* ── Right — login form ─────────────────────────────────────────────── */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center px-8">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Image src="/images/coopbank-logo.png" alt="CoopBank" width={140} height={48} priority />
        </div>

        <div className="w-full max-w-[340px]">
          <div className="mb-8">
            <h1 className="text-[22px] font-bold text-[#0E1B36] tracking-tight">Staff Portal</h1>
            <p className="text-sm text-gray-400 mt-1">Sign in with your admin credentials</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter admin password"
                  className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl px-4 py-3.5 pr-11 text-sm text-[#0E1B36] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/25 focus:border-[#1A56A0] transition"
                />
                <button type="button" onClick={() => setShow(v => !v)} tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition">
                  {show
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !pw}
              className="w-full bg-[#1A56A0] hover:bg-[#144a8c] disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-semibold transition-all">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </span>
                : "Sign In"
              }
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-gray-300 leading-relaxed">
            Authorised CoopBank staff only.<br />Contact IT for access issues.
          </p>
        </div>

        <p className="absolute bottom-5 right-6 text-[10px] text-gray-200">
          dev.coopbank.co.tz
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
