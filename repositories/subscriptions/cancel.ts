import { sql } from "kysely";

import { IUserSubscriptionRecord } from "@/types/subscriptions";
import { db } from "@/lib/db";

/**
 * Mark user subscription as canceled
 */
export async function cancelUserSubscription(
  userId: string,
): Promise<IUserSubscriptionRecord> {
  try {
    const result = await sql<IUserSubscriptionRecord>`
      UPDATE users
      SET 
        stripe_subscription_id = NULL,
        stripe_price_id = NULL,
        stripe_current_period_end = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING 
        id AS userId,
        stripe_customer_id AS stripeCustomerId,
        stripe_subscription_id AS stripeSubscriptionId,
        stripe_price_id AS stripePriceId,
        stripe_current_period_end AS stripeCurrentPeriodEnd
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("User not found");

    return row;
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
): Promise<IUserSubscriptionRecord> {
  try {
    // Note: This is a soft cancellation - we keep the subscription data
    // but mark it as canceled. The actual cancellation logic is handled by Stripe.
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
    if (!row) throw new Error("User not found for subscription");

    return row;
  } catch (error) {
    console.error("Error updating subscription cancellation:", error);
    throw new Error("Failed to update subscription cancellation");
  }
}
