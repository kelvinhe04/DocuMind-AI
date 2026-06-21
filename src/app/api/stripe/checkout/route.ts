import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import type { PlanId } from "@/lib/plans";

// Maps plan id → Stripe price id (server-side only — never exposed to client)
const PRICE_IDS: Partial<Record<PlanId, string>> = {
  starter: process.env.STRIPE_PRICE_STARTER ?? "",
  business: process.env.STRIPE_PRICE_BUSINESS ?? "",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE ?? "",
};

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "stripe_not_configured", hint: "Add STRIPE_SECRET_KEY to .env.local" },
      { status: 503 },
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const { plan } = await req.json() as { plan: PlanId };
  if (!plan) return NextResponse.json({ error: "missing plan" }, { status: 400 });

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: "price_not_configured", hint: `Add STRIPE_PRICE_${plan.toUpperCase()} to .env.local` },
      { status: 422 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
    cancel_url: `${appUrl}/billing?canceled=1`,
    client_reference_id: userId,
  });

  return NextResponse.json({ url: session.url });
}
