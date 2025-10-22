import {
  SubscriptionPlan,
  UserSubscriptionPlan,
  UserSubscriptionRecord,
} from "@/types/subscriptions";
import { pricingData } from "@/config/subscriptions";

/**
 * Check if subscription is active based on period end
 */
export function isSubscriptionActive(periodEnd: Date | null): boolean {
  if (!periodEnd) return false;

  // Add 1 day grace period (86,400,000 milliseconds)
  const gracePeriod = 86_400_000;
  return periodEnd.getTime() + gracePeriod > Date.now();
}

/**
 * Determine plan interval (monthly/yearly) based on price ID
 */
export function determinePlanInterval(
  priceId: string,
): "month" | "year" | null {
  const plan = findPlanByPriceId(priceId);
  if (!plan) return null;

  if (plan.stripeIds.monthly === priceId) {
    return "month";
  } else if (plan.stripeIds.yearly === priceId) {
    return "year";
  }

  return null;
}

/**
 * Find plan configuration by price ID
 */
export function findPlanByPriceId(priceId: string): SubscriptionPlan | null {
  return (
    pricingData.find((plan) => plan.stripeIds.monthly === priceId) ||
    pricingData.find((plan) => plan.stripeIds.yearly === priceId) ||
    null
  );
}

/**
 * Format subscription plan data for user consumption
 */
export function formatSubscriptionPlan(
  user: UserSubscriptionRecord,
  plan: SubscriptionPlan,
  isPaid: boolean,
  interval: "month" | "year" | null,
  isCanceled: boolean,
): UserSubscriptionPlan {
  return {
    ...plan,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId,
    stripePriceId: user.stripePriceId,
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd?.getTime() || null,
    isPaid,
    interval,
    isCanceled,
  };
}

/**
 * Validate Stripe price ID format
 */
export function validatePriceId(priceId: string): boolean {
  // Basic validation - Stripe price IDs start with 'price_'
  return typeof priceId === "string" && priceId.startsWith("price_");
}

/**
 * Calculate grace period in days until expiration
 */
export function calculateGracePeriod(periodEnd: Date | null): number {
  if (!periodEnd) return 0;

  const now = new Date();
  const diffTime = periodEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Get default plan (Starter plan)
 */
export function getDefaultPlan(): SubscriptionPlan {
  return pricingData[0]; // Starter plan
}
