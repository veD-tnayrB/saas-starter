import {
  canRolePerformActionInPlan,
  findActionBySlug,
  findPlanByName,
  getCachedPermission,
  getPermissionCacheKey,
  getProjectSubscriptionPlan,
  setCachedPermission,
} from "@/repositories/permissions";
import { findProjectMember } from "@/repositories/projects/members";

/**
 * Permission Service
 *
 * Central service for checking user permissions.
 * This service handles caching and provides a clean API for permission checks.
 */
export class PermissionService {
  /**
   * Check if user can perform an action in a project
   *
   * Flow:
   * 1. Get user's subscription plan
   * 2. Get user's roles in the project (supports multiple roles)
   * 3. Get action by slug
   * 4. Check permissions for each role
   * 5. Return true if any role has permission
   * 6. Cache results per role
   */
  async canUserPerformAction(
    userId: string,
    projectId: string,
    actionSlug: string,
  ): Promise<boolean> {
    try {
      // Check authorization first - user must be a project member
      const projectMember = await findProjectMember(projectId, userId);

      if (!projectMember || projectMember.roles.length === 0) {
        return false;
      }

      // Get project's subscription plan (user is authorized, safe to fetch)
      const projectPlan = await getProjectSubscriptionPlan(projectId);
      if (!projectPlan) {
        // If project has no plan, use Free plan (default)
        // This should be handled by project creation/registration
        // For now, we'll allow basic actions even without a plan
      }

      // Get action by slug
      const action = await findActionBySlug(actionSlug);
      if (!action) {
        return false;
      }

      // Check permissions for each role - return true if any role has permission
      const planId = projectPlan?.id;
      const freePlan = projectPlan ? null : await findPlanByName("free");
      const effectivePlanId = planId ?? freePlan?.id;

      if (!effectivePlanId) {
        return false;
      }

      // Check each role - if any role has permission, return true
      for (const role of projectMember.roles) {
        // Generate cache key for this role
        const cacheKey = getPermissionCacheKey(
          effectivePlanId,
          role.id,
          actionSlug,
        );

        // Check cache first
        const cachedResult = getCachedPermission(cacheKey);
        if (cachedResult !== undefined) {
          if (cachedResult) return true; // If cached and true, return immediately
          continue; // If cached and false, check next role
        }

        // Check permission in DB
        const canPerform = await canRolePerformActionInPlan(
          effectivePlanId,
          role.id,
          action.id,
        );

        // Cache result
        setCachedPermission(cacheKey, canPerform);

        // If this role has permission, return true immediately
        if (canPerform) {
          return true;
        }
      }

      // No role has permission
      return false;
    } catch (error) {
      console.error("Error checking user permission:", error);
      return false;
    }
  }

  /**
   * Batch check multiple permissions
   * Useful for checking multiple actions at once
   */
  async canUserPerformActions(
    userId: string,
    projectId: string,
    actionSlugs: string[],
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    await Promise.all(
      actionSlugs.map(async (slug) => {
        results[slug] = await this.canUserPerformAction(
          userId,
          projectId,
          slug,
        );
      }),
    );

    return results;
  }
}

// Singleton instance
export const permissionService = new PermissionService();
