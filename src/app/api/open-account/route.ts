import { NextRequest, NextResponse } from "next/server";

const ACCOUNT_LABELS: Record<string, string> = {
  "jasiri": "Jasiri Account (Youth 18–35)",
  "normal-savings": "Normal Savings Account",
  "mafao": "Mafao Account (Retirement)",
  "kilimo-tija": "Kilimo Tija Account (Farmers)",
  "msomi": "Msomi Account (Students)",
  "salary": "Salary Account",
  "mtoto": "Mtoto Account (Children)",
  "mama-africa": "Mama Africa Account",
  "baba-fedha": "Baba Fedha Account",
  "juhudi": "Juhudi Account",
  "fixed-deposit": "Fixed Deposit Account",
  "group-savings": "Group Savings Account",
  "cooperative-savings": "Cooperative Savings Account",
  "group-current": "Group Current Account",
  "individual-current": "Individual Current Account",
  "jasiri-current": "Jasiri Current Account",
  "enterprise-current": "Enterprise Current Account",
  "corporate-current": "Corporate Current Account",
};

function row(label: string, value: string) {
  return `<tr>
    <td style="background:#f4f6f9;font-weight:600;padding:8px 12px;width:35%;color:#1A1A2E;border-bottom:1px solid #e2e8f0;">${label}</td>
    <td style="padding:8px 12px;color:#2D3748;border-bottom:1px solid #e2e8f0;">${value || "—"}</td>
  </tr>`;
}

function section(title: string, rows: string) {
  return `
    <tr><td colspan="2" style="background:#1A56A0;color:#fff;font-weight:700;font-size:13px;padding:8px 12px;letter-spacing:0.05em;text-transform:uppercase;">${title}</td></tr>
    ${rows}
  `;
}

function buildEmailHtml(f: Record<string, string>, attachmentCount: number) {
  const accountLabel = ACCOUNT_LABELS[f.accountType] || f.accountType;
  return `
    <div style="font-family:sans-serif;max-width:680px;margin:0 auto;">
      <div style="background:#1A56A0;padding:24px 28px;border-radius:8px 8px 0 0;">
        <h2 style="color:#fff;margin:0;font-size:20px;">New Account Opening Application</h2>
        <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">Submitted via coopbanktanzania.co.tz on ${new Date().toLocaleString("en-TZ", { timeZone: "Africa/Dar_es_Salaam" })}</p>
      </div>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #e2e8f0;">
        ${section("Account Details", row("Account Type", accountLabel))}
        ${section("Personal Information", [
          row("Full Name", f.fullName),
          row("Date of Birth", f.dateOfBirth),
          row("Gender", f.gender),
          row("Nationality", f.nationality),
          row("Marital Status", f.maritalStatus),
        ].join(""))}
        ${section("Contact & Address", [
          row("Phone Number", f.phone),
          row("Email Address", f.email),
          row("Region", f.region),
          row("District", f.district),
          row("Ward", f.ward),
          row("Street / Mtaa", f.street),
        ].join(""))}
        ${section("Identity Document", [
          row("ID Type", f.idType),
          row("ID Number", f.idNumber),
          row("ID Expiry Date", f.idExpiry),
          row("Documents Attached", attachmentCount > 0 ? `${attachmentCount} file(s) attached` : "None"),
        ].join(""))}
        ${section("Employment & Financial", [
          row("Employment Status", f.employmentStatus),
          row("Employer / Business Name", f.employerName),
          row("Monthly Income Range", f.monthlyIncome),
        ].join(""))}
        ${section("Next of Kin", [
          row("Full Name", f.kinName),
          row("Phone Number", f.kinPhone),
          row("Relationship", f.kinRelationship),
        ].join(""))}
      </table>
      <div style="background:#f4f6f9;padding:12px 16px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none;">
        <p style="margin:0;font-size:11px;color:#718096;">
          ⚠️ Bank API integration pending — this application has been logged and emailed only.
          Ref: <strong>${Date.now()}</strong>
        </p>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const fields: Record<string, string> = {};
    const attachments: { filename: string; content: string; type: string }[] = [];

    for (const [key, value] of form.entries()) {
      if (typeof value === "string") {
        fields[key] = value;
      } else {
        const file = value as File;
        if (file.size > 0) {
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          attachments.push({
            filename: `${key}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
            content: base64,
            type: file.type || "application/octet-stream",
          });
        }
      }
    }

    // Required field validation
    const required = [
      "accountType", "fullName", "dateOfBirth", "gender", "nationality",
      "maritalStatus", "phone", "email", "region", "district",
      "idType", "idNumber", "employmentStatus", "kinName", "kinPhone", "kinRelationship",
    ];
    const missing = required.filter((f) => !fields[f]);
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
    }

    // Log submission (until bank API is ready)
    console.log("[ACCOUNT_APPLICATION]", JSON.stringify({
      ref: Date.now(),
      accountType: fields.accountType,
      fullName: fields.fullName,
      phone: fields.phone,
      email: fields.email,
      idType: fields.idType,
      idNumber: fields.idNumber,
      attachments: attachments.map((a) => a.filename),
      submittedAt: new Date().toISOString(),
    }));

    const html = buildEmailHtml(fields, attachments.length);

    const resendBody: Record<string, unknown> = {
      from: "CoopBank Website <noreply@sakuragroup.co.tz>",
      to: ["info@cbtbank.co.tz"],
      reply_to: fields.email,
      subject: `Account Application — ${fields.fullName} | ${ACCOUNT_LABELS[fields.accountType] ?? fields.accountType}`,
      html,
    };

    if (attachments.length > 0) {
      resendBody.attachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
      }));
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendBody),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[ACCOUNT_APPLICATION] Resend error:", err);
      return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ACCOUNT_APPLICATION] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
