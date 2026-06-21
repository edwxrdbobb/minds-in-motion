import Stripe from "stripe";
import { Resend } from "resend";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      await sendDonationEmails(session);
    }
  }

  return NextResponse.json({ received: true });
}

async function sendDonationEmails(session: Stripe.Checkout.Session) {
  const amount = (session.amount_total ?? 0) / 100;
  const currency = (session.currency ?? "gbp").toUpperCase();
  const donorName = session.metadata?.donor_name || "A donor";
  const donorEmail =
    session.customer_details?.email ??
    session.customer_email ??
    session.metadata?.donor_email ??
    null;
  const message = session.metadata?.message || "";
  const formattedAmount = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);

  try {
    await resend.emails.send({
      from: "Minds in Motion <hello@mindsinmotionglobal.org>",
      to: "greg@mindsinmotionglobal.org",
      subject: `New donation: ${formattedAmount} from ${donorName}`,
      html: notificationEmail({ donorName, donorEmail, formattedAmount, message }),
    });
  } catch (err) {
    console.error("Failed to send donor-notification email:", err);
  }

  if (donorEmail) {
    try {
      await resend.emails.send({
        from: "Minds in Motion <hello@mindsinmotionglobal.org>",
        to: donorEmail,
        subject: "Thank you for your donation to Minds in Motion",
        html: thankYouEmail({ donorName, formattedAmount }),
      });
    } catch (err) {
      console.error("Failed to send donor thank-you email:", err);
    }
  }
}

function notificationEmail({
  donorName,
  donorEmail,
  formattedAmount,
  message,
}: {
  donorName: string;
  donorEmail: string | null;
  formattedAmount: string;
  message: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">

        <tr><td style="background:#0a0a0a;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4)">Minds in Motion</p>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff">New Donation Received</h1>
        </td></tr>

        <tr><td style="background:#ffffff;padding:36px 40px">

          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:28px">
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;width:90px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e4e4e7">Amount</td>
              <td style="padding:12px 16px;font-size:14px;color:#09090b;font-weight:600;border-bottom:1px solid #e4e4e7">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #e4e4e7">Donor</td>
              <td style="padding:12px 16px;font-size:14px;color:#09090b;border-bottom:1px solid #e4e4e7">${donorName}</td>
            </tr>
            <tr style="background:#fafafa">
              <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em">Email</td>
              <td style="padding:12px 16px;font-size:14px">
                ${donorEmail ? `<a href="mailto:${donorEmail}" style="color:#09090b;text-decoration:none">${donorEmail}</a>` : "Not provided"}
              </td>
            </tr>
          </table>

          ${
            message
              ? `<p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em">Message</p>
          <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:20px 24px">
            <p style="margin:0;font-size:15px;line-height:1.7;color:#09090b;white-space:pre-wrap">${message}</p>
          </div>`
              : ""
          }

        </td></tr>

        <tr><td style="background:#fafafa;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center">
          <p style="margin:0;font-size:12px;color:#a1a1aa">
            Sent via the donation checkout at
            <a href="https://mindsinmotionglobal.org" style="color:#09090b;text-decoration:none">mindsinmotionglobal.org</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
}

function thankYouEmail({
  donorName,
  formattedAmount,
}: {
  donorName: string;
  formattedAmount: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">

        <tr><td style="background:#0a0a0a;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4)">Minds in Motion</p>
          <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff">Thank You for Your Donation!</h1>
        </td></tr>

        <tr><td style="background:#ffffff;padding:36px 40px">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#09090b">Dear ${donorName},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#09090b">
            Thank you for your generous donation of <strong>${formattedAmount}</strong> to Minds in Motion.
            Your contribution helps bring chess programs to communities in Nepal, Ghana, and beyond &mdash;
            fostering critical thinking, resilience, and connection among youth.
          </p>
          <p style="margin:0;font-size:15px;line-height:1.7;color:#09090b">
            With gratitude,<br />The Minds in Motion Team
          </p>
        </td></tr>

        <tr><td style="background:#fafafa;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center">
          <p style="margin:0;font-size:12px;color:#a1a1aa">
            Minds in Motion &middot; 501(c)(3) nonprofit &middot;
            <a href="https://mindsinmotionglobal.org" style="color:#09090b;text-decoration:none">mindsinmotionglobal.org</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
}
