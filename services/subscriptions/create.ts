import { createCheckoutSession } from "@/clients/stripe";
import { findUserSubscription } from "@/repositories/subscriptions";

import {
  CheckoutSessionData,
  SubscriptionServiceResponse,
} from "@/types/subscriptions";

import { findPlanByPriceId, validatePriceId } from "./helpers";

/**
 * Create new subscription for user
 */
export async function createSubscription(
  userId: string,
  priceId: string,
  userEmail: string,
): Promise<SubscriptionServiceResponse<{ url: string }>> {
  try {
    // Validate inputs
    if (!userId || !priceId || !userEmail) {
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

    // Validate subscription creation
    const isValid = await validateSubscriptionCreation(userId, priceId);
    if (!isValid) {
      return {
        success: false,
        error: "User is not eligible for subscription creation",
      };
    }

    // Get user data for checkout session
    const user = await findUserSubscription(userId);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Create checkout session data
    const checkoutData: CheckoutSessionData = {
      priceId,
      customerEmail: userEmail,
      successUrl: `${process.env.NEXTAUTH_URL}/pricing`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/pricing`,
      metadata: {
        userId,
      },
    };

    // Create Stripe checkout session
    const session = await createCheckoutSession(checkoutData);

    return {
      success: true,
      data: {
        url: session.url!,
      },
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      success: false,
      error: "Failed to create subscription",
    };
  }
}

/**
 * Validate subscription creation eligibility
 */
export async function validateSubscriptionCreation(
  userId: string,
  priceId: string,
): Promise<boolean> {
  try {
    // Check if user exists and is eligible
    const user = await findUserSubscription(userId);
    if (!user) {
      return false;
    }

    // Check if user already has an active subscription
    if (user.stripeSubscriptionId && user.stripeCurrentPeriodEnd) {
      const isActive =
        user.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now();
      if (isActive) {
        return false; // User already has active subscription
      }
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

    return true;
  } catch (error) {
    console.error("Error validating subscription creation:", error);
    return false;
  }
}
