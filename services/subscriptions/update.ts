import { updateSubscription as updateStripeSubscription } from "@/clients/stripe";
import {
  findUserByStripeSubscriptionId,
  updateUserSubscription,
} from "@/repositories/subscriptions";

import {
  SubscriptionServiceResponse,
  UpdateSubscriptionData,
} from "@/types/subscriptions";

import { findPlanByPriceId, validatePriceId } from "./helpers";

/**
 * Update existing subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  priceId: string,
): Promise<SubscriptionServiceResponse> {
  try {
    // Validate inputs
    if (!subscriptionId || !priceId) {
      return {
        success: false,
        error: "Missing required parameters",
      };
    }

    // Validate price ID format
    if (!validatePriceId(priceId)) {
      return {
        success: false,
        error: "Invalid price ID format",
      };
    }

    // Check if plan exists
    const plan = findPlanByPriceId(priceId);
    if (!plan) {
      return {
        success: false,
        error: "Plan not found",
      };
    }

    // Validate subscription update
    const isValid = await validateSubscriptionUpdate(subscriptionId, priceId);
    if (!isValid) {
      return {
        success: false,
        error: "Subscription update is not valid",
      };
    }

    // Update subscription in Stripe
    const updateData: UpdateSubscriptionData = {
      priceId,
      prorationBehavior: "create_prorations",
    };

    const stripeSubscription = await updateStripeSubscription(
      subscriptionId,
      updateData,
    );

    // Update user subscription in database
    const user = await findUserByStripeSubscriptionId(subscriptionId);
    if (user) {
      await updateUserSubscription(user.userId, { priceId });
    }

    return {
      success: true,
      data: {
        subscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
      },
    };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return {
      success: false,
      error: "Failed to update subscription",
    };
  }
}

/**
 * Validate subscription update
 */
export async function validateSubscriptionUpdate(
  subscriptionId: string,
  priceId: string,
): Promise<boolean> {
  try {
    // Check if subscription exists
    const user = await findUserByStripeSubscriptionId(subscriptionId);
    if (!user) {
      return false;
    }

    // Check if price ID is valid
    if (!validatePriceId(priceId)) {
      return false;
    }

    // Check if plan exists
    const plan = findPlanByPriceId(priceId);
    if (!plan) {
      return false;
    }

    // Check if user is trying to update to the same plan
    if (user.stripePriceId === priceId) {
      return false; // No need to update to the same plan
    }

    return true;
  } catch (error) {
    console.error("Error validating subscription update:", error);
    return false;
  }
}
