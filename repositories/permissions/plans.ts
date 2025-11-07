import { randomUUID } from "crypto";
import { sql } from "kysely";

import { db } from "@/lib/db";

export interface ISubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionPlanCreateData {
  name: string;
  displayName: string;
  description?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  isActive?: boolean;
}

export interface ISubscriptionPlanUpdateData {
  name?: string;
  displayName?: string;
  description?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  isActive?: boolean;
}

/**
 * Find all plans
 */
export async function findAllPlans(): Promise<ISubscriptionPlan[]> {
  try {
    const result = await sql<ISubscriptionPlan>`
      SELECT 
        id,
        name,
        display_name AS displayName,
        description,
        stripe_price_id_monthly AS stripePriceIdMonthly,
        stripe_price_id_yearly AS stripePriceIdYearly,
        is_active AS isActive,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM subscription_plans
      ORDER BY name ASC
    `.execute(db);

    return result.rows;
  } catch (error) {
    console.error("Error finding all plans:", error);
    throw new Error("Failed to find plans");
  }
}

/**
 * Find active plans only
 */
export async function findActivePlans(): Promise<ISubscriptionPlan[]> {
  try {
    const result = await sql<ISubscriptionPlan>`
      SELECT 
        id,
        name,
        display_name AS displayName,
        description,
        stripe_price_id_monthly AS stripePriceIdMonthly,
        stripe_price_id_yearly AS stripePriceIdYearly,
        is_active AS isActive,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM subscription_plans
      WHERE is_active = true
      ORDER BY name ASC
    `.execute(db);

    return result.rows;
  } catch (error) {
    console.error("Error finding active plans:", error);
    throw new Error("Failed to find active plans");
  }
}

/**
 * Find plan by ID
 */
export async function findPlanById(
  planId: string,
): Promise<ISubscriptionPlan | null> {
  try {
    const result = await sql<ISubscriptionPlan>`
      SELECT 
        id,
        name,
        display_name AS displayName,
        description,
        stripe_price_id_monthly AS stripePriceIdMonthly,
        stripe_price_id_yearly AS stripePriceIdYearly,
        is_active AS isActive,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM subscription_plans
      WHERE id = ${planId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
  } catch (error) {
    console.error("Error finding plan by ID:", error);
    throw new Error("Failed to find plan");
  }
}

/**
 * Find plan by name
 */
export async function findPlanByName(
  name: string,
): Promise<ISubscriptionPlan | null> {
  try {
    const result = await sql<ISubscriptionPlan>`
      SELECT 
        id,
        name,
        display_name AS displayName,
        description,
        stripe_price_id_monthly AS stripePriceIdMonthly,
        stripe_price_id_yearly AS stripePriceIdYearly,
        is_active AS isActive,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM subscription_plans
      WHERE name = ${name}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
  } catch (error) {
    console.error("Error finding plan by name:", error);
    throw new Error("Failed to find plan");
  }
}

/**
 * Find plan by Stripe price ID
 */
export async function findPlanByStripePriceId(
  priceId: string,
): Promise<ISubscriptionPlan | null> {
  try {
    const result = await sql<ISubscriptionPlan>`
      SELECT 
        id,
        name,
        display_name AS displayName,
        description,
        stripe_price_id_monthly AS stripePriceIdMonthly,
        stripe_price_id_yearly AS stripePriceIdYearly,
        is_active AS isActive,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM subscription_plans
      WHERE stripe_price_id_monthly = ${priceId}
         OR stripe_price_id_yearly = ${priceId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
  } catch (error) {
    console.error("Error finding plan by Stripe price ID:", error);
    throw new Error("Failed to find plan");
  }
}

/**
 * Get project's subscription plan
 */
export async function getProjectSubscriptionPlan(
  projectId: string,
): Promise<ISubscriptionPlan | null> {
  try {
    const projectResult = await sql<{
      subscriptionPlanId: string | null;
    }>`
      SELECT subscription_plan_id AS subscriptionPlanId
      FROM projects
      WHERE id = ${projectId}
      LIMIT 1
    `.execute(db);

    const project = projectResult.rows[0];
    if (!project || !project.subscriptionPlanId) return null;

    return await findPlanById(project.subscriptionPlanId);
  } catch (error) {
    console.error("Error getting project subscription plan:", error);
    throw new Error("Failed to get project subscription plan");
  }
}

/**
 * Create a new plan
 */
export async function createPlan(
  data: ISubscriptionPlanCreateData,
): Promise<ISubscriptionPlan> {
  try {
    const id = randomUUID();

    const result = await sql<ISubscriptionPlan>`
      INSERT INTO subscription_plans (
        id,
        name,
        display_name,
        description,
        stripe_price_id_monthly,
        stripe_price_id_yearly,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        ${id},
        ${data.name},
        ${data.displayName},
        ${data.description ?? null},
        ${data.stripePriceIdMonthly ?? null},
        ${data.stripePriceIdYearly ?? null},
        ${data.isActive ?? true},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING 
        id,
        name,
        display_name AS displayName,
        description,
        stripe_price_id_monthly AS stripePriceIdMonthly,
        stripe_price_id_yearly AS stripePriceIdYearly,
        is_active AS isActive,
        created_at AS createdAt,
        updated_at AS updatedAt
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Failed to create plan");

    return row;
  } catch (error) {
    console.error("Error creating plan:", error);
    throw new Error("Failed to create plan");
  }
}

/**
 * Update a plan
 */
export async function updatePlan(
  planId: string,
  data: ISubscriptionPlanUpdateData,
): Promise<ISubscriptionPlan> {
  try {
    // Build SET clause parts using sql fragments for proper sanitization
    const setParts = [sql.raw("updated_at = CURRENT_TIMESTAMP")];
    if (data.name !== undefined) {
      setParts.push(sql`name = ${data.name}`);
    }
    if (data.displayName !== undefined) {
      setParts.push(sql`display_name = ${data.displayName}`);
    }
    if (data.description !== undefined) {
      setParts.push(sql`description = ${data.description ?? null}`);
    }
    if (data.stripePriceIdMonthly !== undefined) {
      setParts.push(
        sql`stripe_price_id_monthly = ${data.stripePriceIdMonthly ?? null}`,
      );
    }
    if (data.stripePriceIdYearly !== undefined) {
      setParts.push(
        sql`stripe_price_id_yearly = ${data.stripePriceIdYearly ?? null}`,
      );
    }
    if (data.isActive !== undefined) {
      setParts.push(sql`is_active = ${data.isActive}`);
    }

    // Combine all SET parts safely
    const setClause = sql.join(setParts, sql`, `);

    const result = await sql<ISubscriptionPlan>`
      UPDATE subscription_plans
      SET ${setClause}
      WHERE id = ${planId}
      RETURNING 
        id,
        name,
        display_name AS displayName,
        description,
        stripe_price_id_monthly AS stripePriceIdMonthly,
        stripe_price_id_yearly AS stripePriceIdYearly,
        is_active AS isActive,
        created_at AS createdAt,
        updated_at AS updatedAt
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Plan not found");

    return row;
  } catch (error) {
    console.error("Error updating plan:", error);
    throw new Error("Failed to update plan");
  }
}

/**
 * Delete a plan
 */
export async function deletePlan(planId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM subscription_plans
      WHERE id = ${planId}
    `.execute(db);
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw new Error("Failed to delete plan");
  }
}

/**
 * Assign plan to project
 */
export async function assignPlanToProject(
  projectId: string,
  planId: string,
): Promise<void> {
  try {
    await sql`
      UPDATE projects
      SET 
        subscription_plan_id = ${planId},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${projectId}
    `.execute(db);
  } catch (error) {
    console.error("Error assigning plan to project:", error);
    throw new Error("Failed to assign plan to project");
  }
}
