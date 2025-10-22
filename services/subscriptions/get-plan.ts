import { retrieveSubscription } from "@/clients/stripe";
import { findUserSubscription } from "@/repositories/subscriptions";

import { UserSubscriptionPlan } from "@/types/subscriptions";

import {
  determinePlanInterval,
  findPlanByPriceId,
  formatSubscriptionPlan,
  getDefaultPlan,
  isSubscriptionActive,
} from "./helpers";

/**
 * Get user subscription plan with all details
 */
export async function getUserSubscriptionPlan(
  userId: string,
): Promise<UserSubscriptionPlan> {
  if (!userId) {
    throw new Error("Missing parameters");
  }

  // Get user subscription data from database
  const user = await findUserSubscription(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is on a paid plan
  const isPaid = Boolean(
    user.stripePriceId && isSubscriptionActive(user.stripeCurrentPeriodEnd),
  );

  // Find the pricing data corresponding to the user's plan
  const userPlan = user.stripePriceId
    ? findPlanByPriceId(user.stripePriceId)
    : null;
  const plan = isPaid && userPlan ? userPlan : getDefaultPlan();

  // Determine interval
  const interval =
    isPaid && user.stripePriceId
      ? determinePlanInterval(user.stripePriceId)
      : null;

  // Check cancellation status
  let isCanceled = false;
  if (isPaid && user.stripeSubscriptionId) {
    try {
      const stripePlan = await retrieveSubscription(user.stripeSubscriptionId);
      isCanceled = stripePlan.cancel_at_period_end;
    } catch (error) {
      console.error("Error retrieving Stripe subscription:", error);
      // Continue without cancellation status if Stripe call fails
    }
  }

  // Format and return the subscription plan
  return formatSubscriptionPlan(user, plan, isPaid, interval, isCanceled);
}
