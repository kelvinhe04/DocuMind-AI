import { auth, clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import type { PlanId } from "@/lib/plans";

const VALID_PLANS: PlanId[] = ["free", "starter", "business", "enterprise"];

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const { sessionId, plan } = await req.json();
  if (!sessionId || !plan) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }
  if (!VALID_PLANS.includes(plan as PlanId)) {
    return NextResponse.json({ error: "invalid plan" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ ok: false, reason: "not paid" }, { status: 402 });
  }
  // Extra security: ensure the checkout belongs to this user
  if (session.client_reference_id && session.client_reference_id !== userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { plan: plan as PlanId },
  });

  return NextResponse.json({ ok: true, plan });
}
