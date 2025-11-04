import {
  countAdminMemberships,
  countProjectsByOwner,
} from "@/repositories/projects";

/**
 * Check if user has platform admin privileges
 * A user is a platform admin if they are OWNER or ADMIN in any project
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  try {
    // Check if user is OWNER of any project
    const ownedProjects = await countProjectsByOwner(userId);

    if (ownedProjects > 0) {
      return true;
    }

    // Check if user has ADMIN role in any project
    const adminMemberships = await countAdminMemberships(userId);

    return adminMemberships > 0;
  } catch (error) {
    console.error("Error checking platform admin status:", error);
    return false;
  }
}

