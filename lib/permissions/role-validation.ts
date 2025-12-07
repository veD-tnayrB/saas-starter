/**
 * Role validation helpers
 * Functions to check if a user has required roles
 */

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(
  userRoles: string[],
  requiredRoles: string[],
): boolean {
  if (requiredRoles.length === 0) return true;
  if (userRoles.length === 0) return false;
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Check if user has all of the required roles
 */
export function hasAllRoles(
  userRoles: string[],
  requiredRoles: string[],
): boolean {
  if (requiredRoles.length === 0) return true;
  if (userRoles.length === 0) return false;
  return requiredRoles.every((role) => userRoles.includes(role));
}

/**
 * Role hierarchy mapping (higher = more permissions)
 */
const ROLE_HIERARCHY: Record<string, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
};

/**
 * Get the highest priority role level from user roles
 */
function getHighestRoleLevel(userRoles: string[]): number {
  if (userRoles.length === 0) return 0;
  return Math.max(...userRoles.map((role) => ROLE_HIERARCHY[role] || 0));
}

/**
 * Check if user has at least the minimum required role level
 * Uses role hierarchy (OWNER > ADMIN > MEMBER)
 */
export function hasMinimumRole(
  userRoles: string[],
  requiredRole: string,
): boolean {
  if (userRoles.length === 0) return false;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  const userLevel = getHighestRoleLevel(userRoles);
  return userLevel >= requiredLevel;
}

/**
 * Check if user can perform an action based on required role
 * Uses role hierarchy for comparison
 */
export function canPerformAction(
  userRoles: string[],
  requiredRole: string,
): boolean {
  return hasMinimumRole(userRoles, requiredRole);
}





