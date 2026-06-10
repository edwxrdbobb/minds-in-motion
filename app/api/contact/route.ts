import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "Minds in Motion <onboarding@resend.dev>",
    to: "digitalavatarsl@gmail.com",
    replyTo: email,
    subject: `[Contact] ${subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#111;border-bottom:1px solid #eee;padding-bottom:12px">
          New message from mindsinmotion.org
        </h2>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 0;color:#555;width:80px">Name</td>
            <td style="padding:8px 0;color:#111;font-weight:600">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#555">Email</td>
            <td style="padding:8px 0">
              <a href="mailto:${email}" style="color:#111">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#555">Subject</td>
            <td style="padding:8px 0;color:#111">${subject}</td>
          </tr>
        </table>
        <div style="margin-top:16px;background:#f9f9f9;border-radius:8px;padding:16px">
          <p style="color:#555;margin:0 0 6px;font-size:13px">Message</p>
          <p style="color:#111;margin:0;white-space:pre-wrap">${message}</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
