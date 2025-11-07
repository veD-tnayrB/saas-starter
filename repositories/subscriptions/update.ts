import { sql } from "kysely";

import {
  UpdateSubscriptionData,
  UserSubscriptionRecord,
} from "@/types/subscriptions";
import { db } from "@/lib/db";

/**
 * Update user subscription data
 */
export async function updateUserSubscription(
  userId: string,
  data: UpdateSubscriptionData,
): Promise<UserSubscriptionRecord> {
  try {
    const setParts: string[] = ["updated_at = CURRENT_TIMESTAMP"];

    if (data.priceId !== undefined) {
      setParts.push(`stripe_price_id = ${sql.lit(data.priceId ?? null)}`);
    }

    const result = await sql<{
      id: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      stripe_price_id: string | null;
      stripe_current_period_end: Date | null;
    }>`
      UPDATE users
      SET ${sql.raw(setParts.join(", "))}
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
    const result = await sql<{
      id: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      stripe_price_id: string | null;
      stripe_current_period_end: Date | null;
    }>`
      UPDATE users
      SET 
        stripe_current_period_end = ${periodEnd},
        updated_at = CURRENT_TIMESTAMP
      WHERE stripe_subscription_id = ${subscriptionId}
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
    const result = await sql<{
      id: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      stripe_price_id: string | null;
      stripe_current_period_end: Date | null;
    }>`
      UPDATE users
      SET 
        stripe_price_id = ${priceId},
        updated_at = CURRENT_TIMESTAMP
      WHERE stripe_subscription_id = ${subscriptionId}
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
    console.error("Error updating subscription price:", error);
    throw new Error("Failed to update subscription price");
  }
}
