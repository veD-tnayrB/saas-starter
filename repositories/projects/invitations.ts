import { prisma } from "@/clients/db";

/**
 * Project invitation data transfer object
 */
export interface IProjectInvitation {
  id: string;
  projectId: string;
  email: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    priority: number;
  };
  invitedById: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Project invitation creation data
 */
export interface IProjectInvitationCreateData {
  projectId: string;
  email: string;
  roleId: string;
  invitedById: string;
  token: string;
  expiresAt: Date;
}

/**
 * Find invitation by token
 */
export async function findInvitationByToken(
  token: string,
): Promise<IProjectInvitation | null> {
  try {
    const invitation = await prisma.projectInvitation.findUnique({
      where: { token },
      include: {
        role: true,
      },
    });

    if (!invitation) return null;

    return {
      id: invitation.id,
      projectId: invitation.projectId,
      email: invitation.email,
      roleId: invitation.roleId,
      role: {
        id: invitation.role.id,
        name: invitation.role.name,
        priority: invitation.role.priority,
      },
      invitedById: invitation.invitedById,
      token: invitation.token,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    };
  } catch (error) {
    console.error("Error finding invitation by token:", error);
    throw new Error("Failed to find invitation");
  }
}

/**
 * Find invitation by email and project
 */
export async function findInvitationByEmailAndProject(
  email: string,
  projectId: string,
): Promise<IProjectInvitation | null> {
  try {
    const invitation = await prisma.projectInvitation.findFirst({
      where: {
        email,
        projectId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!invitation) return null;

    return {
      id: invitation.id,
      projectId: invitation.projectId,
      email: invitation.email,
      roleId: invitation.roleId,
      role: {
        id: invitation.role.id,
        name: invitation.role.name,
        priority: invitation.role.priority,
      },
      invitedById: invitation.invitedById,
      token: invitation.token,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    };
  } catch (error) {
    console.error("Error finding invitation by email and project:", error);
    throw new Error("Failed to find invitation");
  }
}

/**
 * Find all invitations for a project
 */
export async function findProjectInvitations(
  projectId: string,
): Promise<IProjectInvitation[]> {
  try {
    const invitations = await prisma.projectInvitation.findMany({
      where: {
        projectId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return invitations.map((invitation) => ({
      id: invitation.id,
      projectId: invitation.projectId,
      email: invitation.email,
      roleId: invitation.roleId,
      role: {
        id: invitation.role.id,
        name: invitation.role.name,
        priority: invitation.role.priority,
      },
      invitedById: invitation.invitedById,
      token: invitation.token,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    }));
  } catch (error) {
    console.error("Error finding project invitations:", error);
    throw new Error("Failed to find project invitations");
  }
}

/**
 * Find all pending invitations for a user by email
 */
export async function findPendingInvitationsByEmail(
  email: string,
): Promise<IProjectInvitation[]> {
  try {
    const invitations = await prisma.projectInvitation.findMany({
      where: {
        email,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return invitations.map((invitation) => ({
      id: invitation.id,
      projectId: invitation.projectId,
      email: invitation.email,
      roleId: invitation.roleId,
      role: {
        id: invitation.role.id,
        name: invitation.role.name,
        priority: invitation.role.priority,
      },
      invitedById: invitation.invitedById,
      token: invitation.token,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    }));
  } catch (error) {
    console.error("Error finding pending invitations by email:", error);
    throw new Error("Failed to find pending invitations");
  }
}

/**
 * Create project invitation
 */
export async function createProjectInvitation(
  data: IProjectInvitationCreateData,
): Promise<IProjectInvitation> {
  try {
    const invitation = await prisma.projectInvitation.create({
      data: {
        projectId: data.projectId,
        email: data.email,
        roleId: data.roleId,
        invitedById: data.invitedById,
        token: data.token,
        expiresAt: data.expiresAt,
      },
      include: {
        role: true,
      },
    });

    return {
      id: invitation.id,
      projectId: invitation.projectId,
      email: invitation.email,
      roleId: invitation.roleId,
      role: {
        id: invitation.role.id,
        name: invitation.role.name,
        priority: invitation.role.priority,
      },
      invitedById: invitation.invitedById,
      token: invitation.token,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    };
  } catch (error) {
    console.error("Error creating project invitation:", error);
    throw new Error("Failed to create project invitation");
  }
}

/**
 * Delete invitation
 */
export async function deleteInvitation(id: string): Promise<void> {
  try {
    await prisma.projectInvitation.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting invitation:", error);
    throw new Error("Failed to delete invitation");
  }
}

/**
 * Delete invitation by token
 */
export async function deleteInvitationByToken(token: string): Promise<void> {
  try {
    await prisma.projectInvitation.delete({
      where: { token },
    });
  } catch (error) {
    console.error("Error deleting invitation by token:", error);
    throw new Error("Failed to delete invitation");
  }
}

/**
 * Clean up expired invitations
 */
export async function cleanupExpiredInvitations(): Promise<number> {
  try {
    const result = await prisma.projectInvitation.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error("Error cleaning up expired invitations:", error);
    throw new Error("Failed to cleanup expired invitations");
  }
}
