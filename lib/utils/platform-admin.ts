import { prisma } from "@/lib/db";

/**
 * Check if user has platform admin privileges
 * A user is a platform admin if they are OWNER or ADMIN in any project
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  try {
    // Check if user is OWNER of any project
    const ownedProjects = await prisma.project.count({
      where: { ownerId: userId },
    });

    if (ownedProjects > 0) {
      return true;
    }

    // Check if user has ADMIN role in any project
    const adminMemberships = await prisma.projectMember.count({
      where: {
        userId,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    });

    return adminMemberships > 0;
  } catch (error) {
    console.error("Error checking platform admin status:", error);
    return false;
  }
}
