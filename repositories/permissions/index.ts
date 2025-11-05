/**
 * Permissions Repository Module
 *
 * This module provides data access functions for the permissions system.
 * It handles all database operations for roles, actions, plans, and permissions.
 *
 * @module repositories/permissions
 */

// Roles
export {
  createRole,
  deleteRole,
  findAllRoles,
  findRoleById,
  findRoleByName,
  updateRole,
} from "./roles";
export type { IAppRole, IAppRoleCreateData, IAppRoleUpdateData } from "./roles";

// Actions
export {
  createAction,
  deleteAction,
  findActionById,
  findActionBySlug,
  findActionsByCategory,
  findAllActions,
  updateAction,
} from "./actions";
export type { IAction, IActionCreateData, IActionUpdateData } from "./actions";

// Plans
export {
  assignPlanToProject,
  createPlan,
  deletePlan,
  findActivePlans,
  findAllPlans,
  findPlanById,
  findPlanByName,
  findPlanByStripePriceId,
  getProjectSubscriptionPlan,
  updatePlan,
} from "./plans";
export type {
  ISubscriptionPlan,
  ISubscriptionPlanCreateData,
  ISubscriptionPlanUpdateData,
} from "./plans";

// Permissions
export {
  canRolePerformActionInPlan,
  clearPermissionsCache,
  deletePlanActionPermission,
  deleteRoleActionPermission,
  getPlanActionPermissions,
  getRoleActionPermissions,
  isActionEnabledForPlan,
  upsertPlanActionPermission,
  upsertRoleActionPermission,
} from "./permissions";
export type {
  IPermissionCreateData,
  IPlanActionPermission,
  IRoleActionPermission,
  IRolePermissionCreateData,
} from "./permissions";

// Cache
export {
  clearActionPermissionCache,
  clearPermissionCache,
  clearPermissionCacheEntry,
  clearPlanPermissionCache,
  clearRolePermissionCache,
  getCacheStats,
  getCachedPermission,
  getPermissionCacheKey,
  setCachedPermission,
} from "./cache";
