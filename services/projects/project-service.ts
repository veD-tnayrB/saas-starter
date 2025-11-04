import {
  findAllUserProjects,
  findProjectById,
  type IProject,
  type IProjectCreateData,
  type IProjectUpdateData,
} from "@/repositories/projects/project";
import type { ProjectRole } from "@prisma/client";

import { prisma } from "@/lib/db";

import { invitationService } from "./invitation-service";
import { memberService } from "./member-service";

/**
 * Project creation data with optional members
 */
export interface IProjectCreateWithMembersData extends IProjectCreateData {
  members?: Array<{
    email: string;
    role: ProjectRole;
  }>;
}

/**
 * Project service for business logic
 */
export class ProjectService {
  /**
   * Create a new project with owner as member (atomic transaction)
   * Optionally accepts initial members (will send invitations if they don't exist)
   */
  async createProject(
    data: IProjectCreateWithMembersData,
  ): Promise<
    IProject & { members: Array<{ email: string; role: ProjectRole }> }
  > {
    try {
      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Create project
        const project = await tx.project.create({
          data: {
            name: data.name,
            ownerId: data.ownerId,
          },
          select: {
            id: true,
            name: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // Add owner as OWNER member
        await tx.projectMember.create({
          data: {
            projectId: project.id,
            userId: data.ownerId,
            role: "OWNER",
          },
        });

        return project;
      });

      // Handle initial members (send invitations for non-existent users)
      const memberResults: Array<{ email: string; role: ProjectRole }> = [];
      if (data.members && data.members.length > 0) {
        for (const member of data.members) {
          try {
            // Try to find user by email
            const { findUserByEmail } = await import(
              "@/repositories/auth/user"
            );
            const existingUser = await findUserByEmail(member.email);

            if (existingUser) {
              // User exists, add as member directly
              await memberService.addMember(
                result.id,
                existingUser.id,
                member.role,
              );
              memberResults.push({ email: member.email, role: member.role });
            } else {
              // User doesn't exist, send invitation
              await invitationService.createInvitation(
                result.id,
                member.email,
                member.role,
                data.ownerId,
              );
              memberResults.push({ email: member.email, role: member.role });
            }
          } catch (error) {
            console.error(`Error processing member ${member.email}:`, error);
            // Continue with other members even if one fails
          }
        }
      }

      return {
        ...result,
        members: memberResults,
      };
    } catch (error) {
      console.error("Error creating project:", error);
      throw new Error("Failed to create project");
    }
  }

  /**
   * Create personal project for a new user
   */
  async createPersonalProject(
    userId: string,
    userName: string | null,
  ): Promise<IProject> {
    const projectName = userName ? `${userName}'s Project` : "My Project";

    return this.createProject({
      name: projectName,
      ownerId: userId,
    });
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<IProject | null> {
    try {
      return await findProjectById(id);
    } catch (error) {
      console.error("Error getting project:", error);
      throw new Error("Failed to get project");
    }
  }

  /**
   * Get user's projects (owned + member)
   */
  async getUserProjects(userId: string): Promise<
    Array<
      IProject & {
        userRole: ProjectRole;
        owner: { id: string; name: string | null; email: string | null };
        memberCount: number;
      }
    >
  > {
    try {
      const projects = await findAllUserProjects(userId);

      // Enrich with user role, owner info, and member count
      const enrichedProjects = await Promise.all(
        projects.map(async (project) => {
          const userRole = await memberService.getUserRole(project.id, userId);
          const members = await memberService.getProjectMembers(project.id);

          // Get owner info
          const { findUserById } = await import("@/repositories/auth/user");
          const owner = await findUserById(project.ownerId);

          return {
            ...project,
            userRole: userRole || ("MEMBER" as ProjectRole),
            owner: {
              id: owner?.id || project.ownerId,
              name: owner?.name || null,
              email: owner?.email || null,
            },
            memberCount: members.length,
          };
        }),
      );

      return enrichedProjects;
    } catch (error) {
      console.error("Error getting user projects:", error);
      throw new Error("Failed to get user projects");
    }
  }

  /**
   * Update project and manage members
   */
  async updateProject(
    id: string,
    data: IProjectUpdateData & {
      members?: Array<{
        email: string;
        role: ProjectRole;
        action: "add" | "update" | "remove";
      }>;
    },
    userId: string,
  ): Promise<
    IProject & { members: Array<{ email: string; role: ProjectRole }> }
  > {
    try {
      // Check permission
      const userRole = await memberService.getUserRole(id, userId);
      if (!userRole || (userRole !== "OWNER" && userRole !== "ADMIN")) {
        throw new Error("You don't have permission to update this project");
      }

      // Update project name if provided
      if (data.name) {
        const { updateProject } = await import(
          "@/repositories/projects/project"
        );
        await updateProject(id, { name: data.name });
      }

      // Handle member updates
      const memberResults: Array<{ email: string; role: ProjectRole }> = [];
      if (data.members && data.members.length > 0) {
        for (const member of data.members) {
          try {
            const { findUserByEmail } = await import(
              "@/repositories/auth/user"
            );
            const existingUser = await findUserByEmail(member.email);

            if (member.action === "remove") {
              if (existingUser) {
                await memberService.removeMember(id, existingUser.id);
              }
              // Also cancel any pending invitations
              const { findInvitationByEmailAndProject } = await import(
                "@/repositories/projects/invitations"
              );
              const invitation = await findInvitationByEmailAndProject(
                member.email,
                id,
              );
              if (invitation) {
                const { deleteInvitationByToken } = await import(
                  "@/repositories/projects/invitations"
                );
                await deleteInvitationByToken(invitation.token);
              }
            } else if (existingUser) {
              // User exists - add or update member
              const isMember = await memberService.isProjectMember(
                id,
                existingUser.id,
              );
              if (isMember) {
                if (member.action === "update") {
                  await memberService.updateMemberRole(
                    id,
                    existingUser.id,
                    member.role,
                  );
                  memberResults.push({
                    email: member.email,
                    role: member.role,
                  });
                }
              } else {
                if (member.action === "add") {
                  await memberService.addMember(
                    id,
                    existingUser.id,
                    member.role,
                  );
                  memberResults.push({
                    email: member.email,
                    role: member.role,
                  });
                }
              }
            } else {
              // User doesn't exist - send invitation
              if (member.action === "add" || member.action === "update") {
                await invitationService.createInvitation(
                  id,
                  member.email,
                  member.role,
                  userId,
                );
                memberResults.push({ email: member.email, role: member.role });
              }
            }
          } catch (error) {
            console.error(`Error processing member ${member.email}:`, error);
            // Continue with other members even if one fails
          }
        }
      }

      const updatedProject = await findProjectById(id);
      if (!updatedProject) {
        throw new Error("Project not found after update");
      }

      return {
        ...updatedProject,
        members: memberResults,
      };
    } catch (error) {
      console.error("Error updating project:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to update project");
    }
  }

  /**
   * Delete project (only OWNER can delete)
   */
  async deleteProject(id: string, userId: string): Promise<void> {
    try {
      // Check if user is OWNER
      const userRole = await memberService.getUserRole(id, userId);
      if (userRole !== "OWNER") {
        throw new Error("Only the project owner can delete the project");
      }

      // Verify user is the actual owner
      const project = await findProjectById(id);
      if (!project) {
        throw new Error("Project not found");
      }
      if (project.ownerId !== userId) {
        throw new Error("Only the project owner can delete the project");
      }

      // Delete project (cascade will handle members and invitations)
      const { deleteProject } = await import("@/repositories/projects/project");
      await deleteProject(id);
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to delete project");
    }
  }
}

export const projectService = new ProjectService();
