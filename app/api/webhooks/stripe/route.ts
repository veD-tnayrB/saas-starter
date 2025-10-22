import { headers } from "next/headers";
import { handleWebhookEvent } from "@/services/subscriptions";
import Stripe from "stripe";

import { env } from "@/env.mjs";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Handle webhook event using the service layer
  const result = await handleWebhookEvent(event);

  if (!result.success) {
    console.error("Webhook processing failed:", result.error);
    return new Response(`Webhook processing failed: ${result.error}`, {
      status: 500,
    });
  }

  return new Response(null, { status: 200 });
}
