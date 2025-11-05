/**
 * Project role constants
 */
export const PROJECT_ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

/**
 * Role hierarchy mapping (higher = more permissions)
 */
const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

/**
 * Check if role can manage project (update settings, manage members)
 */
export function canManageProject(role: string | null): boolean {
  if (!role) return false;
  return role === PROJECT_ROLES.OWNER || role === PROJECT_ROLES.ADMIN;
}

/**
 * Check if role can delete project
 */
export function canDeleteProject(role: string | null): boolean {
  return role === PROJECT_ROLES.OWNER;
}

/**
 * Check if role can invite members
 */
export function canInviteMembers(role: string | null): boolean {
  return canManageProject(role);
}

/**
 * Check if role can update project settings
 */
export function canUpdateSettings(role: string | null): boolean {
  return canManageProject(role);
}

/**
 * Check if role can manage project members (add, remove, update roles)
 */
export function canManageMembers(role: string | null): boolean {
  return canManageProject(role);
}

/**
 * Get role hierarchy level (higher = more permissions)
 */
export function getRoleHierarchy(role: string | null): number {
  if (!role) return 0;
  return ROLE_HIERARCHY[role] || 0;
}

/**
 * Check if role has at least the required permission level
 */
export function hasPermissionLevel(
  role: string | null,
  requiredRole: string,
): boolean {
  const roleLevel = getRoleHierarchy(role);
  const requiredLevel = getRoleHierarchy(requiredRole);
  return roleLevel >= requiredLevel;
}
