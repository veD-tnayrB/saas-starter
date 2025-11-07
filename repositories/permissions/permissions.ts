import { randomUUID } from "crypto";
import { sql } from "kysely";

import { db } from "@/lib/db";

export interface IPlanActionPermission {
  id: string;
  planId: string;
  actionId: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoleActionPermission {
  id: string;
  planId: string;
  roleId: string;
  actionId: string;
  allowed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPermissionCreateData {
  planId: string;
  actionId: string;
  enabled?: boolean;
}

export interface IRolePermissionCreateData {
  planId: string;
  roleId: string;
  actionId: string;
  allowed?: boolean;
}

/**
 * Check if action is enabled for a plan
 */
export async function isActionEnabledForPlan(
  planId: string,
  actionId: string,
): Promise<boolean> {
  try {
    const result = await sql<{
      enabled: boolean;
    }>`
      SELECT enabled
      FROM plan_action_permissions
      WHERE plan_id = ${planId}
        AND action_id = ${actionId}
      LIMIT 1
    `.execute(db);

    return result.rows[0]?.enabled ?? false;
  } catch (error) {
    console.error("Error checking plan action permission:", error);
    return false;
  }
}

/**
 * Check if role can perform action in plan
 */
export async function canRolePerformActionInPlan(
  planId: string,
  roleId: string,
  actionId: string,
): Promise<boolean> {
  try {
    // First check if action is enabled for the plan
    const planPermissionResult = await sql<{
      enabled: boolean;
    }>`
      SELECT enabled
      FROM plan_action_permissions
      WHERE plan_id = ${planId}
        AND action_id = ${actionId}
      LIMIT 1
    `.execute(db);

    const planPermission = planPermissionResult.rows[0];
    if (!planPermission?.enabled) {
      return false;
    }

    // Then check if role has permission for this action in this plan
    const rolePermissionResult = await sql<{
      allowed: boolean;
    }>`
      SELECT allowed
      FROM role_action_permissions
      WHERE plan_id = ${planId}
        AND role_id = ${roleId}
        AND action_id = ${actionId}
      LIMIT 1
    `.execute(db);

    return rolePermissionResult.rows[0]?.allowed ?? false;
  } catch (error) {
    console.error("Error checking role action permission:", error);
    return false;
  }
}

/**
 * Get all plan action permissions
 */
export async function getPlanActionPermissions(
  planId: string,
): Promise<IPlanActionPermission[]> {
  try {
    const result = await sql<IPlanActionPermission>`
      SELECT 
        id,
        plan_id AS planId,
        action_id AS actionId,
        enabled,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM plan_action_permissions
      WHERE plan_id = ${planId}
    `.execute(db);

    return result.rows;
  } catch (error) {
    console.error("Error getting plan action permissions:", error);
    throw new Error("Failed to get plan action permissions");
  }
}

/**
 * Get all role action permissions for a plan
 */
export async function getRoleActionPermissions(
  planId: string,
  roleId?: string,
): Promise<IRoleActionPermission[]> {
  try {
    const result = roleId
      ? await sql<IRoleActionPermission>`
            SELECT 
              id,
              plan_id AS planId,
              role_id AS roleId,
              action_id AS actionId,
              allowed,
              created_at AS createdAt,
              updated_at AS updatedAt
            FROM role_action_permissions
            WHERE plan_id = ${planId}
              AND role_id = ${roleId}
          `.execute(db)
      : await sql<IRoleActionPermission>`
            SELECT 
              id,
              plan_id AS planId,
              role_id AS roleId,
              action_id AS actionId,
              allowed,
              created_at AS createdAt,
              updated_at AS updatedAt
            FROM role_action_permissions
            WHERE plan_id = ${planId}
          `.execute(db);

    return result.rows;
  } catch (error) {
    console.error("Error getting role action permissions:", error);
    throw new Error("Failed to get role action permissions");
  }
}

/**
 * Create or update plan action permission
 */
export async function upsertPlanActionPermission(
  data: IPermissionCreateData,
): Promise<IPlanActionPermission> {
  try {
    // Check if exists
    const existingResult = await sql<{
      id: string;
    }>`
      SELECT id
      FROM plan_action_permissions
      WHERE plan_id = ${data.planId}
        AND action_id = ${data.actionId}
      LIMIT 1
    `.execute(db);

    const existing = existingResult.rows[0];

    if (existing) {
      // Update
      const result = await sql<IPlanActionPermission>`
        UPDATE plan_action_permissions
        SET 
          enabled = ${data.enabled ?? true},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing.id}
        RETURNING 
          id,
          plan_id AS planId,
          action_id AS actionId,
          enabled,
          created_at AS createdAt,
          updated_at AS updatedAt
      `.execute(db);

      const row = result.rows[0];
      if (!row) throw new Error("Failed to update plan action permission");

      return row;
    } else {
      // Create
      const id = randomUUID();
      const result = await sql<IPlanActionPermission>`
        INSERT INTO plan_action_permissions (
          id,
          plan_id,
          action_id,
          enabled,
          created_at,
          updated_at
        )
        VALUES (
          ${id},
          ${data.planId},
          ${data.actionId},
          ${data.enabled ?? true},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING 
          id,
          plan_id AS planId,
          action_id AS actionId,
          enabled,
          created_at AS createdAt,
          updated_at AS updatedAt
      `.execute(db);

      const row = result.rows[0];
      if (!row) throw new Error("Failed to create plan action permission");

      return row;
    }
  } catch (error) {
    console.error("Error upserting plan action permission:", error);
    throw new Error("Failed to upsert plan action permission");
  }
}

/**
 * Create or update role action permission
 */
export async function upsertRoleActionPermission(
  data: IRolePermissionCreateData,
): Promise<IRoleActionPermission> {
  try {
    // Check if exists
    const existingResult = await sql<{
      id: string;
    }>`
      SELECT id
      FROM role_action_permissions
      WHERE plan_id = ${data.planId}
        AND role_id = ${data.roleId}
        AND action_id = ${data.actionId}
      LIMIT 1
    `.execute(db);

    const existing = existingResult.rows[0];

    if (existing) {
      // Update
      const result = await sql<IRoleActionPermission>`
        UPDATE role_action_permissions
        SET 
          allowed = ${data.allowed ?? true},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing.id}
        RETURNING 
          id,
          plan_id AS planId,
          role_id AS roleId,
          action_id AS actionId,
          allowed,
          created_at AS createdAt,
          updated_at AS updatedAt
      `.execute(db);

      const row = result.rows[0];
      if (!row) throw new Error("Failed to update role action permission");

      return row;
    } else {
      // Create
      const id = randomUUID();
      const result = await sql<IRoleActionPermission>`
        INSERT INTO role_action_permissions (
          id,
          plan_id,
          role_id,
          action_id,
          allowed,
          created_at,
          updated_at
        )
        VALUES (
          ${id},
          ${data.planId},
          ${data.roleId},
          ${data.actionId},
          ${data.allowed ?? true},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING 
          id,
          plan_id AS planId,
          role_id AS roleId,
          action_id AS actionId,
          allowed,
          created_at AS createdAt,
          updated_at AS updatedAt
      `.execute(db);

      const row = result.rows[0];
      if (!row) throw new Error("Failed to create role action permission");

      return row;
    }
  } catch (error) {
    console.error("Error upserting role action permission:", error);
    throw new Error("Failed to upsert role action permission");
  }
}

/**
 * Delete plan action permission
 */
export async function deletePlanActionPermission(
  planId: string,
  actionId: string,
): Promise<void> {
  try {
    await sql`
      DELETE FROM plan_action_permissions
      WHERE plan_id = ${planId}
        AND action_id = ${actionId}
    `.execute(db);
  } catch (error) {
    console.error("Error deleting plan action permission:", error);
    throw new Error("Failed to delete plan action permission");
  }
}

/**
 * Delete role action permission
 */
export async function deleteRoleActionPermission(
  planId: string,
  roleId: string,
  actionId: string,
): Promise<void> {
  try {
    await sql`
      DELETE FROM role_action_permissions
      WHERE plan_id = ${planId}
        AND role_id = ${roleId}
        AND action_id = ${actionId}
    `.execute(db);
  } catch (error) {
    console.error("Error deleting role action permission:", error);
    throw new Error("Failed to delete role action permission");
  }
}

/**
 * Clear all permissions cache (for cache invalidation)
 * This is a placeholder - actual cache clearing is handled by the cache service
 */
export async function clearPermissionsCache(): Promise<void> {
  // This function is here for consistency, but cache clearing
  // should be handled by the cache service layer
  return Promise.resolve();
}
