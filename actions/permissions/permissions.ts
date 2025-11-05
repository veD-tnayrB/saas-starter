"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import {
  getRoleActionPermissions,
  upsertRoleActionPermission,
  type IRolePermissionCreateData,
} from "@/repositories/permissions";

import { canAccessAdminPages } from "@/lib/permissions/admin-access";

/**
 * Get permissions for a plan (optionally filtered by role)
 */
export async function getPermissions(planId: string, roleId?: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await canAccessAdminPages();
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  try {
    const permissions = await getRoleActionPermissions(planId, roleId);
    return { permissions };
  } catch (error) {
    console.error("Error getting permissions:", error);
    throw new Error("Failed to get permissions");
  }
}

/**
 * Update a permission
 */
export async function updatePermissionAction(data: IRolePermissionCreateData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await canAccessAdminPages();
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  try {
    const permission = await upsertRoleActionPermission(data);
    return { permission };
  } catch (error) {
    console.error("Error updating permission:", error);
    throw new Error("Failed to update permission");
  }
}
