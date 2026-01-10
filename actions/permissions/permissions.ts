"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import {
  getPlanActionPermissions,
  getRoleActionPermissions,
  upsertPlanActionPermission,
  upsertRoleActionPermission,
  type IPermissionCreateData,
  type IRolePermissionCreateData,
} from "@/repositories/permissions";
import { isSystemAdmin } from "@/services/auth/platform-admin";

/**
 * Check access helper
 */
async function checkAdminAccess() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await isSystemAdmin(user.id);
  if (!hasAccess) {
    throw new Error("Forbidden");
  }
  return user;
}

/**
 * Get permissions for a plan (Role Permissions)
 */
export async function getRolePermissions(planId: string, roleId?: string) {
  await checkAdminAccess();

  try {
    const permissions = await getRoleActionPermissions(planId, roleId);
    return { permissions };
  } catch (error) {
    console.error("Error getting role permissions:", error);
    throw new Error("Failed to get role permissions");
  }
}

/**
 * Get permissions for a plan (Plan Permissions)
 */
export async function getPlanPermissions(planId: string) {
  await checkAdminAccess();

  try {
    const permissions = await getPlanActionPermissions(planId);
    return { permissions };
  } catch (error) {
    console.error("Error getting plan permissions:", error);
    throw new Error("Failed to get plan permissions");
  }
}

/**
 * Update a role permission
 */
export async function updateRolePermissionAction(
  data: IRolePermissionCreateData,
) {
  await checkAdminAccess();

  try {
    const permission = await upsertRoleActionPermission(data);
    return { permission };
  } catch (error) {
    console.error("Error updating role permission:", error);
    throw new Error("Failed to update role permission");
  }
}

/**
 * Update a plan permission
 */
export async function updatePlanPermissionAction(data: IPermissionCreateData) {
  await checkAdminAccess();

  try {
    const permission = await upsertPlanActionPermission(data);
    return { permission };
  } catch (error) {
    console.error("Error updating plan permission:", error);
    throw new Error("Failed to update plan permission");
  }
}
