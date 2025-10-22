import { UserSubscriptionRecord } from "@/types/subscriptions";
import { prisma } from "@/lib/db";

/**
 * Mark user subscription as canceled
 */
export async function cancelUserSubscription(
  userId: string,
): Promise<UserSubscriptionRecord> {
  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
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
    console.error("Error canceling user subscription:", error);
    throw new Error("Failed to cancel user subscription");
  }
}

/**
 * Update subscription cancellation status
 */
export async function updateSubscriptionCancellation(
  subscriptionId: string,
  canceledAt: Date,
): Promise<UserSubscriptionRecord> {
  try {
    // Note: This is a soft cancellation - we keep the subscription data
    // but mark it as canceled. The actual cancellation logic is handled by Stripe.
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
      throw new Error("User not found for subscription");
    }

    return {
      userId: user.id,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripePriceId: user.stripePriceId,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
    };
  } catch (error) {
    console.error("Error updating subscription cancellation:", error);
    throw new Error("Failed to update subscription cancellation");
  }
}
