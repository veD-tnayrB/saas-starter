import { prisma } from "@/clients/db";

/**
 * Project member data transfer object
 */
export interface IProjectMember {
  id: string;
  projectId: string;
  userId: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    priority: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project member creation data
 */
export interface IProjectMemberCreateData {
  projectId: string;
  userId: string;
  roleId: string;
}

/**
 * Project member update data
 */
export interface IProjectMemberUpdateData {
  roleId?: string;
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
      include: {
        role: true,
      },
    });

    if (!member) return null;

    return {
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      roleId: member.roleId,
      role: {
        id: member.role.id,
        name: member.role.name,
        priority: member.role.priority,
      },
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
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
        role: true,
      },
      orderBy: [
        { role: { priority: "asc" as const } }, // Lower priority first (OWNER=0, ADMIN=1, MEMBER=2)
        { createdAt: "asc" as const },
      ],
    });

    return members.map((member) => ({
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      roleId: member.roleId,
      role: {
        id: member.role.id,
        name: member.role.name,
        priority: member.role.priority,
      },
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: member.user,
    }));
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
      include: {
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return memberships.map((member) => ({
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      roleId: member.roleId,
      role: {
        id: member.role.id,
        name: member.role.name,
        priority: member.role.priority,
      },
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    }));
  } catch (error) {
    console.error("Error finding user project memberships:", error);
    throw new Error("Failed to find user memberships");
  }
}

/**
 * Get user role name in project
 * Returns the role name (OWNER, ADMIN, MEMBER) or null
 */
export async function getUserProjectRole(
  projectId: string,
  userId: string,
): Promise<string | null> {
  try {
    const member = await findProjectMember(projectId, userId);
    return member?.role.name ?? null;
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
        roleId: data.roleId,
      },
      include: {
        role: true,
      },
    });

    return {
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      roleId: member.roleId,
      role: {
        id: member.role.id,
        name: member.role.name,
        priority: member.role.priority,
      },
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
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
        roleId: data.roleId,
      },
      include: {
        role: true,
      },
    });

    return {
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      roleId: member.roleId,
      role: {
        id: member.role.id,
        name: member.role.name,
        priority: member.role.priority,
      },
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
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
 * Checks roles with priority <= 1 (OWNER=0, ADMIN=1)
 */
export async function countAdminMemberships(userId: string): Promise<number> {
  try {
    return await prisma.projectMember.count({
      where: {
        userId,
        role: {
          priority: {
            lte: 1, // OWNER (0) or ADMIN (1)
          },
        },
      },
    });
  } catch (error) {
    console.error("Error counting admin memberships:", error);
    throw new Error("Failed to count admin memberships");
  }
}
