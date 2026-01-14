"use server";

import { getCurrentUser } from "@/repositories/auth/session";
import { isUserProjectOwner } from "@/services/projects/is-user-project-owner";

/**
 * Server action to check if the current logged-in user is the owner of a specific project.
 * This is designed to be called from Client Components.
 * @param projectId The ID of the project to check.
 * @returns A promise that resolves to true if the user is the owner, false otherwise.
 */
export async function isCurrentProjectOwner(
  projectId: string,
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }
  return isUserProjectOwner(user.id, projectId);
}
