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
    const result = await sql<{
      id: string;
      name: string;
      display_name: string;
      description: string | null;
      stripe_price_id_monthly: string | null;
      stripe_price_id_yearly: string | null;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT *
      FROM subscription_plans
      ORDER BY name ASC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      stripePriceIdMonthly: row.stripe_price_id_monthly,
      stripePriceIdYearly: row.stripe_price_id_yearly,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
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
    const result = await sql<{
      id: string;
      name: string;
      display_name: string;
      description: string | null;
      stripe_price_id_monthly: string | null;
      stripe_price_id_yearly: string | null;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT *
      FROM subscription_plans
      WHERE is_active = true
      ORDER BY name ASC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      stripePriceIdMonthly: row.stripe_price_id_monthly,
      stripePriceIdYearly: row.stripe_price_id_yearly,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
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
    const result = await sql<{
      id: string;
      name: string;
      display_name: string;
      description: string | null;
      stripe_price_id_monthly: string | null;
      stripe_price_id_yearly: string | null;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT *
      FROM subscription_plans
      WHERE id = ${planId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      stripePriceIdMonthly: row.stripe_price_id_monthly,
      stripePriceIdYearly: row.stripe_price_id_yearly,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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
    const result = await sql<{
      id: string;
      name: string;
      display_name: string;
      description: string | null;
      stripe_price_id_monthly: string | null;
      stripe_price_id_yearly: string | null;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT *
      FROM subscription_plans
      WHERE name = ${name}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      stripePriceIdMonthly: row.stripe_price_id_monthly,
      stripePriceIdYearly: row.stripe_price_id_yearly,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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
    const result = await sql<{
      id: string;
      name: string;
      display_name: string;
      description: string | null;
      stripe_price_id_monthly: string | null;
      stripe_price_id_yearly: string | null;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT *
      FROM subscription_plans
      WHERE stripe_price_id_monthly = ${priceId}
         OR stripe_price_id_yearly = ${priceId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      stripePriceIdMonthly: row.stripe_price_id_monthly,
      stripePriceIdYearly: row.stripe_price_id_yearly,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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
      subscription_plan_id: string | null;
    }>`
      SELECT subscription_plan_id
      FROM projects
      WHERE id = ${projectId}
      LIMIT 1
    `.execute(db);

    const project = projectResult.rows[0];
    if (!project || !project.subscription_plan_id) return null;

    return await findPlanById(project.subscription_plan_id);
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

    const result = await sql<{
      id: string;
      name: string;
      display_name: string;
      description: string | null;
      stripe_price_id_monthly: string | null;
      stripe_price_id_yearly: string | null;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
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
      RETURNING *
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Failed to create plan");

    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      stripePriceIdMonthly: row.stripe_price_id_monthly,
      stripePriceIdYearly: row.stripe_price_id_yearly,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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
    const setParts: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    if (data.name !== undefined) {
      setParts.push(`name = ${sql.lit(data.name)}`);
    }
    if (data.displayName !== undefined) {
      setParts.push(`display_name = ${sql.lit(data.displayName)}`);
    }
    if (data.description !== undefined) {
      setParts.push(`description = ${sql.lit(data.description ?? null)}`);
    }
    if (data.stripePriceIdMonthly !== undefined) {
      setParts.push(
        `stripe_price_id_monthly = ${sql.lit(data.stripePriceIdMonthly ?? null)}`,
      );
    }
    if (data.stripePriceIdYearly !== undefined) {
      setParts.push(
        `stripe_price_id_yearly = ${sql.lit(data.stripePriceIdYearly ?? null)}`,
      );
    }
    if (data.isActive !== undefined) {
      setParts.push(`is_active = ${sql.lit(data.isActive)}`);
    }

    const result = await sql<{
      id: string;
      name: string;
      display_name: string;
      description: string | null;
      stripe_price_id_monthly: string | null;
      stripe_price_id_yearly: string | null;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      UPDATE subscription_plans
      SET ${sql.raw(setParts.join(", "))}
      WHERE id = ${planId}
      RETURNING *
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Plan not found");

    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      stripePriceIdMonthly: row.stripe_price_id_monthly,
      stripePriceIdYearly: row.stripe_price_id_yearly,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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
