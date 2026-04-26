"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const from    = params.get("from") || "/admin";
  const [pw, setPw]         = useState("");
  const [show, setShow]     = useState(false);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push(from);
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1A1A2E] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle geometric background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 left-16 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-32 right-8 w-48 h-48 rounded-full border border-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border border-white" />
        </div>

        <div className="relative z-10 text-center">
          <Image
            src="/images/coopbank-logo.png"
            alt="Cooperative Bank Tanzania"
            width={220}
            height={80}
            className="mx-auto mb-10 brightness-0 invert"
            priority
          />
          <div className="w-12 h-px bg-[#1A56A0] mx-auto mb-8" />
          <h2 className="text-white text-2xl font-light tracking-wide mb-3">
            Content Management
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Internal staff portal for managing website content — forex rates,
            job listings, tenders and branch information.
          </p>

          <div className="mt-16 grid grid-cols-2 gap-6 text-left max-w-xs mx-auto">
            {[
              ["💱", "Forex Rates",       "Treasury / Finance"],
              ["💼", "Job Listings",      "Human Resources"],
              ["📋", "Tenders",           "Operations"],
              ["📍", "Branches",          "Business Dev"],
            ].map(([icon, label, owner]) => (
              <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xl mb-2">{icon}</div>
                <div className="text-white text-xs font-semibold">{label}</div>
                <div className="text-white/30 text-[10px] mt-0.5">{owner}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-6 text-white/20 text-[10px] tracking-widest uppercase">
          Cooperative Bank of Tanzania Plc
        </p>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 bg-[#F6F8FA] flex flex-col items-center justify-center p-8">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Image
            src="/images/coopbank-logo.png"
            alt="Cooperative Bank Tanzania"
            width={160}
            height={56}
            priority
          />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Staff Portal</h1>
            <p className="text-sm text-gray-400 mt-1">Sign in with your admin credentials</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter admin password"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-[#1A1A2E] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 focus:border-[#1A56A0] transition shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
                  tabIndex={-1}
                >
                  {show ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !pw}
              className="w-full bg-[#1A56A0] hover:bg-[#154a8c] disabled:opacity-50 text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-md shadow-[#1A56A0]/20 disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-gray-400 leading-relaxed">
            This portal is for authorised CoopBank staff only.<br />
            Contact IT for access issues.
          </p>
        </div>

        <p className="absolute bottom-5 right-6 text-[10px] text-gray-300">
          dev.coopbank.co.tz/admin
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
