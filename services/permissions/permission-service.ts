import { prisma } from "@/clients/db";
import {
  canRolePerformActionInPlan,
  findActionBySlug,
  findPlanByName,
  getCachedPermission,
  getPermissionCacheKey,
  getProjectSubscriptionPlan,
  setCachedPermission,
} from "@/repositories/permissions";

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
   * 2. Get user's role in the project
   * 3. Get action by slug
   * 4. Check cache first
   * 5. If not cached, check permissions in DB
   * 6. Cache result
   * 7. Return boolean
   */
  async canUserPerformAction(
    userId: string,
    projectId: string,
    actionSlug: string,
  ): Promise<boolean> {
    try {
      // Get project's subscription plan
      const projectPlan = await getProjectSubscriptionPlan(projectId);
      if (!projectPlan) {
        // If project has no plan, use Free plan (default)
        // This should be handled by project creation/registration
        // For now, we'll allow basic actions even without a plan
      }

      // Get user's role in the project (with roleId)
      const projectMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
        include: {
          role: true,
        },
      });

      if (!projectMember || !projectMember.role) {
        return false;
      }

      // Get action by slug
      const action = await findActionBySlug(actionSlug);
      if (!action) {
        return false;
      }

      // Use role from projectMember
      const role = projectMember.role;

      // If no plan, use Free plan as default
      if (!projectPlan) {
        // For projects without a plan, check if Free plan would allow this action
        const freePlan = await findPlanByName("free");
        if (!freePlan) {
          return false;
        }
        const canPerform = await canRolePerformActionInPlan(
          freePlan.id,
          role.id,
          action.id,
        );
        return canPerform;
      }

      // Generate cache key
      const cacheKey = getPermissionCacheKey(
        projectPlan.id,
        role.id,
        actionSlug,
      );

      // Check cache first
      const cachedResult = getCachedPermission(cacheKey);
      if (cachedResult !== undefined) {
        return cachedResult;
      }

      // Check permission in DB
      const canPerform = await canRolePerformActionInPlan(
        projectPlan.id,
        role.id,
        action.id,
      );

      // Cache result
      setCachedPermission(cacheKey, canPerform);

      return canPerform;
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
