import { sql } from "kysely";

import { UserSubscriptionRecord } from "@/types/subscriptions";
import { db } from "@/lib/db";

/**
 * Find user subscription data by user ID
 */
export async function findUserSubscription(
  userId: string,
): Promise<UserSubscriptionRecord | null> {
  try {
    const result = await sql<{
      id: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      stripe_price_id: string | null;
      stripe_current_period_end: Date | null;
    }>`
      SELECT 
        id,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_price_id,
        stripe_current_period_end
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      userId: row.id,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      stripePriceId: row.stripe_price_id,
      stripeCurrentPeriodEnd: row.stripe_current_period_end,
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
    const result = await sql<{
      id: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      stripe_price_id: string | null;
      stripe_current_period_end: Date | null;
    }>`
      SELECT 
        id,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_price_id,
        stripe_current_period_end
      FROM users
      WHERE stripe_customer_id = ${customerId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      userId: row.id,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      stripePriceId: row.stripe_price_id,
      stripeCurrentPeriodEnd: row.stripe_current_period_end,
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
    const result = await sql<{
      id: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      stripe_price_id: string | null;
      stripe_current_period_end: Date | null;
    }>`
      SELECT 
        id,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_price_id,
        stripe_current_period_end
      FROM users
      WHERE stripe_subscription_id = ${subscriptionId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      userId: row.id,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      stripePriceId: row.stripe_price_id,
      stripeCurrentPeriodEnd: row.stripe_current_period_end,
    };
  } catch (error) {
    console.error("Error finding user by Stripe subscription ID:", error);
    throw new Error("Failed to find user by Stripe subscription ID");
  }
}
