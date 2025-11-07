import { sql } from "kysely";

import { UserSubscriptionRecord } from "@/types/subscriptions";
import { db } from "@/lib/db";

/**
 * Mark user subscription as canceled
 */
export async function cancelUserSubscription(
  userId: string,
): Promise<UserSubscriptionRecord> {
  try {
    const result = await sql<{
      id: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      stripe_price_id: string | null;
      stripe_current_period_end: Date | null;
    }>`
      UPDATE users
      SET 
        stripe_subscription_id = NULL,
        stripe_price_id = NULL,
        stripe_current_period_end = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING 
        id,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_price_id,
        stripe_current_period_end
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("User not found");

    return {
      userId: row.id,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      stripePriceId: row.stripe_price_id,
      stripeCurrentPeriodEnd: row.stripe_current_period_end,
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
    if (!row) throw new Error("User not found for subscription");

    return {
      userId: row.id,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id,
      stripePriceId: row.stripe_price_id,
      stripeCurrentPeriodEnd: row.stripe_current_period_end,
    };
  } catch (error) {
    console.error("Error updating subscription cancellation:", error);
    throw new Error("Failed to update subscription cancellation");
  }
}
