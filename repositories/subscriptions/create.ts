import { sql } from "kysely";

import {
  CreateSubscriptionData,
  SubscriptionData,
  UserSubscriptionRecord,
} from "@/types/subscriptions";
import { db } from "@/lib/db";

/**
 * Create new subscription record
 */
export async function createUserSubscription(
  data: CreateSubscriptionData,
): Promise<UserSubscriptionRecord> {
  try {
    const setParts: string[] = [
      "updated_at = CURRENT_TIMESTAMP",
      `stripe_price_id = ${sql.lit(data.priceId ?? null)}`,
    ];

    if (data.metadata?.customerId) {
      setParts.push(
        `stripe_customer_id = ${sql.lit(data.metadata.customerId)}`,
      );
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
      WHERE id = ${data.userId}
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
    const result = await sql<{
      id: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      stripe_price_id: string | null;
      stripe_current_period_end: Date | null;
    }>`
      UPDATE users
      SET 
        stripe_subscription_id = ${subscriptionData.subscriptionId ?? null},
        stripe_customer_id = ${subscriptionData.customerId ?? null},
        stripe_price_id = ${subscriptionData.priceId ?? null},
        stripe_current_period_end = ${subscriptionData.currentPeriodEnd ?? null},
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
    console.error("Error updating user on subscription create:", error);
    throw new Error("Failed to update user on subscription create");
  }
}
