import { getUserProjectRoles } from "@/repositories/projects/members";
import { PROJECT_ROLES } from "@/lib/project-roles";

/**
 * Checks if a user is the owner of a specific project.
 *
 * @param userId - The ID of the user.
 * @param projectId - The ID of the project.
 * @returns A promise that resolves to true if the user is the project owner, false otherwise.
 */
export async function isUserProjectOwner(
  userId: string,
  projectId: string,
): Promise<boolean> {
  if (!userId || !projectId) {
    return false;
  }

  try {
    const roles = await getUserProjectRoles(projectId, userId);
    return roles.includes(PROJECT_ROLES.OWNER);
  } catch (error) {
    console.error("Error checking project ownership:", error);
    return false;
  }
}
