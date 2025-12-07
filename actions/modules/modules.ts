"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import type {
  IModuleCreateData,
  IModuleUpdateData,
} from "@/repositories/modules/modules";
import { moduleService } from "@/services/modules";

/**
 * Get all modules
 * Requires core project access
 */
export async function getModules(projectId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const modules = await moduleService.getModules(projectId, user.id);
    return { modules };
  } catch (error) {
    console.error("Error getting modules:", error);
    if (error instanceof Error && error.message.includes("Access denied")) {
      throw new Error("Forbidden");
    }
    throw new Error("Failed to get modules");
  }
}

/**
 * Get module by ID with actions
 * Requires core project access
 */
export async function getModuleById(moduleId: string, projectId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const module = await moduleService.getModuleById(
      moduleId,
      projectId,
      user.id,
    );
    return { module };
  } catch (error) {
    console.error("Error getting module:", error);
    if (error instanceof Error && error.message.includes("Access denied")) {
      throw new Error("Forbidden");
    }
    throw new Error("Failed to get module");
  }
}

/**
 * Create a new module
 * Requires core project access
 */
export async function createModuleAction(
  data: IModuleCreateData,
  projectId: string,
) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const module = await moduleService.createModule(data, projectId, user.id);
    return { module };
  } catch (error) {
    console.error("Error creating module:", error);
    if (error instanceof Error && error.message.includes("Access denied")) {
      throw new Error("Forbidden");
    }
    throw error instanceof Error ? error : new Error("Failed to create module");
  }
}

/**
 * Update a module
 * Requires core project access
 */
export async function updateModuleAction(
  moduleId: string,
  data: IModuleUpdateData,
  projectId: string,
) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const module = await moduleService.updateModule(
      moduleId,
      data,
      projectId,
      user.id,
    );
    return { module };
  } catch (error) {
    console.error("Error updating module:", error);
    if (error instanceof Error && error.message.includes("Access denied")) {
      throw new Error("Forbidden");
    }
    throw error instanceof Error ? error : new Error("Failed to update module");
  }
}

/**
 * Delete a module
 * Requires core project access
 */
export async function deleteModuleAction(moduleId: string, projectId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  try {
    await moduleService.deleteModule(moduleId, projectId, user.id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting module:", error);
    if (error instanceof Error && error.message.includes("Access denied")) {
      throw new Error("Forbidden");
    }
    throw new Error("Failed to delete module");
  }
}

/**
 * Set actions for a module (replaces all existing actions)
 * Requires core project access
 */
export async function setModuleActionsAction(
  moduleId: string,
  actionIds: string[],
  projectId: string,
) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const actions = await moduleService.setModuleActions(
      moduleId,
      actionIds,
      projectId,
      user.id,
    );
    return { actions };
  } catch (error) {
    console.error("Error setting module actions:", error);
    if (error instanceof Error && error.message.includes("Access denied")) {
      throw new Error("Forbidden");
    }
    throw new Error("Failed to set module actions");
  }
}




