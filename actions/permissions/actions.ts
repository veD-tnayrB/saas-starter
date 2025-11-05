"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import {
  createAction,
  deleteAction,
  findAllActions,
  updateAction,
  type IActionCreateData,
  type IActionUpdateData,
} from "@/repositories/permissions";

import { canAccessAdminPages } from "@/lib/permissions/admin-access";

/**
 * Get all actions
 */
export async function getActions() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await canAccessAdminPages();
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  try {
    const actions = await findAllActions();
    return { actions };
  } catch (error) {
    console.error("Error getting actions:", error);
    throw new Error("Failed to get actions");
  }
}

/**
 * Create a new action
 */
export async function createActionAction(data: IActionCreateData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await canAccessAdminPages();
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  try {
    const action = await createAction(data);
    return { action };
  } catch (error) {
    console.error("Error creating action:", error);
    throw new Error("Failed to create action");
  }
}

/**
 * Update an action
 */
export async function updateActionAction(
  actionId: string,
  data: IActionUpdateData,
) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await canAccessAdminPages();
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  try {
    const action = await updateAction(actionId, data);
    return { action };
  } catch (error) {
    console.error("Error updating action:", error);
    throw new Error("Failed to update action");
  }
}

/**
 * Delete an action
 */
export async function deleteActionAction(actionId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await canAccessAdminPages();
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  try {
    await deleteAction(actionId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting action:", error);
    throw new Error("Failed to delete action");
  }
}
