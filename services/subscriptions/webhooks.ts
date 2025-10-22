import { retrieveSubscription } from "@/clients/stripe";
import {
  updateSubscriptionPeriod,
  updateSubscriptionPrice,
  updateUserOnSubscriptionCreate,
} from "@/repositories/subscriptions";
import Stripe from "stripe";

import {
  SubscriptionData,
  SubscriptionServiceResponse,
} from "@/types/subscriptions";

/**
 * Handle Stripe webhook events
 */
export async function handleWebhookEvent(
  event: Stripe.Event,
): Promise<SubscriptionServiceResponse> {
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return {
      success: true,
      data: {
        eventType: event.type,
        processed: true,
      },
    };
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return {
      success: false,
      error: "Failed to handle webhook event",
    };
  }
}

/**
 * Handle checkout session completed event
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  try {
    if (!session.subscription || !session.metadata?.userId) {
      throw new Error("Missing subscription or userId in checkout session");
    }

    // Retrieve the subscription details from Stripe
    const subscription = await retrieveSubscription(
      session.subscription as string,
    );

    // Prepare subscription data
    const subscriptionData: SubscriptionData = {
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      priceId: subscription.items.data[0].price.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };

    // Update the user subscription in our database
    await updateUserOnSubscriptionCreate(
      session.metadata.userId,
      subscriptionData,
    );
  } catch (error) {
    console.error("Error handling checkout completed:", error);
    throw error;
  }
}

/**
 * Handle payment succeeded event
 */
export async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
): Promise<void> {
  try {
    // If the billing reason is not subscription_create, it means the customer has updated their subscription
    if (invoice.billing_reason !== "subscription_create") {
      if (!invoice.subscription) {
        throw new Error("Missing subscription in invoice");
      }

      // Retrieve the subscription details from Stripe
      const subscription = await retrieveSubscription(
        invoice.subscription as string,
      );

      // Update the price id and set the new period end
      await updateSubscriptionPrice(
        subscription.id,
        subscription.items.data[0].price.id,
      );
      await updateSubscriptionPeriod(
        subscription.id,
        new Date(subscription.current_period_end * 1000),
      );
    }
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
    throw error;
  }
}
