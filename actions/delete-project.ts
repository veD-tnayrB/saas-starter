"use server";

import { revalidatePath } from "next/cache";
import { projectService } from "@/services/projects";

import { getCurrentUserId } from "@/lib/session";

interface IDeleteProjectResult {
  success: boolean;
  error?: string;
}

export async function deleteProject(
  projectId: string,
): Promise<IDeleteProjectResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await projectService.deleteProject(projectId, userId);

    revalidatePath(`/dashboard/${projectId}/projects`);
    revalidatePath("/dashboard", "layout");
    revalidatePath("/", "layout");

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
