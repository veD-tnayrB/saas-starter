"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import {
  createRole,
  deleteRole,
  findAllRoles,
  updateRole,
  type IAppRoleCreateData,
  type IAppRoleUpdateData,
} from "@/repositories/permissions";

import { canAccessAdminPages } from "@/lib/permissions/admin-access";

/**
 * Get all roles
 */
export async function getRoles() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await canAccessAdminPages();
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  try {
    const roles = await findAllRoles();
    return { roles };
  } catch (error) {
    console.error("Error getting roles:", error);
    throw new Error("Failed to get roles");
  }
}

/**
 * Create a new role
 */
export async function createRoleAction(data: IAppRoleCreateData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await canAccessAdminPages();
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  try {
    const role = await createRole(data);
    return { role };
  } catch (error) {
    console.error("Error creating role:", error);
    throw new Error("Failed to create role");
  }
}

/**
 * Update a role
 */
export async function updateRoleAction(
  roleId: string,
  data: IAppRoleUpdateData,
) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await canAccessAdminPages();
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  try {
    const role = await updateRole(roleId, data);
    return { role };
  } catch (error) {
    console.error("Error updating role:", error);
    throw new Error("Failed to update role");
  }
}

/**
 * Delete a role
 */
export async function deleteRoleAction(roleId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await canAccessAdminPages();
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  try {
    await deleteRole(roleId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    throw new Error("Failed to delete role");
  }
}
