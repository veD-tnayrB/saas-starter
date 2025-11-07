import { randomUUID } from "crypto";
import { sql } from "kysely";

import { db } from "@/lib/db";

/**
 * Subscription plan data transfer object
 */
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

/**
 * Project data transfer object
 */
export interface IProject {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlanId?: string;
  subscriptionPlan?: ISubscriptionPlan;
}

/**
 * Project creation data
 */
export interface IProjectCreateData {
  name: string;
  ownerId: string;
}

/**
 * Project update data
 */
export interface IProjectUpdateData {
  name?: string;
}

/**
 * Find project by ID
 */
export async function findProjectById(id: string): Promise<IProject | null> {
  try {
    const result = await sql<{
      id: string;
      name: string;
      owner_id: string;
      created_at: Date;
      updated_at: Date;
      subscription_plan_id: string | null;
      plan_id: string | null;
      plan_name: string | null;
      plan_display_name: string | null;
      plan_description: string | null;
      plan_stripe_price_id_monthly: string | null;
      plan_stripe_price_id_yearly: string | null;
      plan_is_active: boolean | null;
      plan_created_at: Date | null;
      plan_updated_at: Date | null;
    }>`
      SELECT
        p.id,
        p.name,
        p.owner_id,
        p.created_at,
        p.updated_at,
        p.subscription_plan_id,
        sp.id as plan_id,
        sp.name as plan_name,
        sp.display_name as plan_display_name,
        sp.description as plan_description,
        sp.stripe_price_id_monthly as plan_stripe_price_id_monthly,
        sp.stripe_price_id_yearly as plan_stripe_price_id_yearly,
        sp.is_active as plan_is_active,
        sp.created_at as plan_created_at,
        sp.updated_at as plan_updated_at
      FROM projects p
      LEFT JOIN subscription_plans sp ON sp.id = p.subscription_plan_id
      WHERE p.id = ${id}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      subscriptionPlanId: row.subscription_plan_id ?? undefined,
      subscriptionPlan: row.plan_id
        ? {
            id: row.plan_id,
            name: row.plan_name!,
            displayName: row.plan_display_name!,
            description: row.plan_description,
            stripePriceIdMonthly: row.plan_stripe_price_id_monthly,
            stripePriceIdYearly: row.plan_stripe_price_id_yearly,
            isActive: row.plan_is_active ?? false,
            createdAt: row.plan_created_at!,
            updatedAt: row.plan_updated_at!,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error finding project by ID:", error);
    throw new Error("Failed to find project");
  }
}

/**
 * Find projects by owner ID
 */
export async function findProjectsByOwner(
  ownerId: string,
): Promise<IProject[]> {
  try {
    const result = await sql<{
      id: string;
      name: string;
      owner_id: string;
      created_at: Date;
      updated_at: Date;
      subscription_plan_id: string | null;
      plan_id: string | null;
      plan_name: string | null;
      plan_display_name: string | null;
      plan_description: string | null;
      plan_stripe_price_id_monthly: string | null;
      plan_stripe_price_id_yearly: string | null;
      plan_is_active: boolean | null;
      plan_created_at: Date | null;
      plan_updated_at: Date | null;
    }>`
      SELECT 
        p.id,
        p.name,
        p.owner_id,
        p.created_at,
        p.updated_at,
        p.subscription_plan_id,
        sp.id as plan_id,
        sp.name as plan_name,
        sp.display_name as plan_display_name,
        sp.description as plan_description,
        sp.stripe_price_id_monthly as plan_stripe_price_id_monthly,
        sp.stripe_price_id_yearly as plan_stripe_price_id_yearly,
        sp.is_active as plan_is_active,
        sp.created_at as plan_created_at,
        sp.updated_at as plan_updated_at
      FROM projects p
      LEFT JOIN subscription_plans sp ON sp.id = p.subscription_plan_id
      WHERE p.owner_id = ${ownerId}
      ORDER BY p.created_at DESC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      subscriptionPlanId: row.subscription_plan_id ?? undefined,
      subscriptionPlan: row.plan_id
        ? {
            id: row.plan_id,
            name: row.plan_name!,
            displayName: row.plan_display_name!,
            description: row.plan_description,
            stripePriceIdMonthly: row.plan_stripe_price_id_monthly,
            stripePriceIdYearly: row.plan_stripe_price_id_yearly,
            isActive: row.plan_is_active ?? false,
            createdAt: row.plan_created_at!,
            updatedAt: row.plan_updated_at!,
          }
        : undefined,
    }));
  } catch (error) {
    console.error("Error finding projects by owner:", error);
    throw new Error("Failed to find projects");
  }
}

/**
 * Count projects owned by user
 */
export async function countProjectsByOwner(ownerId: string): Promise<number> {
  try {
    const result = await sql<{ count: string }>`
      SELECT COUNT(*)::text as count
      FROM projects
      WHERE owner_id = ${ownerId}
    `.execute(db);

    return parseInt(result.rows[0]?.count || "0", 10);
  } catch (error) {
    console.error("Error counting projects by owner:", error);
    throw new Error("Failed to count projects");
  }
}

/**
 * Find projects by user ID (as member)
 */
export async function findProjectsByUserId(
  userId: string,
): Promise<IProject[]> {
  try {
    const result = await sql<{
      id: string;
      name: string;
      owner_id: string;
      created_at: Date;
      updated_at: Date;
      subscription_plan_id: string | null;
      plan_id: string | null;
      plan_name: string | null;
      plan_display_name: string | null;
      plan_description: string | null;
      plan_stripe_price_id_monthly: string | null;
      plan_stripe_price_id_yearly: string | null;
      plan_is_active: boolean | null;
      plan_created_at: Date | null;
      plan_updated_at: Date | null;
    }>`
      SELECT 
        p.id,
        p.name,
        p.owner_id,
        p.created_at,
        p.updated_at,
        p.subscription_plan_id,
        sp.id as plan_id,
        sp.name as plan_name,
        sp.display_name as plan_display_name,
        sp.description as plan_description,
        sp.stripe_price_id_monthly as plan_stripe_price_id_monthly,
        sp.stripe_price_id_yearly as plan_stripe_price_id_yearly,
        sp.is_active as plan_is_active,
        sp.created_at as plan_created_at,
        sp.updated_at as plan_updated_at
      FROM projects p
      INNER JOIN project_members pm ON pm.project_id = p.id
      LEFT JOIN subscription_plans sp ON sp.id = p.subscription_plan_id
      WHERE pm.user_id = ${userId}
      ORDER BY p.created_at DESC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      subscriptionPlanId: row.subscription_plan_id ?? undefined,
      subscriptionPlan: row.plan_id
        ? {
            id: row.plan_id,
            name: row.plan_name!,
            displayName: row.plan_display_name!,
            description: row.plan_description,
            stripePriceIdMonthly: row.plan_stripe_price_id_monthly,
            stripePriceIdYearly: row.plan_stripe_price_id_yearly,
            isActive: row.plan_is_active ?? false,
            createdAt: row.plan_created_at!,
            updatedAt: row.plan_updated_at!,
          }
        : undefined,
    }));
  } catch (error) {
    console.error("Error finding projects by user ID:", error);
    throw new Error("Failed to find projects");
  }
}

/**
 * Find all projects for a user (owned + member)
 */
export async function findAllUserProjects(userId: string): Promise<IProject[]> {
  try {
    const [owned, member] = await Promise.all([
      findProjectsByOwner(userId),
      findProjectsByUserId(userId),
    ]);

    // Combine and deduplicate
    const allProjects = [...owned, ...member];
    const uniqueProjects = Array.from(
      new Map(allProjects.map((p) => [p.id, p])).values(),
    );

    return uniqueProjects;
  } catch (error) {
    console.error("Error finding all user projects:", error);
    throw new Error("Failed to find user projects");
  }
}

/**
 * Create a new project
 */
export async function createProject(
  data: IProjectCreateData,
): Promise<IProject> {
  try {
    const id = randomUUID();

    const result = await sql<{
      id: string;
      name: string;
      owner_id: string;
      created_at: Date;
      updated_at: Date;
      subscription_plan_id: string | null;
      plan_id: string | null;
      plan_name: string | null;
      plan_display_name: string | null;
      plan_description: string | null;
      plan_stripe_price_id_monthly: string | null;
      plan_stripe_price_id_yearly: string | null;
      plan_is_active: boolean | null;
      plan_created_at: Date | null;
      plan_updated_at: Date | null;
    }>`
      INSERT INTO projects (id, name, owner_id, created_at, updated_at)
      VALUES (${id}, ${data.name}, ${data.ownerId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        name,
        owner_id,
        created_at,
        updated_at,
        subscription_plan_id
    `.execute(db);

    const project = result.rows[0];
    if (!project) throw new Error("Failed to create project");

    // Fetch subscription plan if exists
    let subscriptionPlan: ISubscriptionPlan | undefined;
    if (project.subscription_plan_id) {
      const planResult = await sql<{
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
        WHERE id = ${project.subscription_plan_id}
        LIMIT 1
      `.execute(db);

      const plan = planResult.rows[0];
      if (plan) {
        subscriptionPlan = {
          id: plan.id,
          name: plan.name,
          displayName: plan.display_name,
          description: plan.description,
          stripePriceIdMonthly: plan.stripe_price_id_monthly,
          stripePriceIdYearly: plan.stripe_price_id_yearly,
          isActive: plan.is_active,
          createdAt: plan.created_at,
          updatedAt: plan.updated_at,
        };
      }
    }

    return {
      id: project.id,
      name: project.name,
      ownerId: project.owner_id,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      subscriptionPlanId: project.subscription_plan_id ?? undefined,
      subscriptionPlan,
    };
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }
}

/**
 * Create project with owner as member (atomic transaction)
 */
export async function createProjectWithOwner(
  data: IProjectCreateData,
  ownerRoleId: string,
): Promise<IProject> {
  try {
    const result = await db.transaction().execute(async (trx) => {
      const projectId = randomUUID();
      const memberId = randomUUID();

      // Create project
      const projectResult = await sql<{
        id: string;
        name: string;
        owner_id: string;
        created_at: Date;
        updated_at: Date;
        subscription_plan_id: string | null;
      }>`
        INSERT INTO projects (id, name, owner_id, created_at, updated_at)
        VALUES (${projectId}, ${data.name}, ${data.ownerId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING
          id,
          name,
          owner_id,
          created_at,
          updated_at,
          subscription_plan_id
      `.execute(trx);

      const project = projectResult.rows[0];
      if (!project) throw new Error("Failed to create project");

      // Add owner as member
      await sql`
        INSERT INTO project_members (id, project_id, user_id, role_id, created_at, updated_at)
        VALUES (${memberId}, ${project.id}, ${data.ownerId}, ${ownerRoleId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `.execute(trx);

      // Fetch subscription plan if exists
      let subscriptionPlan: ISubscriptionPlan | undefined;
      if (project.subscription_plan_id) {
        const planResult = await sql<{
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
          WHERE id = ${project.subscription_plan_id}
          LIMIT 1
        `.execute(trx);

        const plan = planResult.rows[0];
        if (plan) {
          subscriptionPlan = {
            id: plan.id,
            name: plan.name,
            displayName: plan.display_name,
            description: plan.description,
            stripePriceIdMonthly: plan.stripe_price_id_monthly,
            stripePriceIdYearly: plan.stripe_price_id_yearly,
            isActive: plan.is_active,
            createdAt: plan.created_at,
            updatedAt: plan.updated_at,
          };
        }
      }

      return {
        id: project.id,
        name: project.name,
        ownerId: project.owner_id,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        subscriptionPlanId: project.subscription_plan_id ?? undefined,
        subscriptionPlan,
      };
    });

    return result;
  } catch (error) {
    console.error("Error creating project with owner:", error);
    throw new Error("Failed to create project");
  }
}

/**
 * Update project
 */
export async function updateProject(
  id: string,
  data: IProjectUpdateData,
): Promise<IProject> {
  try {
    const setParts: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    if (data.name !== undefined) {
      setParts.push(`name = ${sql.lit(data.name)}`);
    }

    const result = await sql<{
      id: string;
      name: string;
      owner_id: string;
      created_at: Date;
      updated_at: Date;
      subscription_plan_id: string | null;
    }>`
      UPDATE projects
      SET ${sql.raw(setParts.join(", "))}
      WHERE id = ${id}
      RETURNING *
    `.execute(db);

    const project = result.rows[0];
    if (!project) throw new Error("Project not found");

    // Fetch subscription plan if exists
    let subscriptionPlan: ISubscriptionPlan | undefined;
    if (project.subscription_plan_id) {
      const planResult = await sql<{
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
        WHERE id = ${project.subscription_plan_id}
        LIMIT 1
      `.execute(db);

      const plan = planResult.rows[0];
      if (plan) {
        subscriptionPlan = {
          id: plan.id,
          name: plan.name,
          displayName: plan.display_name,
          description: plan.description,
          stripePriceIdMonthly: plan.stripe_price_id_monthly,
          stripePriceIdYearly: plan.stripe_price_id_yearly,
          isActive: plan.is_active,
          createdAt: plan.created_at,
          updatedAt: plan.updated_at,
        };
      }
    }

    return {
      id: project.id,
      name: project.name,
      ownerId: project.owner_id,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      subscriptionPlanId: project.subscription_plan_id ?? undefined,
      subscriptionPlan,
    };
  } catch (error) {
    console.error("Error updating project:", error);
    throw new Error("Failed to update project");
  }
}

/**
 * Delete project
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    await sql`
      DELETE FROM projects
      WHERE id = ${id}
    `.execute(db);
  } catch (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project");
  }
}
