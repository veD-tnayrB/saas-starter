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
      ownerId: string;
      createdAt: Date;
      updatedAt: Date;
      subscriptionPlanId: string | null;
      planId: string | null;
      planName: string | null;
      planDisplayName: string | null;
      planDescription: string | null;
      planStripePriceIdMonthly: string | null;
      planStripePriceIdYearly: string | null;
      planIsActive: boolean | null;
      planCreatedAt: Date | null;
      planUpdatedAt: Date | null;
    }>`
      SELECT
        p.id,
        p.name,
        p.owner_id AS "ownerId",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        p.subscription_plan_id AS "subscriptionPlanId",
        sp.id AS "planId",
        sp.name AS "planName",
        sp.display_name AS "planDisplayName",
        sp.description AS "planDescription",
        sp.stripe_price_id_monthly AS "planStripePriceIdMonthly",
        sp.stripe_price_id_yearly AS "planStripePriceIdYearly",
        sp.is_active AS "planIsActive",
        sp.created_at AS "planCreatedAt",
        sp.updated_at AS "planUpdatedAt"
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
      ownerId: row.ownerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      subscriptionPlanId: row.subscriptionPlanId ?? undefined,
      subscriptionPlan: row.planId
        ? {
            id: row.planId,
            name: row.planName!,
            displayName: row.planDisplayName!,
            description: row.planDescription,
            stripePriceIdMonthly: row.planStripePriceIdMonthly,
            stripePriceIdYearly: row.planStripePriceIdYearly,
            isActive: row.planIsActive ?? false,
            createdAt: row.planCreatedAt!,
            updatedAt: row.planUpdatedAt!,
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
      ownerId: string;
      createdAt: Date;
      updatedAt: Date;
      subscriptionPlanId: string | null;
      planId: string | null;
      planName: string | null;
      planDisplayName: string | null;
      planDescription: string | null;
      planStripePriceIdMonthly: string | null;
      planStripePriceIdYearly: string | null;
      planIsActive: boolean | null;
      planCreatedAt: Date | null;
      planUpdatedAt: Date | null;
    }>`
      SELECT 
        p.id,
        p.name,
        p.owner_id AS "ownerId",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        p.subscription_plan_id AS "subscriptionPlanId",
        sp.id AS "planId",
        sp.name AS "planName",
        sp.display_name AS "planDisplayName",
        sp.description AS "planDescription",
        sp.stripe_price_id_monthly AS "planStripePriceIdMonthly",
        sp.stripe_price_id_yearly AS "planStripePriceIdYearly",
        sp.is_active AS "planIsActive",
        sp.created_at AS "planCreatedAt",
        sp.updated_at AS "planUpdatedAt"
      FROM projects p
      LEFT JOIN subscription_plans sp ON sp.id = p.subscription_plan_id
      WHERE p.owner_id = ${ownerId}
      ORDER BY p.created_at DESC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      ownerId: row.ownerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      subscriptionPlanId: row.subscriptionPlanId ?? undefined,
      subscriptionPlan: row.planId
        ? {
            id: row.planId,
            name: row.planName!,
            displayName: row.planDisplayName!,
            description: row.planDescription,
            stripePriceIdMonthly: row.planStripePriceIdMonthly,
            stripePriceIdYearly: row.planStripePriceIdYearly,
            isActive: row.planIsActive ?? false,
            createdAt: row.planCreatedAt!,
            updatedAt: row.planUpdatedAt!,
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
      SELECT COUNT(*)::text AS "count"
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
      ownerId: string;
      createdAt: Date;
      updatedAt: Date;
      subscriptionPlanId: string | null;
      planId: string | null;
      planName: string | null;
      planDisplayName: string | null;
      planDescription: string | null;
      planStripePriceIdMonthly: string | null;
      planStripePriceIdYearly: string | null;
      planIsActive: boolean | null;
      planCreatedAt: Date | null;
      planUpdatedAt: Date | null;
    }>`
      SELECT 
        p.id,
        p.name,
        p.owner_id AS "ownerId",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        p.subscription_plan_id AS "subscriptionPlanId",
        sp.id AS "planId",
        sp.name AS "planName",
        sp.display_name AS "planDisplayName",
        sp.description AS "planDescription",
        sp.stripe_price_id_monthly AS "planStripePriceIdMonthly",
        sp.stripe_price_id_yearly AS "planStripePriceIdYearly",
        sp.is_active AS "planIsActive",
        sp.created_at AS "planCreatedAt",
        sp.updated_at AS "planUpdatedAt"
      FROM projects p
      INNER JOIN project_members pm ON pm.project_id = p.id
      LEFT JOIN subscription_plans sp ON sp.id = p.subscription_plan_id
      WHERE pm.user_id = ${userId}
      ORDER BY p.created_at DESC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      ownerId: row.ownerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      subscriptionPlanId: row.subscriptionPlanId ?? undefined,
      subscriptionPlan: row.planId
        ? {
            id: row.planId,
            name: row.planName!,
            displayName: row.planDisplayName!,
            description: row.planDescription,
            stripePriceIdMonthly: row.planStripePriceIdMonthly,
            stripePriceIdYearly: row.planStripePriceIdYearly,
            isActive: row.planIsActive ?? false,
            createdAt: row.planCreatedAt!,
            updatedAt: row.planUpdatedAt!,
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
      ownerId: string;
      createdAt: Date;
      updatedAt: Date;
      subscriptionPlanId: string | null;
    }>`
      INSERT INTO projects (id, name, owner_id, created_at, updated_at)
      VALUES (${id}, ${data.name}, ${data.ownerId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        name,
        owner_id AS "ownerId",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        subscription_plan_id AS "subscriptionPlanId"
    `.execute(db);

    const project = result.rows[0];
    if (!project) throw new Error("Failed to create project");

    // Fetch subscription plan if exists
    let subscriptionPlan: ISubscriptionPlan | undefined;
    if (project.subscriptionPlanId) {
      const planResult = await sql<ISubscriptionPlan>`
        SELECT 
          id,
          name,
          display_name AS "displayName",
          description,
          stripe_price_id_monthly AS "stripePriceIdMonthly",
          stripe_price_id_yearly AS "stripePriceIdYearly",
          is_active AS "isActive",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM subscription_plans
        WHERE id = ${project.subscriptionPlanId}
        LIMIT 1
      `.execute(db);

      const plan = planResult.rows[0];
      if (plan) {
        subscriptionPlan = plan;
      }
    }

    return {
      id: project.id,
      name: project.name,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      subscriptionPlanId: project.subscriptionPlanId ?? undefined,
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
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        subscriptionPlanId: string | null;
      }>`
        INSERT INTO projects (id, name, owner_id, created_at, updated_at)
        VALUES (${projectId}, ${data.name}, ${data.ownerId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING
          id,
          name,
          owner_id AS "ownerId",
          created_at AS "createdAt",
          updated_at AS "updatedAt",
          subscription_plan_id AS "subscriptionPlanId"
      `.execute(trx);

      const project = projectResult.rows[0];
      if (!project) throw new Error("Failed to create project");

      // Add owner as member with OWNER role (critical for new user registration)
      const memberResult = await sql<{
        id: string;
        projectId: string;
        userId: string;
        roleId: string;
      }>`
        INSERT INTO project_members (id, project_id, user_id, role_id, created_at, updated_at)
        VALUES (${memberId}, ${project.id}, ${data.ownerId}, ${ownerRoleId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING 
          id,
          project_id AS "projectId",
          user_id AS "userId",
          role_id AS "roleId"
      `.execute(trx);

      // Verify member was created
      if (!memberResult.rows[0]) {
        throw new Error("Failed to create project member with OWNER role");
      }

      // Fetch subscription plan if exists
      let subscriptionPlan: ISubscriptionPlan | undefined;
      if (project.subscriptionPlanId) {
        const planResult = await sql<ISubscriptionPlan>`
          SELECT 
            id,
            name,
            display_name AS "displayName",
            description,
            stripe_price_id_monthly AS "stripePriceIdMonthly",
            stripe_price_id_yearly AS "stripePriceIdYearly",
            is_active AS "isActive",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
          FROM subscription_plans
          WHERE id = ${project.subscriptionPlanId}
          LIMIT 1
        `.execute(trx);

        const plan = planResult.rows[0];
        if (plan) {
          subscriptionPlan = plan;
        }
      }

      return {
        id: project.id,
        name: project.name,
        ownerId: project.ownerId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        subscriptionPlanId: project.subscriptionPlanId ?? undefined,
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
    // Build SET clause parts using sql fragments for proper sanitization
    const setParts = [sql.raw("updated_at = CURRENT_TIMESTAMP")];
    if (data.name !== undefined) {
      setParts.push(sql`name = ${data.name}`);
    }

    // Combine all SET parts safely
    const setClause = sql.join(setParts, sql`, `);

    const result = await sql<{
      id: string;
      name: string;
      ownerId: string;
      createdAt: Date;
      updatedAt: Date;
      subscriptionPlanId: string | null;
    }>`
      UPDATE projects
      SET ${setClause}
      WHERE id = ${id}
      RETURNING 
        id,
        name,
        owner_id AS "ownerId",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        subscription_plan_id AS "subscriptionPlanId"
    `.execute(db);

    const project = result.rows[0];
    if (!project) throw new Error("Project not found");

    // Fetch subscription plan if exists
    let subscriptionPlan: ISubscriptionPlan | undefined;
    if (project.subscriptionPlanId) {
      const planResult = await sql<ISubscriptionPlan>`
        SELECT 
          id,
          name,
          display_name AS "displayName",
          description,
          stripe_price_id_monthly AS "stripePriceIdMonthly",
          stripe_price_id_yearly AS "stripePriceIdYearly",
          is_active AS "isActive",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM subscription_plans
        WHERE id = ${project.subscriptionPlanId}
        LIMIT 1
      `.execute(db);

      const plan = planResult.rows[0];
      if (plan) {
        subscriptionPlan = plan;
      }
    }

    return {
      id: project.id,
      name: project.name,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      subscriptionPlanId: project.subscriptionPlanId ?? undefined,
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
