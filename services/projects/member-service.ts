import { findRoleByName } from "@/repositories/permissions";
import {
  addRoleToMember as addRoleToMemberRepo,
  createProjectMember,
  findProjectMember,
  findProjectMembers,
  getUserProjectRole,
  getUserProjectRoles,
  removeProjectMember,
  removeRoleFromMember as removeRoleFromMemberRepo,
  setMemberRoles as setMemberRolesRepo,
  updateProjectMember,
  type IProjectMember,
} from "@/repositories/projects/members";

import { hasPermissionLevel, hasPermissionLevelWithRoles } from "@/lib/project-roles";

/**
 * Project member service for business logic
 */
export class MemberService {
  /**
   * Check if user has permission in project
   * Checks if user has any role that meets the required permission level
   * @deprecated Use permissionService.canUserPerformAction instead
   */
  async hasPermission(
    projectId: string,
    userId: string,
    requiredRole: string, // Role name: "OWNER", "ADMIN", "MEMBER"
  ): Promise<boolean> {
    try {
      const roles = await getUserProjectRoles(projectId, userId);
      if (roles.length === 0) return false;
      return hasPermissionLevelWithRoles(roles, requiredRole);
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }

  /**
   * Get user role names in project
   * Returns array of role names (e.g., ["OWNER", "ADMIN"])
   */
  async getUserRoles(projectId: string, userId: string): Promise<string[]> {
    try {
      return await getUserProjectRoles(projectId, userId);
    } catch (error) {
      console.error("Error getting user roles:", error);
      throw new Error("Failed to get user roles");
    }
  }

  /**
   * Get user role name in project (backward compatibility)
   * Returns the first role name or null
   * @deprecated Use getUserRoles instead
   */
  async getUserRole(projectId: string, userId: string): Promise<string | null> {
    try {
      const roles = await getUserProjectRoles(projectId, userId);
      return roles[0] ?? null;
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
    roleName: string, // Role name: "OWNER", "ADMIN", "MEMBER"
  ): Promise<IProjectMember> {
    try {
      // Check if already a member
      const existing = await findProjectMember(projectId, userId);
      if (existing) {
        throw new Error("User is already a member of this project");
      }

      // Get role by name
      const role = await findRoleByName(roleName);
      if (!role) {
        throw new Error(`Role ${roleName} not found`);
      }

      return await createProjectMember({
        projectId,
        userId,
        roleId: role.id,
      });
    } catch (error) {
      console.error("Error adding member:", error);
      throw error instanceof Error ? error : new Error("Failed to add member");
    }
  }

  /**
   * Add role to member
   */
  async addRoleToMember(
    projectId: string,
    userId: string,
    roleName: string,
  ): Promise<IProjectMember> {
    try {
      const member = await findProjectMember(projectId, userId);
      if (!member) {
        throw new Error("Project member not found");
      }

      const role = await findRoleByName(roleName);
      if (!role) {
        throw new Error(`Role ${roleName} not found`);
      }

      await addRoleToMemberRepo(member.id, role.id);
      return await findProjectMember(projectId, userId) ?? member;
    } catch (error) {
      console.error("Error adding role to member:", error);
      throw error instanceof Error ? error : new Error("Failed to add role to member");
    }
  }

  /**
   * Remove role from member
   */
  async removeRoleFromMember(
    projectId: string,
    userId: string,
    roleName: string,
  ): Promise<IProjectMember> {
    try {
      const member = await findProjectMember(projectId, userId);
      if (!member) {
        throw new Error("Project member not found");
      }

      const role = await findRoleByName(roleName);
      if (!role) {
        throw new Error(`Role ${roleName} not found`);
      }

      await removeRoleFromMemberRepo(member.id, role.id);
      return await findProjectMember(projectId, userId) ?? member;
    } catch (error) {
      console.error("Error removing role from member:", error);
      throw error instanceof Error ? error : new Error("Failed to remove role from member");
    }
  }

  /**
   * Set all roles for a member (replaces existing roles)
   */
  async setMemberRoles(
    projectId: string,
    userId: string,
    roleNames: string[],
  ): Promise<IProjectMember> {
    try {
      const member = await findProjectMember(projectId, userId);
      if (!member) {
        throw new Error("Project member not found");
      }

      // Get role IDs
      const roleIds: string[] = [];
      for (const roleName of roleNames) {
        const role = await findRoleByName(roleName);
        if (!role) {
          throw new Error(`Role ${roleName} not found`);
        }
        roleIds.push(role.id);
      }

      await setMemberRolesRepo(member.id, roleIds);
      return await findProjectMember(projectId, userId) ?? member;
    } catch (error) {
      console.error("Error setting member roles:", error);
      throw error instanceof Error ? error : new Error("Failed to set member roles");
    }
  }

  /**
   * Update member role (backward compatibility)
   * Sets the role as the only role for the member
   * @deprecated Use setMemberRoles or addRoleToMember instead
   */
  async updateMemberRole(
    projectId: string,
    userId: string,
    roleName: string, // Role name: "OWNER", "ADMIN", "MEMBER"
  ): Promise<IProjectMember> {
    try {
      return await this.setMemberRoles(projectId, userId, [roleName]);
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
