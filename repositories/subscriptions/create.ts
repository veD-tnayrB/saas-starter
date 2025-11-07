import { sql } from "kysely";

import {
  ICreateSubscriptionData,
  ISubscriptionData,
  IUserSubscriptionRecord,
} from "@/types/subscriptions";
import { db } from "@/lib/db";

/**
 * Create new subscription record
 */
export async function createUserSubscription(
  data: ICreateSubscriptionData,
): Promise<IUserSubscriptionRecord> {
  try {
    // Build SET clause parts using sql fragments for proper sanitization
    const setParts = [
      sql.raw("updated_at = CURRENT_TIMESTAMP"),
      sql`stripe_price_id = ${data.priceId ?? null}`,
    ];

    if (data.metadata?.customerId) {
      setParts.push(sql`stripe_customer_id = ${data.metadata.customerId}`);
    }

    // Combine all SET parts safely
    const setClause = sql.join(setParts, sql`, `);

    const result = await sql<IUserSubscriptionRecord>`
      UPDATE users
      SET ${setClause}
      WHERE id = ${data.userId}
      RETURNING 
        id AS "userId",
        stripe_customer_id AS "stripeCustomerId",
        stripe_subscription_id AS "stripeSubscriptionId",
        stripe_price_id AS "stripePriceId",
        stripe_current_period_end AS "stripeCurrentPeriodEnd"
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("User not found");

    return row;
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
  subscriptionData: ISubscriptionData,
): Promise<IUserSubscriptionRecord> {
  try {
    const result = await sql<IUserSubscriptionRecord>`
      UPDATE users
      SET 
        stripe_subscription_id = ${subscriptionData.subscriptionId ?? null},
        stripe_customer_id = ${subscriptionData.customerId ?? null},
        stripe_price_id = ${subscriptionData.priceId ?? null},
        stripe_current_period_end = ${subscriptionData.currentPeriodEnd ?? null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING 
        id AS "userId",
        stripe_customer_id AS "stripeCustomerId",
        stripe_subscription_id AS "stripeSubscriptionId",
        stripe_price_id AS "stripePriceId",
        stripe_current_period_end AS "stripeCurrentPeriodEnd"
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("User not found");

    return row;
  } catch (error) {
    console.error("Error updating user on subscription create:", error);
    throw new Error("Failed to update user on subscription create");
  }
}
