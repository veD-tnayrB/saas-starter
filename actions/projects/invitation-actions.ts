"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/repositories/auth/session";
import { findPendingInvitationsByEmail } from "@/repositories/projects/invitations";
import { invitationService } from "@/services/projects/invitation-service";
import { projectService } from "@/services/projects/project-service";

/**
 * Get pending invitations for the current user
 */
export async function getUserInvitationsAction() {
  const user = await getCurrentUser();
  if (!user || !user.email) {
    throw new Error("Unauthorized");
  }

  try {
    const invitations = await findPendingInvitationsByEmail(user.email);

    // Enrich invitations with project names
    const enrichedInvitations = await Promise.all(
      invitations.map(async (invitation) => {
        const project = await projectService.getProjectById(
          invitation.projectId,
          invitation.invitedById,
        );
        return {
          ...invitation,
          projectName: project?.name || "Unknown Project",
        };
      }),
    );

    return { invitations: enrichedInvitations };
  } catch (error) {
    console.error("Error in getUserInvitationsAction:", error);
    return { invitations: [], error: "Failed to fetch invitations" };
  }
}

/**
 * Accept a project invitation
 */
export async function acceptInvitationAction(token: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await invitationService.acceptInvitation(token, user.id);
    revalidatePath("/project");
    return { success: true, projectId: result.projectId };
  } catch (error) {
    console.error("Error in acceptInvitationAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to accept invitation",
    };
  }
}

/**
 * Decline/Delete a project invitation
 */
export async function declineInvitationAction(token: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // We can use cancelInvitation logic if we allow users to cancel their own received invites
    // Actually, we just need to delete the invitation record
    const { deleteInvitationByToken } = await import(
      "@/repositories/projects/invitations"
    );
    await deleteInvitationByToken(token);

    return { success: true };
  } catch (error) {
    console.error("Error in declineInvitationAction:", error);
    return { success: false, error: "Failed to decline invitation" };
  }
}
