"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { assignPlanToProject } from "@/repositories/permissions/plans";

import { checkPermission } from "@/lib/check-permission";

export async function updateProjectPlanAction(
  projectId: string,
  planId: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // 1. Check if user has permission to update settings in this project
    // "settings.update" is a common slug for this
    await checkPermission(projectId, "settings.update");

    // 2. Assign plan to project
    await assignPlanToProject(projectId, planId);

    // 3. Record audit log
    const { auditLogService } = await import(
      "@/services/projects/audit-log-service"
    );
    await auditLogService.logPlanUpdate(projectId, session.user.id, planId);

    // 4. Revalidate paths
    revalidatePath(`/project/${projectId}/settings`);
    revalidatePath(`/project/${projectId}/dashboard`);

    return { status: "success" };
  } catch (error) {
    console.error("Error updating project plan:", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to update project plan",
    };
  }
}
