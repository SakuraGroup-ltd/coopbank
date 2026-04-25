import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, email, region, district, ward, street, businessType, businessName, comments } = body;

    if (!fullName || !phone || !email || !region || !district || !businessType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const html = `
      <h2>New CoopWakala Agent Application</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
        <tr><td style="background:#f4f6f9;font-weight:bold;width:35%">Full Name</td><td>${fullName}</td></tr>
        <tr><td style="background:#f4f6f9;font-weight:bold">Phone Number</td><td>${phone}</td></tr>
        <tr><td style="background:#f4f6f9;font-weight:bold">Email Address</td><td>${email}</td></tr>
        <tr><td style="background:#f4f6f9;font-weight:bold">Region</td><td>${region}</td></tr>
        <tr><td style="background:#f4f6f9;font-weight:bold">District</td><td>${district}</td></tr>
        <tr><td style="background:#f4f6f9;font-weight:bold">Ward</td><td>${ward || "—"}</td></tr>
        <tr><td style="background:#f4f6f9;font-weight:bold">Street</td><td>${street || "—"}</td></tr>
        <tr><td style="background:#f4f6f9;font-weight:bold">Type of Business</td><td>${businessType}</td></tr>
        <tr><td style="background:#f4f6f9;font-weight:bold">Business Name</td><td>${businessName || "—"}</td></tr>
        <tr><td style="background:#f4f6f9;font-weight:bold">Additional Comments</td><td>${comments || "—"}</td></tr>
      </table>
      <p style="margin-top:16px;color:#666;font-size:12px;">Submitted via coopbanktanzania.co.tz</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CoopBank Website <noreply@sakuragroup.co.tz>",
        to: ["info@cbtbank.co.tz"],
        reply_to: email,
        subject: `CoopWakala Agent Application — ${fullName}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Wakala application error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
