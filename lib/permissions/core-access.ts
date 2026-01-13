/**
 * Core Access Validation
 *
 * Validates if a user can access core features.
 * Only accessible if the user is a member of the currently selected project
 * AND that project has is_core = true.
 */

import { isSystemAdmin } from "@/services/auth/platform-admin";

/**
 * Check if current user can access core features
 *
 * In this version, core features are accessible to any System Administrator
 * regardless of the current project.
 *
 * @param projectId - The currently selected project ID
 * @param userId - The current user ID
 * @returns Promise<boolean> - true if user can access core features
 */
export async function canAccessCoreFeatures(
  projectId: string,
  userId: string,
): Promise<boolean> {
  try {
    // A system admin has global access to core features
    return await isSystemAdmin(userId);
  } catch (error) {
    console.error("Error checking core access:", error);
    return false;
  }
}
