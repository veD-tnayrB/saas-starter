import { randomUUID } from "crypto";
import { ProjectInvitationEmail } from "@/emails/project-invitation-email";
import { findUserByEmail, findUserById } from "@/repositories/auth/user";
import { findRoleByName } from "@/repositories/permissions";
import {
  createProjectInvitation,
  deleteInvitationByToken,
  findInvitationByEmailAndProject,
  findInvitationByToken,
  findProjectInvitations,
  type IProjectInvitation,
} from "@/repositories/projects/invitations";
import {
  createProjectMember,
  findProjectMember,
  setMemberRoles,
} from "@/repositories/projects/members";
import { render } from "@react-email/render";
import { Resend } from "resend";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

import { memberService } from "./member-service";
import { projectService } from "./project-service";

/**
 * Invitation service for business logic
 */
export class InvitationService {
  private get resend() {
    return new Resend(env.RESEND_API_KEY);
  }

  /**
   * Create and send project invitation
   * Supports multiple roles per invitation
   */
  async createInvitation(
    projectId: string,
    email: string,
    roleNames: string[], // Array of role names: ["OWNER", "ADMIN", "MEMBER"]
    invitedById: string,
  ): Promise<IProjectInvitation> {
    try {
      if (roleNames.length === 0) {
        throw new Error("At least one role is required");
      }

      // Validate project exists and inviter has access
      const project = await projectService.getProjectById(projectId, invitedById);
      if (!project) {
        throw new Error("Project not found");
      }

      // Check if user is already a member
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        const member = await findProjectMember(projectId, existingUser.id);
        if (member) {
          throw new Error("User is already a member of this project");
        }
      }

      // Check if there's already a pending invitation
      const existingInvitation = await findInvitationByEmailAndProject(
        email,
        projectId,
      );
      if (existingInvitation) {
        throw new Error("Invitation already sent to this email");
      }

      // Get role IDs by names
      const roleIds: string[] = [];
      for (const roleName of roleNames) {
        const role = await findRoleByName(roleName);
        if (!role) {
          throw new Error(`Role ${roleName} not found`);
        }
        roleIds.push(role.id);
      }

      // Generate token and expiration (7 days)
      const token = randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Create invitation with multiple roles
      const invitation = await createProjectInvitation({
        projectId,
        email,
        roleIds,
        invitedById,
        token,
        expiresAt,
      });

      // Get inviter info
      const inviter = await findUserById(invitedById);

      // Send invitation email
      await this.sendInvitationEmail({
        invitation,
        projectName: project.name,
        inviterName: inviter?.name || "Someone",
        inviterEmail: inviter?.email || "",
      });

      return invitation;
    } catch (error) {
      console.error("Error creating invitation:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to create invitation");
    }
  }

  /**
   * Send invitation email
   */
  private async sendInvitationEmail(data: {
    invitation: IProjectInvitation;
    projectName: string;
    inviterName: string;
    inviterEmail: string;
  }): Promise<void> {
    try {
      const acceptUrl = `${env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${data.invitation.token}`;

      // Get role names for display (use first role or all if multiple)
      const roleNames = data.invitation.roles.map((r) => r.name).join(", ");
      const primaryRole = data.invitation.roles[0]?.name ?? "MEMBER";

      const html = await render(
        ProjectInvitationEmail({
          projectName: data.projectName,
          inviterName: data.inviterName,
          role: primaryRole, // Use first role for email template
          acceptUrl,
          siteName: siteConfig.name,
        }) as React.ReactElement,
      );

      const text = `
        You've been invited to join "${data.projectName}" on ${siteConfig.name}

        ${data.inviterName} has invited you to join their project with role(s): ${roleNames}.

        Accept invitation: ${acceptUrl}

        This invitation expires in 7 days.
      `;

      const { data: emailData, error } = await this.resend.emails.send({
        from: env.EMAIL_FROM,
        to: data.invitation.email,
        subject: `You've been invited to join ${data.projectName}`,
        html,
        text,
      });

      if (error || !emailData) {
        throw new Error(error?.message || "Failed to send invitation email");
      }
    } catch (error) {
      console.error("Error sending invitation email:", error);
      throw new Error("Failed to send invitation email");
    }
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(
    token: string,
    userId: string,
  ): Promise<{
    projectId: string;
    success: boolean;
  }> {
    try {
      // Find invitation
      const invitation = await findInvitationByToken(token);
      if (!invitation) {
        throw new Error("Invitation not found");
      }

      // Check expiration
      if (new Date() > invitation.expiresAt) {
        throw new Error("Invitation has expired");
      }

      // Verify user email matches invitation email
      const user = await findUserById(userId);
      if (!user || user.email !== invitation.email) {
        throw new Error("Email does not match invitation");
      }

      // Check if already a member
      const existingMember = await findProjectMember(
        invitation.projectId,
        userId,
      );
      if (existingMember) {
        // Delete invitation and return project
        await deleteInvitationByToken(token);
        return {
          projectId: invitation.projectId,
          success: true,
        };
      }

      // Add user as project member with all roles from invitation
      const member = await createProjectMember({
        projectId: invitation.projectId,
        userId,
        roleId: invitation.roles[0]?.id ?? "", // Use first role for backward compatibility
      });

      // Add all other roles if there are multiple
      if (invitation.roles.length > 1) {
        const roleIds = invitation.roles.map((r) => r.id);
        await setMemberRoles(member.id, roleIds);
      }

      // Delete invitation
      await deleteInvitationByToken(token);

      return {
        projectId: invitation.projectId,
        success: true,
      };
    } catch (error) {
      console.error("Error accepting invitation:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to accept invitation");
    }
  }

  /**
   * Get project invitations
   */
  async getProjectInvitations(
    projectId: string,
  ): Promise<IProjectInvitation[]> {
    try {
      return await findProjectInvitations(projectId);
    } catch (error) {
      console.error("Error getting project invitations:", error);
      throw new Error("Failed to get project invitations");
    }
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(token: string, userId: string): Promise<void> {
    try {
      const invitation = await findInvitationByToken(token);
      if (!invitation) {
        throw new Error("Invitation not found");
      }

      // Verify user has permission (owner or admin)
      const hasPermission = await memberService.hasPermission(
        invitation.projectId,
        userId,
        "ADMIN",
      );
      if (!hasPermission) {
        throw new Error("You don't have permission to cancel this invitation");
      }

      await deleteInvitationByToken(token);
    } catch (error) {
      console.error("Error canceling invitation:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to cancel invitation");
    }
  }
}

export const invitationService = new InvitationService();
