import {
  clearActionPermissionCache,
  clearPermissionCache,
  clearPlanPermissionCache,
  clearRolePermissionCache,
  getCacheStats,
} from "@/repositories/permissions";

/**
 * Cache Service
 *
 * Service for managing permission cache.
 * Provides methods to invalidate cache when permissions are updated.
 */
export class CacheService {
  /**
   * Clear all permission cache
   */
  clearAll(): void {
    clearPermissionCache();
  }

  /**
   * Clear cache for a specific plan
   */
  clearForPlan(planId: string): void {
    clearPlanPermissionCache(planId);
  }

  /**
   * Clear cache for a specific role
   */
  clearForRole(roleId: string): void {
    clearRolePermissionCache(roleId);
  }

  /**
   * Clear cache for a specific action
   */
  clearForAction(actionSlug: string): void {
    clearActionPermissionCache(actionSlug);
  }

  /**
   * Clear cache for a specific permission entry
   */
  clearEntry(planId: string, roleId: string, actionSlug: string): void {
    // This would require the cache key, but we can reconstruct it
    // For now, we'll clear by plan which is safer
    clearPlanPermissionCache(planId);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return getCacheStats();
  }
}

// Singleton instance
export const cacheService = new CacheService();

