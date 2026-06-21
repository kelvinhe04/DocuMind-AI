import Stripe from "stripe";

// Singleton para uso en Server Components / API Routes
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
