import {
  UpdateSubscriptionData,
  UserSubscriptionRecord,
} from "@/types/subscriptions";
import { prisma } from "@/lib/db";

/**
 * Update user subscription data
 */
export async function updateUserSubscription(
  userId: string,
  data: UpdateSubscriptionData,
): Promise<UserSubscriptionRecord> {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.priceId) {
      updateData.stripePriceId = data.priceId;
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    return {
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripePriceId: user.stripePriceId,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
    };
  } catch (error) {
    console.error("Error updating user subscription:", error);
    throw new Error("Failed to update user subscription");
  }
}

/**
 * Update subscription period end
 */
export async function updateSubscriptionPeriod(
  subscriptionId: string,
  periodEnd: Date,
): Promise<UserSubscriptionRecord> {
  try {
    const user = await prisma.user.update({
      where: {
        stripeSubscriptionId: subscriptionId,
      },
      data: {
        stripeCurrentPeriodEnd: periodEnd,
      },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    return {
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripePriceId: user.stripePriceId,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
    };
  } catch (error) {
    console.error("Error updating subscription period:", error);
    throw new Error("Failed to update subscription period");
  }
}

/**
 * Update subscription price ID
 */
export async function updateSubscriptionPrice(
  subscriptionId: string,
  priceId: string,
): Promise<UserSubscriptionRecord> {
  try {
    const user = await prisma.user.update({
      where: {
        stripeSubscriptionId: subscriptionId,
      },
      data: {
        stripePriceId: priceId,
      },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    return {
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripePriceId: user.stripePriceId,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
    };
  } catch (error) {
    console.error("Error updating subscription price:", error);
    throw new Error("Failed to update subscription price");
  }
}
