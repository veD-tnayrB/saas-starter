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
 * @deprecated Use canManageProjectWithRoles instead
 */
export function canManageProject(role: string | null): boolean {
  if (!role) return false;
  return role === PROJECT_ROLES.OWNER || role === PROJECT_ROLES.ADMIN;
}

/**
 * Check if user with roles can manage project (update settings, manage members)
 * Returns true if user has OWNER or ADMIN role
 */
export function canManageProjectWithRoles(roles: string[]): boolean {
  if (roles.length === 0) return false;
  return roles.includes(PROJECT_ROLES.OWNER) || roles.includes(PROJECT_ROLES.ADMIN);
}

/**
 * Check if role can delete project
 * @deprecated Use canDeleteProjectWithRoles instead
 */
export function canDeleteProject(role: string | null): boolean {
  return role === PROJECT_ROLES.OWNER;
}

/**
 * Check if user with roles can delete project
 * Returns true if user has OWNER role
 */
export function canDeleteProjectWithRoles(roles: string[]): boolean {
  return roles.includes(PROJECT_ROLES.OWNER);
}

/**
 * Check if role can invite members
 * @deprecated Use canInviteMembersWithRoles instead
 */
export function canInviteMembers(role: string | null): boolean {
  return canManageProject(role);
}

/**
 * Check if user with roles can invite members
 */
export function canInviteMembersWithRoles(roles: string[]): boolean {
  return canManageProjectWithRoles(roles);
}

/**
 * Check if role can update project settings
 * @deprecated Use canUpdateSettingsWithRoles instead
 */
export function canUpdateSettings(role: string | null): boolean {
  return canManageProject(role);
}

/**
 * Check if user with roles can update project settings
 */
export function canUpdateSettingsWithRoles(roles: string[]): boolean {
  return canManageProjectWithRoles(roles);
}

/**
 * Check if role can manage project members (add, remove, update roles)
 * @deprecated Use canManageMembersWithRoles instead
 */
export function canManageMembers(role: string | null): boolean {
  return canManageProject(role);
}

/**
 * Check if user with roles can manage project members
 */
export function canManageMembersWithRoles(roles: string[]): boolean {
  return canManageProjectWithRoles(roles);
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
 * @deprecated Use hasPermissionLevelWithRoles instead
 */
export function hasPermissionLevel(
  role: string | null,
  requiredRole: string,
): boolean {
  const roleLevel = getRoleHierarchy(role);
  const requiredLevel = getRoleHierarchy(requiredRole);
  return roleLevel >= requiredLevel;
}

/**
 * Check if user with roles has at least the required permission level
 * Uses the highest role level from the user's roles
 */
export function hasPermissionLevelWithRoles(
  roles: string[],
  requiredRole: string,
): boolean {
  if (roles.length === 0) return false;
  const requiredLevel = getRoleHierarchy(requiredRole);
  const highestLevel = Math.max(...roles.map((r) => getRoleHierarchy(r)));
  return highestLevel >= requiredLevel;
}
