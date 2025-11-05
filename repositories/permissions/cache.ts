import NodeCache from "node-cache";

/**
 * In-memory cache for permissions
 * TTL: 5-10 minutes (300-600 seconds)
 */
const permissionCache = new NodeCache({
  stdTTL: 600, // 10 minutes default TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Performance optimization
});

/**
 * Generate cache key for permission check
 */
export function getPermissionCacheKey(
  planId: string,
  roleId: string,
  actionSlug: string,
): string {
  return `permission:${planId}:${roleId}:${actionSlug}`;
}

/**
 * Get cached permission result
 */
export function getCachedPermission(key: string): boolean | undefined {
  return permissionCache.get<boolean>(key);
}

/**
 * Set cached permission result
 */
export function setCachedPermission(
  key: string,
  value: boolean,
  ttl?: number,
): void {
  permissionCache.set(key, value, ttl ?? 600);
}

/**
 * Clear all cached permissions
 */
export function clearPermissionCache(): void {
  permissionCache.flushAll();
}

/**
 * Clear specific permission cache entry
 */
export function clearPermissionCacheEntry(key: string): void {
  permissionCache.del(key);
}

/**
 * Clear cache for a specific plan
 */
export function clearPlanPermissionCache(planId: string): void {
  const keys = permissionCache.keys();
  const planKeys = keys.filter((key) =>
    key.toString().startsWith(`permission:${planId}:`),
  );
  permissionCache.del(planKeys);
}

/**
 * Clear cache for a specific role
 */
export function clearRolePermissionCache(roleId: string): void {
  const keys = permissionCache.keys();
  const roleKeys = keys.filter((key) => key.toString().includes(`:${roleId}:`));
  permissionCache.del(roleKeys);
}

/**
 * Clear cache for a specific action
 */
export function clearActionPermissionCache(actionSlug: string): void {
  const keys = permissionCache.keys();
  const actionKeys = keys.filter((key) =>
    key.toString().endsWith(`:${actionSlug}`),
  );
  permissionCache.del(actionKeys);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return permissionCache.getStats();
}

