import { prisma } from "@/clients/db";

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
    const permission = await prisma.planActionPermission.findUnique({
      where: {
        planId_actionId: {
          planId,
          actionId,
        },
      },
    });

    return permission?.enabled ?? false;
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
    const planPermission = await prisma.planActionPermission.findUnique({
      where: {
        planId_actionId: {
          planId,
          actionId,
        },
      },
    });

    if (!planPermission?.enabled) {
      return false;
    }

    // Then check if role has permission for this action in this plan
    const rolePermission = await prisma.roleActionPermission.findUnique({
      where: {
        planId_roleId_actionId: {
          planId,
          roleId,
          actionId,
        },
      },
    });

    return rolePermission?.allowed ?? false;
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
    const permissions = await prisma.planActionPermission.findMany({
      where: { planId },
      include: {
        action: true,
      },
    });
    return permissions;
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
    const where = roleId ? { planId, roleId } : { planId };
    const permissions = await prisma.roleActionPermission.findMany({
      where,
      include: {
        role: true,
        action: true,
      },
    });
    return permissions;
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
    const permission = await prisma.planActionPermission.upsert({
      where: {
        planId_actionId: {
          planId: data.planId,
          actionId: data.actionId,
        },
      },
      update: {
        enabled: data.enabled ?? true,
      },
      create: {
        planId: data.planId,
        actionId: data.actionId,
        enabled: data.enabled ?? true,
      },
    });
    return permission;
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
    const permission = await prisma.roleActionPermission.upsert({
      where: {
        planId_roleId_actionId: {
          planId: data.planId,
          roleId: data.roleId,
          actionId: data.actionId,
        },
      },
      update: {
        allowed: data.allowed ?? true,
      },
      create: {
        planId: data.planId,
        roleId: data.roleId,
        actionId: data.actionId,
        allowed: data.allowed ?? true,
      },
    });
    return permission;
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
    await prisma.planActionPermission.delete({
      where: {
        planId_actionId: {
          planId,
          actionId,
        },
      },
    });
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
    await prisma.roleActionPermission.delete({
      where: {
        planId_roleId_actionId: {
          planId,
          roleId,
          actionId,
        },
      },
    });
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

