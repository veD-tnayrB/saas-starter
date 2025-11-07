import Stripe from "stripe";

import {
  ICheckoutSessionData,
  IUpdateSubscriptionData,
} from "@/types/subscriptions";

import { stripe } from "./client";

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  data: ICheckoutSessionData,
): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: data.customerEmail,
      line_items: [
        {
          price: data.priceId,
          quantity: 1,
        },
      ],
      metadata: data.metadata,
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Failed to create checkout session");
  }
}

/**
 * Create Stripe billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    throw new Error("Failed to create billing portal session");
  }
}

/**
 * Retrieve subscription from Stripe
 */
export async function retrieveSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    throw new Error("Failed to retrieve subscription");
  }
}

/**
 * Update subscription in Stripe
 */
export async function updateSubscription(
  subscriptionId: string,
  data: IUpdateSubscriptionData,
): Promise<Stripe.Subscription> {
  try {
    const updateData: Stripe.SubscriptionUpdateParams = {};

    if (data.priceId) {
      updateData.items = [
        {
          price: data.priceId,
        },
      ];
    }

    if (data.cancelAtPeriodEnd !== undefined) {
      updateData.cancel_at_period_end = data.cancelAtPeriodEnd;
    }

    if (data.prorationBehavior) {
      updateData.proration_behavior = data.prorationBehavior;
    }

    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      updateData,
    );
    return subscription;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw new Error("Failed to update subscription");
  }
}

/**
 * Cancel subscription in Stripe
 */
export async function cancelSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
}
