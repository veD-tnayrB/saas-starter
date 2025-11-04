import type { ProjectRole } from "@prisma/client";

/**
 * Project role constants
 */
export const PROJECT_ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

/**
 * Check if role can manage project (update settings, manage members)
 */
export function canManageProject(role: ProjectRole | null): boolean {
  if (!role) return false;
  return role === PROJECT_ROLES.OWNER || role === PROJECT_ROLES.ADMIN;
}

/**
 * Check if role can delete project
 */
export function canDeleteProject(role: ProjectRole | null): boolean {
  return role === PROJECT_ROLES.OWNER;
}

/**
 * Check if role can invite members
 */
export function canInviteMembers(role: ProjectRole | null): boolean {
  return canManageProject(role);
}

/**
 * Check if role can update project settings
 */
export function canUpdateSettings(role: ProjectRole | null): boolean {
  return canManageProject(role);
}

/**
 * Check if role can manage project members (add, remove, update roles)
 */
export function canManageMembers(role: ProjectRole | null): boolean {
  return canManageProject(role);
}

/**
 * Get role hierarchy level (higher = more permissions)
 */
export function getRoleHierarchy(role: ProjectRole | null): number {
  if (!role) return 0;
  const hierarchy: Record<ProjectRole, number> = {
    OWNER: 3,
    ADMIN: 2,
    MEMBER: 1,
  };
  return hierarchy[role];
}

/**
 * Check if role has at least the required permission level
 */
export function hasPermissionLevel(
  role: ProjectRole | null,
  requiredRole: ProjectRole,
): boolean {
  const roleLevel = getRoleHierarchy(role);
  const requiredLevel = getRoleHierarchy(requiredRole);
  return roleLevel >= requiredLevel;
}

