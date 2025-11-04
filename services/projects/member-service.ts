import {
  createProjectMember,
  findProjectMember,
  findProjectMembers,
  getUserProjectRole,
  removeProjectMember,
  updateProjectMember,
  type IProjectMember,
} from "@/repositories/projects/members";
import type { ProjectRole } from "@prisma/client";

/**
 * Project member service for business logic
 */
export class MemberService {
  /**
   * Check if user has permission in project
   */
  async hasPermission(
    projectId: string,
    userId: string,
    requiredRole: ProjectRole,
  ): Promise<boolean> {
    try {
      const role = await getUserProjectRole(projectId, userId);
      if (!role) return false;

      const roleHierarchy: Record<ProjectRole, number> = {
        OWNER: 3,
        ADMIN: 2,
        MEMBER: 1,
      };

      return roleHierarchy[role] >= roleHierarchy[requiredRole];
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }

  /**
   * Get user role in project
   */
  async getUserRole(
    projectId: string,
    userId: string,
  ): Promise<ProjectRole | null> {
    try {
      return await getUserProjectRole(projectId, userId);
    } catch (error) {
      console.error("Error getting user role:", error);
      throw new Error("Failed to get user role");
    }
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: string): Promise<IProjectMember[]> {
    try {
      return await findProjectMembers(projectId);
    } catch (error) {
      console.error("Error getting project members:", error);
      throw new Error("Failed to get project members");
    }
  }

  /**
   * Check if user is project member
   */
  async isProjectMember(projectId: string, userId: string): Promise<boolean> {
    try {
      const member = await findProjectMember(projectId, userId);
      return !!member;
    } catch (error) {
      console.error("Error checking project membership:", error);
      return false;
    }
  }

  /**
   * Add member to project
   */
  async addMember(
    projectId: string,
    userId: string,
    role: ProjectRole,
  ): Promise<IProjectMember> {
    try {
      // Check if already a member
      const existing = await findProjectMember(projectId, userId);
      if (existing) {
        throw new Error("User is already a member of this project");
      }

      return await createProjectMember({
        projectId,
        userId,
        role,
      });
    } catch (error) {
      console.error("Error adding member:", error);
      throw error instanceof Error ? error : new Error("Failed to add member");
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    projectId: string,
    userId: string,
    role: ProjectRole,
  ): Promise<IProjectMember> {
    try {
      return await updateProjectMember(projectId, userId, { role });
    } catch (error) {
      console.error("Error updating member role:", error);
      throw new Error("Failed to update member role");
    }
  }

  /**
   * Remove member from project
   */
  async removeMember(projectId: string, userId: string): Promise<void> {
    try {
      await removeProjectMember(projectId, userId);
    } catch (error) {
      console.error("Error removing member:", error);
      throw new Error("Failed to remove member");
    }
  }
}

export const memberService = new MemberService();
