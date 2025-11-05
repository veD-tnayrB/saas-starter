import { permissionService } from "@/services/permissions";

/**
 * Centralized Permission Validator
 *
 * This is the main entry point for all permission checks in the application.
 * All permission validation should go through these functions.
 */

/**
 * Check if user can perform an action in a project
 *
 * @param userId - The user ID
 * @param projectId - The project ID
 * @param actionSlug - The action slug (e.g., "member:invite")
 * @returns Promise<boolean> - True if user can perform the action
 */
export async function canUserPerformAction(
  userId: string,
  projectId: string,
  actionSlug: string,
): Promise<boolean> {
  return permissionService.canUserPerformAction(userId, projectId, actionSlug);
}

/**
 * Check multiple permissions at once
 *
 * @param userId - The user ID
 * @param projectId - The project ID
 * @param actionSlugs - Array of action slugs to check
 * @returns Promise<Record<string, boolean>> - Map of action slugs to permission results
 */
export async function canUserPerformActions(
  userId: string,
  projectId: string,
  actionSlugs: string[],
): Promise<Record<string, boolean>> {
  return permissionService.canUserPerformActions(
    userId,
    projectId,
    actionSlugs,
  );
}

/**
 * Helper: Check if user can manage project (create, update, delete)
 */
export async function canManageProject(
  userId: string,
  projectId: string,
): Promise<boolean> {
  const permissions = await canUserPerformActions(userId, projectId, [
    "project:update",
    "project:delete",
  ]);

  return permissions["project:update"] || permissions["project:delete"];
}

/**
 * Helper: Check if user can manage members (invite, remove, update roles)
 */
export async function canManageMembers(
  userId: string,
  projectId: string,
): Promise<boolean> {
  const permissions = await canUserPerformActions(userId, projectId, [
    "member:invite",
    "member:remove",
    "member:update-role",
  ]);

  return (
    permissions["member:invite"] ||
    permissions["member:remove"] ||
    permissions["member:update-role"]
  );
}

/**
 * Helper: Check if user can view billing
 */
export async function canViewBilling(
  userId: string,
  projectId: string,
): Promise<boolean> {
  return canUserPerformAction(userId, projectId, "billing:view");
}

/**
 * Helper: Check if user can view advanced dashboard
 */
export async function canViewAdvancedDashboard(
  userId: string,
  projectId: string,
): Promise<boolean> {
  return canUserPerformAction(userId, projectId, "dashboard:view-advanced");
}

