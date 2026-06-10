import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "Minds in Motion <hello@mindsinmotionglobal.org>",
    to: "greg@mindsinmotionglobal.org",
    replyTo: email,
    subject: `New message: ${subject}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">

        <!-- Header -->
        <tr><td style="background:#0a0a0a;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4)">Minds in Motion</p>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff">New Contact Message</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 40px">

          <!-- Sender meta -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:28px">
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;width:90px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e4e4e7">From</td>
              <td style="padding:12px 16px;font-size:14px;color:#09090b;font-weight:500;border-bottom:1px solid #e4e4e7">${name}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e4e4e7">Email</td>
              <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7">
                <a href="mailto:${email}" style="font-size:14px;color:#09090b;text-decoration:none">${email}</a>
              </td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em">Subject</td>
              <td style="padding:12px 16px;font-size:14px;color:#09090b">${subject}</td>
            </tr>
          </table>

          <!-- Message -->
          <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em">Message</p>
          <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:20px 24px">
            <p style="margin:0;font-size:15px;line-height:1.7;color:#09090b;white-space:pre-wrap">${message}</p>
          </div>

          <!-- Reply CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
            <tr><td align="center">
              <a href="mailto:${email}?subject=Re: ${subject}" style="display:inline-block;background:#09090b;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px">
                Reply to ${name}
              </a>
            </td></tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#fafafa;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center">
          <p style="margin:0;font-size:12px;color:#a1a1aa">
            Sent via the contact form at
            <a href="https://mindsinmotionglobal.org" style="color:#09090b;text-decoration:none">mindsinmotionglobal.org</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
