"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { GA_ID, pageview, trackEvent } from "@/lib/gtag";

// Fires a page_view on first load AND on every client-side route change,
// so single-page navigations between marketing pages are all measured.
function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!GA_ID) return;
    const qs = searchParams?.toString();
    pageview(pathname + (qs ? `?${qs}` : ""));
  }, [pathname, searchParams]);
  return null;
}

// Site-wide delegation: captures the important actions without editing every
// page. Add data-analytics="event_name" to any element to override naming.
function InteractionTracker() {
  useEffect(() => {
    if (!GA_ID) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest("a, button") as HTMLElement | null;
      if (!el) return;
      const anchor = el.closest("a") as HTMLAnchorElement | null;
      const href = anchor?.getAttribute("href") || "";
      const label = (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 100);

      const custom = el.getAttribute("data-analytics");
      if (custom) return trackEvent(custom, { label, link: href });

      if (href.startsWith("tel:")) return trackEvent("contact_click", { method: "phone", value: href.replace("tel:", ""), label });
      if (href.startsWith("mailto:")) return trackEvent("contact_click", { method: "email", value: href.replace("mailto:", ""), label });
      if (/wa\.me|whatsapp/i.test(href)) return trackEvent("contact_click", { method: "whatsapp", label });
      if (/coopnet|internet[-_.]?bank|online[-_.]?bank|\bib\b|ibank/i.test(href)) return trackEvent("internet_banking_click", { link: href, label });
      if (/apply|open[-_ ]?account|loan|account[-_]?opening/i.test(label) || /open-account|\/apply/i.test(href)) return trackEvent("cta_click", { cta: label, link: href });
    };

    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement | null;
      if (!form) return;
      const name = form.getAttribute("name") || form.getAttribute("id") || form.getAttribute("data-form") || "form";
      trackEvent("form_submit", { form_name: name, page: window.location.pathname });
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);
  return null;
}

export default function Analytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-config" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { send_page_view: false });`}
      </Script>
      <Suspense fallback={null}>
        <RouteTracker />
      </Suspense>
      <InteractionTracker />
    </>
  );
}
