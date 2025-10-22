import { UserSubscriptionRecord } from "@/types/subscriptions";
import { prisma } from "@/lib/db";

/**
 * Find user subscription data by user ID
 */
export async function findUserSubscription(
  userId: string,
): Promise<UserSubscriptionRecord | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripePriceId: user.stripePriceId,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
    };
  } catch (error) {
    console.error("Error finding user subscription:", error);
    throw new Error("Failed to find user subscription");
  }
}

/**
 * Find user by Stripe customer ID
 */
export async function findUserByStripeCustomerId(
  customerId: string,
): Promise<UserSubscriptionRecord | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        stripeCustomerId: customerId,
      },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripePriceId: user.stripePriceId,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
    };
  } catch (error) {
    console.error("Error finding user by Stripe customer ID:", error);
    throw new Error("Failed to find user by Stripe customer ID");
  }
}

/**
 * Find user by Stripe subscription ID
 */
export async function findUserByStripeSubscriptionId(
  subscriptionId: string,
): Promise<UserSubscriptionRecord | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        stripeSubscriptionId: subscriptionId,
      },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripePriceId: user.stripePriceId,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
    };
  } catch (error) {
    console.error("Error finding user by Stripe subscription ID:", error);
    throw new Error("Failed to find user by Stripe subscription ID");
  }
}
