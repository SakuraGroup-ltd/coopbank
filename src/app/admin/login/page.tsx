"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

// ── SVG icons (no emojis) ─────────────────────────────────────────────────────

const icons = {
  forex: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v1m0 8v1M9.5 9.5C9.5 8.672 10.619 8 12 8s2.5.672 2.5 1.5S13.381 11 12 11s-2.5.672-2.5 1.5S10.619 14 12 14s2.5.672 2.5 1.5"/>
    </svg>
  ),
  jobs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    </svg>
  ),
  tenders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="13" y2="17"/>
    </svg>
  ),
  blog: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"/>
      <path d="M17.586 3.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  ),
  branches: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
      <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
};

const MODULES = [
  { icon: icons.forex,    label: "Forex Rates",   owner: "Treasury / Finance" },
  { icon: icons.jobs,     label: "Job Listings",  owner: "Human Resources" },
  { icon: icons.tenders,  label: "Tenders",       owner: "Procurement" },
  { icon: icons.blog,     label: "Blog Posts",    owner: "Communications" },
  { icon: icons.branches, label: "Branches",      owner: "Business Development" },
];

// ── Login form ────────────────────────────────────────────────────────────────

function LoginForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const from    = params.get("from") || "/admin";
  const [pw, setPw]             = useState("");
  const [show, setShow]         = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

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

      {/* ── Left — brand panel ────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "#0E1B36" }}
      >
        {/* Dot-grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Accent circle — bottom right */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-[0.04] border-[40px] border-white pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          <Image
            src="/images/coopbank-logo.png"
            alt="Cooperative Bank Tanzania"
            width={180}
            height={64}
            className="brightness-0 invert mb-12"
            priority
          />

          <h2 className="text-white text-2xl font-bold tracking-tight mb-2">
            Content Management
          </h2>
          <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-[280px]">
            Manage your website content — forex rates, job listings, tenders, blog posts and branch information.
          </p>

          {/* Module list */}
          <div className="space-y-0 border-t border-white/10">
            {MODULES.map(({ icon, label, owner }) => (
              <div key={label} className="flex items-center gap-4 py-3.5 border-b border-white/[0.07]">
                <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center text-white/60 flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <div className="text-white/90 text-sm font-semibold leading-none mb-0.5">{label}</div>
                  <div className="text-white/30 text-[11px]">{owner}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-[10px] tracking-widest uppercase">
          Cooperative Bank of Tanzania Plc
        </p>
      </div>

      {/* ── Right — login form ────────────────────────────────────────────── */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center px-8">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Image src="/images/coopbank-logo.png" alt="CoopBank" width={140} height={48} priority />
        </div>

        <div className="w-full max-w-[340px]">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[22px] font-bold text-[#0E1B36] tracking-tight">Staff Portal</h1>
            <p className="text-sm text-gray-400 mt-1">Sign in with your admin credentials</p>
          </div>

          {/* Error */}
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
