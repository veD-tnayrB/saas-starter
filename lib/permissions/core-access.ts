/**
 * Core Access Validation
 *
 * Validates if a user can access core features.
 * Only accessible if the user is a member of the currently selected project
 * AND that project has is_core = true.
 */

import { findProjectById } from "@/repositories/projects/project";
import { findProjectMember } from "@/repositories/projects/members";

/**
 * Check if current user can access core features
 * 
 * This function verifies:
 * 1. That the project with projectId has is_core = true
 * 2. That the user (userId) is a member of that project
 * 
 * IMPORTANT: Only if the project CURRENTLY SELECTED is "core", the user can see
 * core features. If they have selected a normal project, they cannot see them
 * even if they belong to another core project.
 * 
 * @param projectId - The currently selected project ID (from URL params or pathname)
 * @param userId - The current user ID
 * @returns Promise<boolean> - true if user can access core features
 */
export async function canAccessCoreFeatures(
  projectId: string,
  userId: string,
): Promise<boolean> {
  try {
    // Get the project and verify it exists and user has access
    const project = await findProjectById(projectId, userId);
    
    if (!project) {
      return false;
    }

    // Verify the project is a core project
    if (!project.isCore) {
      return false;
    }

    // Verify the user is a member of this project
    const member = await findProjectMember(projectId, userId);
    if (!member) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking core access:", error);
    return false;
  }
}





