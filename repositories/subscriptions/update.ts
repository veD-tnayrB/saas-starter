import { sql } from "kysely";

import {
  IUpdateSubscriptionData,
  IUserSubscriptionRecord,
} from "@/types/subscriptions";
import { db } from "@/lib/db";

/**
 * Update user subscription data
 */
export async function updateUserSubscription(
  userId: string,
  data: IUpdateSubscriptionData,
): Promise<IUserSubscriptionRecord> {
  try {
    // Build SET clause parts using sql fragments for proper sanitization
    const setParts = [sql.raw("updated_at = CURRENT_TIMESTAMP")];

    if (data.priceId !== undefined) {
      setParts.push(sql`stripe_price_id = ${data.priceId ?? null}`);
    }

    // Combine all SET parts safely
    const setClause = sql.join(setParts, sql`, `);

    const result = await sql<IUserSubscriptionRecord>`
      UPDATE users
      SET ${setClause}
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
): Promise<IUserSubscriptionRecord> {
  try {
    const result = await sql<IUserSubscriptionRecord>`
      UPDATE users
      SET 
        stripe_current_period_end = ${periodEnd},
        updated_at = CURRENT_TIMESTAMP
      WHERE stripe_subscription_id = ${subscriptionId}
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
): Promise<IUserSubscriptionRecord> {
  try {
    const result = await sql<IUserSubscriptionRecord>`
      UPDATE users
      SET 
        stripe_price_id = ${priceId},
        updated_at = CURRENT_TIMESTAMP
      WHERE stripe_subscription_id = ${subscriptionId}
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
    console.error("Error updating subscription price:", error);
    throw new Error("Failed to update subscription price");
  }
}
