import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outbound notification mail for form submissions.
 *
 * PRIMARY: SMTP2GO HTTP API, sending as noreply@cbtbank.co.tz.
 *   cbtbank.co.tz is verified in SMTP2GO (DKIM CNAMEs added to the domain's
 *   DNS, which we control), so mail is DKIM-aligned to cbtbank.co.tz and passes
 *   their DMARC p=reject — it lands in info@/whistleblow@ instead of being
 *   filtered as foreign mail. HTTP API (not SMTP) avoids Cloud Run outbound-port
 *   issues. Configure via env:
 *     SMTP2GO_API_KEY   api-... key from the SMTP2GO dashboard
 *     MAIL_FROM         optional, default "CoopBank Website <noreply@cbtbank.co.tz>"
 *
 * FALLBACKS (only used if SMTP2GO is not configured):
 *   - Generic SMTP relay (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS) — e.g. the
 *     bank's own server or the SMTP2GO relay.
 *   - Resend (RESEND_API_KEY) — last resort.
 */

export type MailAttachment = { filename: string; content: string /* base64 */; mimetype?: string };

export type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: MailAttachment[];
};

export type SendResult = { ok: boolean; via: "smtp2go" | "smtp" | "resend" | "none"; error?: string };

const MAIL_FROM = process.env.MAIL_FROM || "CoopBank Website <noreply@cbtbank.co.tz>";
const RESEND_FROM = "CoopBank Website <noreply@sakuragroup.co.tz>";

function toArray(to: string | string[]): string[] {
  return Array.isArray(to) ? to : [to];
}

function guessMime(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop() || "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return map[ext] || "application/octet-stream";
}

// ─── SMTP2GO HTTP API (primary) ──────────────────────────────────────────────

async function sendViaSmtp2go(args: SendArgs): Promise<SendResult> {
  try {
    const body: Record<string, unknown> = {
      sender: MAIL_FROM,
      to: toArray(args.to),
      subject: args.subject,
      html_body: args.html,
    };
    if (args.replyTo) body.custom_headers = [{ header: "Reply-To", value: args.replyTo }];
    if (args.attachments?.length) {
      body.attachments = args.attachments.map((a) => ({
        filename: a.filename,
        fileblob: a.content,
        mimetype: a.mimetype || guessMime(a.filename),
      }));
    }

    const res = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Smtp2go-Api-Key": process.env.SMTP2GO_API_KEY as string,
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => ({}))) as {
      data?: { succeeded?: number; failed?: number; error?: string };
      errors?: unknown;
    };

    const succeeded = data?.data?.succeeded ?? 0;
    const failed = data?.data?.failed ?? 0;
    if (!res.ok || succeeded < 1 || failed > 0) {
      const error = JSON.stringify(data?.data?.error ?? data?.errors ?? data ?? `HTTP ${res.status}`);
      console.error("[mailer] SMTP2GO send failed:", error);
      return { ok: false, via: "smtp2go", error };
    }
    return { ok: true, via: "smtp2go" };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[mailer] SMTP2GO send error:", error);
    return { ok: false, via: "smtp2go", error };
  }
}

// ─── Generic SMTP relay (fallback) ───────────────────────────────────────────

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter: Transporter | null = null;
function getTransport(): Transporter {
  if (!transporter) {
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER as string, pass: process.env.SMTP_PASS as string },
    });
  }
  return transporter;
}

async function sendViaSmtp(args: SendArgs): Promise<SendResult> {
  try {
    await getTransport().sendMail({
      from: MAIL_FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
      replyTo: args.replyTo,
      attachments: args.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        encoding: "base64" as const,
      })),
    });
    return { ok: true, via: "smtp" };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[mailer] SMTP send failed:", error);
    return { ok: false, via: "smtp", error };
  }
}

// ─── Resend (last-resort fallback) ───────────────────────────────────────────

async function sendViaResend(args: SendArgs): Promise<SendResult> {
  try {
    const body: Record<string, unknown> = {
      from: RESEND_FROM,
      to: toArray(args.to),
      reply_to: args.replyTo,
      subject: args.subject,
      html: args.html,
    };
    if (args.attachments?.length) {
      body.attachments = args.attachments.map((a) => ({ filename: a.filename, content: a.content }));
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.text();
      console.error("[mailer] Resend send failed:", error);
      return { ok: false, via: "resend", error };
    }
    return { ok: true, via: "resend" };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[mailer] Resend send error:", error);
    return { ok: false, via: "resend", error };
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function sendNotificationEmail(args: SendArgs): Promise<SendResult> {
  if (process.env.SMTP2GO_API_KEY) return sendViaSmtp2go(args);
  if (smtpConfigured()) return sendViaSmtp(args);
  if (process.env.RESEND_API_KEY) return sendViaResend(args);

  console.error("[mailer] No email transport configured (SMTP2GO / SMTP / Resend all unset)");
  return { ok: false, via: "none", error: "No email transport configured" };
}
