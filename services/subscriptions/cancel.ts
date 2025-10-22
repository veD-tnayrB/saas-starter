import { cancelSubscription as cancelStripeSubscription } from "@/clients/stripe";
import {
  cancelUserSubscription,
  findUserByStripeSubscriptionId,
} from "@/repositories/subscriptions";

import { SubscriptionServiceResponse } from "@/types/subscriptions";

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
): Promise<SubscriptionServiceResponse> {
  try {
    // Validate inputs
    if (!subscriptionId) {
      return {
        success: false,
        error: "Missing subscription ID",
      };
    }

    // Validate subscription cancellation
    const isValid = await validateSubscriptionCancellation(subscriptionId);
    if (!isValid) {
      return {
        success: false,
        error: "Subscription cancellation is not valid",
      };
    }

    // Cancel subscription in Stripe
    const stripeSubscription = await cancelStripeSubscription(subscriptionId);

    // Update user subscription in database
    const user = await findUserByStripeSubscriptionId(subscriptionId);
    if (user) {
      await cancelUserSubscription(user.userId);
    }

    return {
      success: true,
      data: {
        subscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        canceledAt: stripeSubscription.canceled_at,
      },
    };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return {
      success: false,
      error: "Failed to cancel subscription",
    };
  }
}

/**
 * Validate subscription cancellation
 */
export async function validateSubscriptionCancellation(
  subscriptionId: string,
): Promise<boolean> {
  try {
    // Check if subscription exists
    const user = await findUserByStripeSubscriptionId(subscriptionId);
    if (!user) {
      return false;
    }

    // Check if subscription is already canceled
    if (!user.stripeSubscriptionId) {
      return false; // Already canceled
    }

    return true;
  } catch (error) {
    console.error("Error validating subscription cancellation:", error);
    return false;
  }
}
