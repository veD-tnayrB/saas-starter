import { sql } from "kysely";

import { IUserSubscriptionRecord } from "@/types/subscriptions";
import { db } from "@/lib/db";

/**
 * Find user subscription data by user ID
 */
export async function findUserSubscription(
  userId: string,
): Promise<IUserSubscriptionRecord | null> {
  try {
    const result = await sql<IUserSubscriptionRecord>`
      SELECT 
        id AS userId,
        stripe_customer_id AS stripeCustomerId,
        stripe_subscription_id AS stripeSubscriptionId,
        stripe_price_id AS stripePriceId,
        stripe_current_period_end AS stripeCurrentPeriodEnd
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
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
): Promise<IUserSubscriptionRecord | null> {
  try {
    const result = await sql<IUserSubscriptionRecord>`
      SELECT 
        id AS userId,
        stripe_customer_id AS stripeCustomerId,
        stripe_subscription_id AS stripeSubscriptionId,
        stripe_price_id AS stripePriceId,
        stripe_current_period_end AS stripeCurrentPeriodEnd
      FROM users
      WHERE stripe_customer_id = ${customerId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
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
): Promise<IUserSubscriptionRecord | null> {
  try {
    const result = await sql<IUserSubscriptionRecord>`
      SELECT 
        id AS userId,
        stripe_customer_id AS stripeCustomerId,
        stripe_subscription_id AS stripeSubscriptionId,
        stripe_price_id AS stripePriceId,
        stripe_current_period_end AS stripeCurrentPeriodEnd
      FROM users
      WHERE stripe_subscription_id = ${subscriptionId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
  } catch (error) {
    console.error("Error finding user by Stripe subscription ID:", error);
    throw new Error("Failed to find user by Stripe subscription ID");
  }
}
