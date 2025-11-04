import { prisma } from "@/clients/db";

import {
  CreateSubscriptionData,
  SubscriptionData,
  UserSubscriptionRecord,
} from "@/types/subscriptions";

/**
 * Create new subscription record
 */
export async function createUserSubscription(
  data: CreateSubscriptionData,
): Promise<UserSubscriptionRecord> {
  try {
    const user = await prisma.user.update({
      where: {
        id: data.userId,
      },
      data: {
        stripeCustomerId: data.metadata?.customerId || null,
        stripePriceId: data.priceId,
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
    console.error("Error creating user subscription:", error);
    throw new Error("Failed to create user subscription");
  }
}

/**
 * Update user with new subscription data after successful checkout
 */
export async function updateUserOnSubscriptionCreate(
  userId: string,
  subscriptionData: SubscriptionData,
): Promise<UserSubscriptionRecord> {
  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stripeSubscriptionId: subscriptionData.subscriptionId,
        stripeCustomerId: subscriptionData.customerId,
        stripePriceId: subscriptionData.priceId,
        stripeCurrentPeriodEnd: subscriptionData.currentPeriodEnd,
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
    console.error("Error updating user on subscription create:", error);
    throw new Error("Failed to update user on subscription create");
  }
}
