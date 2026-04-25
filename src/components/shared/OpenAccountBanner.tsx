"use client";

import { useRouter } from "next/navigation";

export default function OpenAccountBanner() {
  const router = useRouter();

  function handleOpenAccount() {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) {
      window.open(
        "https://play.google.com/store/apps/details?id=tz.co.coopbank.coopesa&hl=en",
        "_blank",
        "noopener"
      );
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      window.open(
        "https://apps.apple.com/tz/app/coopesa/id6755827543",
        "_blank",
        "noopener"
      );
    } else {
      router.push("/open-account");
    }
  }

  return (
    <section className="bg-[#1A8A3A]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            Open your account with CoopBank
          </h3>
          <p className="text-sm text-white/70 mt-1">
            Apply online in minutes — no branch visit needed
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleOpenAccount}
            className="inline-flex items-center px-6 py-2.5 rounded-full border-2 border-white text-sm font-bold text-white hover:bg-white hover:text-[#1A8A3A] transition-colors"
          >
            Open an Account
          </button>
        </div>
      </div>
    </section>
  );
}
