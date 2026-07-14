// Public contact-form submission: validate → honeypot → per-IP rate limit →
// store in contact-messages → best-effort email notify (never blocks).
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "../../../../payload.config";
import { sendNotificationEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory, per-instance limiter — best effort on Cloud Run, good enough to
// stop naive scripts. 5 submissions per IP per hour.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) {
    // Evict only IPs with no in-window hits — a full clear() would reset
    // active counters and open a burst window.
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, string> | null;
    if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    // Honeypot filled → pretend success, store nothing.
    if ((body.website || "").trim()) return NextResponse.json({ success: true });

    const name = (body.name || "").trim().replace(/[\r\n]+/g, " ").slice(0, 120);
    const email = (body.email || "").trim().slice(0, 160);
    const phone = (body.phone || "").trim().slice(0, 30);
    const subject = (body.subject || "").trim().replace(/[\r\n]+/g, " ").slice(0, 160);
    const message = (body.message || "").trim().slice(0, 4000);
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Please fill in your name, email, subject and message." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Cloudflare fronts the site; CF-Connecting-IP is the trusted client IP.
    // Leftmost X-Forwarded-For is client-spoofable — use it only as fallback.
    const ip =
      req.headers.get("cf-connecting-ip") ||
      (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (rateLimited(ip)) {
      return NextResponse.json({ error: "Too many messages — please try again later." }, { status: 429 });
    }

    const payload = await getPayload({ config });
    await payload.create({
      // Not yet in generated payload-types (migration not applied) — cast
      // mirrors src/app/api/whistleblower/route.ts's pattern for new slugs.
      collection: "contact-messages" as Parameters<typeof payload.create>[0]["collection"],
      overrideAccess: true,
      data: { name, email, phone, subject, message, status: "new" },
    });

    // Best-effort notify — the message is already stored either way.
    try {
      const settings = await payload.findGlobal({ slug: "site-settings" }).catch(() => null);
      const to =
        (settings as { contact?: { contactFormEmail?: string; email?: string } } | null)?.contact
          ?.contactFormEmail ||
        (settings as { contact?: { email?: string } } | null)?.contact?.email ||
        "info@cbtbank.co.tz";
      const mail = await sendNotificationEmail({
        to,
        replyTo: email,
        subject: `Website contact: ${subject}`,
        html: `<div style="font-family:sans-serif">
          <h3>New message from the CoopBank website contact form</h3>
          <p><b>Name:</b> ${esc(name)}<br/>
             <b>Email:</b> ${esc(email)}<br/>
             ${phone ? `<b>Phone:</b> ${esc(phone)}<br/>` : ""}
             <b>Subject:</b> ${esc(subject)}</p>
          <p style="white-space:pre-wrap">${esc(message)}</p>
          <p>Manage in <b>Studio → Contact messages</b>.</p>
        </div>`,
      });
      if (!mail.ok) console.error("[CONTACT] notification email not sent:", mail.error);
    } catch (mailErr) {
      console.error("[CONTACT] notification email failed", mailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CONTACT] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please email us directly." }, { status: 500 });
  }
}
