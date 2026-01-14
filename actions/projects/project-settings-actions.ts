"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/repositories/auth/session";
import { deleteProject, updateProject } from "@/repositories/projects/project";
import { auditLogService } from "@/services/projects/audit-log-service";
import { memberService } from "@/services/projects/member-service";
import { projectService } from "@/services/projects/project-service";

/**
 * Update project name
 * Requires user to be project member with edit permissions
 */
export async function updateProjectNameAction(projectId: string, name: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Validate input
    if (!name || name.trim().length === 0) {
      return { success: false, error: "Project name cannot be empty" };
    }

    if (name.trim().length > 100) {
      return {
        success: false,
        error: "Project name is too long (max 100 characters)",
      };
    }

    // Verify user is a member of the project
    const project = await projectService.getProjectById(projectId, user.id);
    if (!project) {
      return { success: false, error: "Project not found or access denied" };
    }

    // Update project name
    await updateProject(projectId, { name: name.trim() });

    // Log the action
    await auditLogService.logProjectUpdate(
      projectId,
      user.id,
      { name: project.name },
      { name: name.trim() },
    );

    // Revalidate relevant paths
    revalidatePath(`/project/${projectId}/settings`);
    revalidatePath(`/project/${projectId}/dashboard`);

    return { success: true };
  } catch (error) {
    console.error("Error updating project name:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update project name",
    };
  }
}

/**
 * Delete project
 * OWNER only - permanently deletes the project and all associated data
 */
export async function deleteProjectAction(
  projectId: string,
  confirmationName: string,
) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get project and verify access
    const project = await projectService.getProjectById(projectId, user.id);
    if (!project) {
      return { success: false, error: "Project not found or access denied" };
    }

    // Verify confirmation name matches
    if (confirmationName !== project.name) {
      return {
        success: false,
        error: "Project name confirmation does not match",
      };
    }

    // Check if user is the OWNER
    const userRole = await memberService.getUserRole(projectId, user.id);
    if (userRole !== "OWNER") {
      return {
        success: false,
        error: "Only project owners can delete projects",
      };
    }

    // Log the deletion before actually deleting
    await auditLogService.logAction(
      projectId,
      user.id,
      "project.delete",
      "project",
      projectId,
      { projectName: project.name },
    );

    // Delete the project (cascade will handle related data)
    await deleteProject(projectId);

    // Redirect will be handled by the client
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete project",
    };
  }
}
