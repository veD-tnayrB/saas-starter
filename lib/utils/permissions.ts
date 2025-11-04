import type { ProjectRole } from "@prisma/client";

/**
 * Unified role type (same as UserRole and ProjectRole)
 * Currently: OWNER | ADMIN | MEMBER
 */
export type UnifiedRole = ProjectRole;

/**
 * Check if a role can manage project members
 * Only OWNER and ADMIN can manage members
 */
export function canManageProjectMembers(role: UnifiedRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/**
 * Check if a role can delete a project
 * Only OWNER can delete
 */
export function canDeleteProject(role: UnifiedRole): boolean {
  return role === "OWNER";
}

/**
 * Check if a role can update project details
 * OWNER and ADMIN can update
 */
export function canUpdateProject(role: UnifiedRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/**
 * Role hierarchy for permission checking
 */
export const roleHierarchy: Record<UnifiedRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

/**
 * Check if user role has sufficient permission
 */
export function hasMinimumRole(
  userRole: UnifiedRole,
  requiredRole: UnifiedRole,
): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
