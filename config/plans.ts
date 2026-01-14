// Plan features configuration
import { ISubscriptionPlan as IPublicSubscriptionPlan } from "@/types";
import { ISubscriptionPlan as IRepoSubscriptionPlan } from "@/repositories/permissions/plans";

export const PLAN_FEATURES: Record<
  string,
  { name: string; features: string[]; limits: string[] }
> = {
  free: {
    name: "Free",
    features: ["1 team member", "Basic analytics", "Community support"],
    limits: ["No additional members", "Limited features"],
  },
  pro: {
    name: "Pro",
    features: [
      "Up to 10 team members",
      "Advanced analytics",
      "Priority email support",
      "Custom roles",
      "Audit logs",
    ],
    limits: ["10 member limit"],
  },
  business: {
    name: "Business",
    features: [
      "Unlimited team members",
      "Advanced analytics",
      "24/7 priority support",
      "Custom roles",
      "Audit logs",
      "SSO (coming soon)",
      "Advanced security",
    ],
    limits: [],
  },
};

/**
 * Transforms a repository-level ISubscriptionPlan into a public-facing ISubscriptionPlan
 * by adding benefits, limitations, and prices based on PLAN_FEATURES.
 */
export function transformRepositoryPlanToPublicPlan(
  repoPlan: IRepoSubscriptionPlan,
): IPublicSubscriptionPlan {
  const config = PLAN_FEATURES[repoPlan.name] || {
    name: repoPlan.displayName,
    features: [],
    limits: [],
  };

  return {
    id: repoPlan.id,
    name: repoPlan.name, // Map name
    title: repoPlan.displayName,
    displayName: repoPlan.displayName, // Map displayName
    description: repoPlan.description || "",
    benefits: config.features,
    limitations: config.limits,
    prices: {
      monthly: 0, // Assuming prices are handled elsewhere or are 0 for free plans
      yearly: 0, // Adjust this if price data is available in repoPlan
    },
    stripeIds: {
      monthly: repoPlan.stripePriceIdMonthly,
      yearly: repoPlan.stripePriceIdYearly,
    },
    // Add other fields from IPublicSubscriptionPlan that are not in IRepoSubscriptionPlan
    // and provide sensible defaults or mapping logic
  };
}
