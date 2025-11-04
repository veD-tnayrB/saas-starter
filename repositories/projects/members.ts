import { prisma } from "@/clients/db";
import type { ProjectRole } from "@prisma/client";

/**
 * Project member data transfer object
 */
export interface IProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project member creation data
 */
export interface IProjectMemberCreateData {
  projectId: string;
  userId: string;
  role: ProjectRole;
}

/**
 * Project member update data
 */
export interface IProjectMemberUpdateData {
  role?: ProjectRole;
}

/**
 * Find project member by project and user ID
 */
export async function findProjectMember(
  projectId: string,
  userId: string,
): Promise<IProjectMember | null> {
  try {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return member;
  } catch (error) {
    console.error("Error finding project member:", error);
    throw new Error("Failed to find project member");
  }
}

/**
 * Find all members of a project with user information
 */
export async function findProjectMembers(projectId: string): Promise<
  (IProjectMember & {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    } | null;
  })[]
> {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { role: "asc" }, // OWNER first, then ADMIN, etc.
        { createdAt: "asc" },
      ],
    });

    return members;
  } catch (error) {
    console.error("Error finding project members:", error);
    throw new Error("Failed to find project members");
  }
}

/**
 * Find all projects where user is a member
 */
export async function findUserProjectMemberships(
  userId: string,
): Promise<IProjectMember[]> {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return memberships;
  } catch (error) {
    console.error("Error finding user project memberships:", error);
    throw new Error("Failed to find user memberships");
  }
}

/**
 * Get user role in project
 */
export async function getUserProjectRole(
  projectId: string,
  userId: string,
): Promise<ProjectRole | null> {
  try {
    const member = await findProjectMember(projectId, userId);
    return member?.role ?? null;
  } catch (error) {
    console.error("Error getting user project role:", error);
    throw new Error("Failed to get user project role");
  }
}

/**
 * Create project member
 */
export async function createProjectMember(
  data: IProjectMemberCreateData,
): Promise<IProjectMember> {
  try {
    const member = await prisma.projectMember.create({
      data: {
        projectId: data.projectId,
        userId: data.userId,
        role: data.role,
      },
    });

    return member;
  } catch (error) {
    console.error("Error creating project member:", error);
    throw new Error("Failed to create project member");
  }
}

/**
 * Update project member role
 */
export async function updateProjectMember(
  projectId: string,
  userId: string,
  data: IProjectMemberUpdateData,
): Promise<IProjectMember> {
  try {
    const member = await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      data: {
        role: data.role,
      },
    });

    return member;
  } catch (error) {
    console.error("Error updating project member:", error);
    throw new Error("Failed to update project member");
  }
}

/**
 * Remove project member
 */
export async function removeProjectMember(
  projectId: string,
  userId: string,
): Promise<void> {
  try {
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  } catch (error) {
    console.error("Error removing project member:", error);
    throw new Error("Failed to remove project member");
  }
}

/**
 * Count admin memberships for a user (OWNER or ADMIN roles)
 */
export async function countAdminMemberships(userId: string): Promise<number> {
  try {
    return await prisma.projectMember.count({
      where: {
        userId,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    });
  } catch (error) {
    console.error("Error counting admin memberships:", error);
    throw new Error("Failed to count admin memberships");
  }
}
