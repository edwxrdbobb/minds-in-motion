import Stripe from "stripe";
type UiMode = Stripe.Checkout.SessionCreateParams.UiMode;
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { amount, name, email, message, origin } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: "elements" as UiMode,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Donation to Minds in Motion",
              description: "Supporting chess programs in Nepal, Ghana, and beyond",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      return_url: `${origin}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        donor_name: name,
        donor_email: email,
        message: message || "",
      },
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
