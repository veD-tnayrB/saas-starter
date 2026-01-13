"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/repositories/auth/session";
import { permissionService } from "@/services/permissions/permission-service";
import { memberService } from "@/services/projects/member-service";

/**
 * Server action to remove a member from a project
 */
export async function removeMemberAction(
  projectId: string,
  userIdToRemove: string,
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      throw new Error("Unauthorized");
    }

    // Security check: can the current user remove members?
    const canRemove = await permissionService.canUserPerformAction(
      user.id,
      projectId,
      "members.remove",
    );

    if (!canRemove) {
      throw new Error("Forbidden: You don't have permission to remove members");
    }

    // Prevent self-removal if needed, or handle it specifically
    // For now, let's just allow it if they have permission (e.g. an admin removing themselves)
    // but usually, it's safer to have a "Leave Project" separate action.

    await memberService.removeMember(projectId, userIdToRemove);

    revalidatePath(`/project/${projectId}/members`);
    return { success: true };
  } catch (error) {
    console.error("Error in removeMemberAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}

/**
 * Server action to update a member's role
 */
export async function updateMemberRoleAction(
  projectId: string,
  userIdToUpdate: string,
  roleNames: string[],
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      throw new Error("Unauthorized");
    }

    // Security check: can the current user manage roles?
    const canManageRoles = await permissionService.canUserPerformAction(
      user.id,
      projectId,
      "members.manage_roles",
    );

    if (!canManageRoles) {
      throw new Error("Forbidden: You don't have permission to manage roles");
    }

    await memberService.setMemberRoles(projectId, userIdToUpdate, roleNames);

    revalidatePath(`/project/${projectId}/members`);
    return { success: true };
  } catch (error) {
    console.error("Error in updateMemberRoleAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}
