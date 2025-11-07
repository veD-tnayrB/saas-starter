import { retrieveSubscription } from "@/clients/stripe";
import { findProjectById } from "@/repositories/projects/project";
import { findUserSubscription } from "@/repositories/subscriptions";

import { IUserSubscriptionPlan } from "@/types/subscriptions";

import {
  determinePlanInterval,
  findPlanByPriceId,
  formatSubscriptionPlan,
  getDefaultPlan,
  isSubscriptionActive,
} from "./helpers";

/**
 * Get project subscription plan with all details
 * Falls back to owner's Stripe subscription if project has no plan assigned
 */
export async function getProjectSubscriptionPlan(
  projectId: string,
): Promise<IUserSubscriptionPlan> {
  if (!projectId) {
    throw new Error("Missing projectId parameter");
  }

  // Get project with subscription plan
  const project = await findProjectById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  // If project has a plan assigned, use it
  if (project.subscriptionPlan) {
    const projectPlan = project.subscriptionPlan;
    // Get owner's Stripe subscription for payment status
    const owner = await findUserSubscription(project.ownerId);
    const isPaid = Boolean(
      owner?.stripePriceId &&
        isSubscriptionActive(owner.stripeCurrentPeriodEnd),
    );

    // Map project plan to UserSubscriptionPlan format
    const userPlan = findPlanByPriceId(
      projectPlan.stripePriceIdMonthly || projectPlan.stripePriceIdYearly || "",
    );

    const plan = userPlan || getDefaultPlan();

    const interval = owner?.stripePriceId
      ? determinePlanInterval(owner.stripePriceId)
      : null;

    let isCanceled = false;
    if (isPaid && owner?.stripeSubscriptionId) {
      try {
        const stripePlan = await retrieveSubscription(
          owner.stripeSubscriptionId,
        );
        isCanceled = stripePlan.cancel_at_period_end;
      } catch (error) {
        console.error("Error retrieving Stripe subscription:", error);
      }
    }

    return formatSubscriptionPlan(
      owner || {
        userId: project.ownerId,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      },
      plan,
      isPaid,
      interval,
      isCanceled,
    );
  }

  // Fallback to owner's Stripe subscription
  const owner = await findUserSubscription(project.ownerId);

  if (!owner) {
    // No owner subscription, return default plan
    return formatSubscriptionPlan(
      {
        userId: project.ownerId,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      },
      getDefaultPlan(),
      false,
      null,
      false,
    );
  }

  // Check if owner is on a paid plan
  const isPaid = Boolean(
    owner.stripePriceId && isSubscriptionActive(owner.stripeCurrentPeriodEnd),
  );

  // Find the pricing data corresponding to the owner's plan
  const userPlan = owner.stripePriceId
    ? findPlanByPriceId(owner.stripePriceId)
    : null;
  const plan = isPaid && userPlan ? userPlan : getDefaultPlan();

  // Determine interval
  const interval = owner.stripePriceId
    ? determinePlanInterval(owner.stripePriceId)
    : null;

  // Check cancellation status
  let isCanceled = false;
  if (isPaid && owner.stripeSubscriptionId) {
    try {
      const stripePlan = await retrieveSubscription(owner.stripeSubscriptionId);
      isCanceled = stripePlan.cancel_at_period_end;
    } catch (error) {
      console.error("Error retrieving Stripe subscription:", error);
    }
  }

  // Format and return the subscription plan
  return formatSubscriptionPlan(owner, plan, isPaid, interval, isCanceled);
}

/**
 * @deprecated Use getProjectSubscriptionPlan instead. This function is kept for backward compatibility.
 * Get user subscription plan with all details (uses user's first project)
 */
export async function getUserSubscriptionPlan(
  userId: string,
): Promise<IUserSubscriptionPlan> {
  if (!userId) {
    throw new Error("Missing userId parameter");
  }

  // Get user's first project
  const user = await findUserSubscription(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // For backward compatibility, we'll use the user's Stripe subscription directly
  // In the future, this should be refactored to require a projectId
  const isPaid = Boolean(
    user.stripePriceId && isSubscriptionActive(user.stripeCurrentPeriodEnd),
  );

  const userPlan = user.stripePriceId
    ? findPlanByPriceId(user.stripePriceId)
    : null;
  const plan = isPaid && userPlan ? userPlan : getDefaultPlan();

  const interval = user.stripePriceId
    ? determinePlanInterval(user.stripePriceId)
    : null;

  let isCanceled = false;
  if (isPaid && user.stripeSubscriptionId) {
    try {
      const stripePlan = await retrieveSubscription(user.stripeSubscriptionId);
      isCanceled = stripePlan.cancel_at_period_end;
    } catch (error) {
      console.error("Error retrieving Stripe subscription:", error);
    }
  }

  return formatSubscriptionPlan(user, plan, isPaid, interval, isCanceled);
}
