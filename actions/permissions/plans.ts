"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import {
  createPlan,
  findAllPlans,
  updatePlan,
  type ISubscriptionPlanCreateData,
  type ISubscriptionPlanUpdateData,
} from "@/repositories/permissions";

import { canAccessAdminPages } from "@/lib/permissions/admin-access";

/**
 * Get all plans
 */
export async function getPlans() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await canAccessAdminPages();
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  try {
    const plans = await findAllPlans();
    return { plans };
  } catch (error) {
    console.error("Error getting plans:", error);
    throw new Error("Failed to get plans");
  }
}

/**
 * Create a new plan
 */
export async function createPlanAction(data: ISubscriptionPlanCreateData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await canAccessAdminPages();
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  try {
    const plan = await createPlan(data);
    return { plan };
  } catch (error) {
    console.error("Error creating plan:", error);
    throw new Error("Failed to create plan");
  }
}

/**
 * Update a plan
 */
export async function updatePlanAction(
  planId: string,
  data: ISubscriptionPlanUpdateData,
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
    const plan = await updatePlan(planId, data);
    return { plan };
  } catch (error) {
    console.error("Error updating plan:", error);
    throw new Error("Failed to update plan");
  }
}
