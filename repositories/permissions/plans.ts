import { prisma } from "@/clients/db";

export interface ISubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionPlanCreateData {
  name: string;
  displayName: string;
  description?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  isActive?: boolean;
}

export interface ISubscriptionPlanUpdateData {
  name?: string;
  displayName?: string;
  description?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  isActive?: boolean;
}

/**
 * Find all plans
 */
export async function findAllPlans(): Promise<ISubscriptionPlan[]> {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { name: "asc" },
    });
    return plans;
  } catch (error) {
    console.error("Error finding all plans:", error);
    throw new Error("Failed to find plans");
  }
}

/**
 * Find active plans only
 */
export async function findActivePlans(): Promise<ISubscriptionPlan[]> {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return plans;
  } catch (error) {
    console.error("Error finding active plans:", error);
    throw new Error("Failed to find active plans");
  }
}

/**
 * Find plan by ID
 */
export async function findPlanById(
  planId: string,
): Promise<ISubscriptionPlan | null> {
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    return plan;
  } catch (error) {
    console.error("Error finding plan by ID:", error);
    throw new Error("Failed to find plan");
  }
}

/**
 * Find plan by name
 */
export async function findPlanByName(
  name: string,
): Promise<ISubscriptionPlan | null> {
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { name },
    });
    return plan;
  } catch (error) {
    console.error("Error finding plan by name:", error);
    throw new Error("Failed to find plan");
  }
}

/**
 * Find plan by Stripe price ID
 */
export async function findPlanByStripePriceId(
  priceId: string,
): Promise<ISubscriptionPlan | null> {
  try {
    const plan = await prisma.subscriptionPlan.findFirst({
      where: {
        OR: [
          { stripePriceIdMonthly: priceId },
          { stripePriceIdYearly: priceId },
        ],
      },
    });
    return plan;
  } catch (error) {
    console.error("Error finding plan by Stripe price ID:", error);
    throw new Error("Failed to find plan");
  }
}

/**
 * Get project's subscription plan
 */
export async function getProjectSubscriptionPlan(
  projectId: string,
): Promise<ISubscriptionPlan | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { subscriptionPlan: true },
    });

    return project?.subscriptionPlan ?? null;
  } catch (error) {
    console.error("Error getting project subscription plan:", error);
    throw new Error("Failed to get project subscription plan");
  }
}

/**
 * Create a new plan
 */
export async function createPlan(
  data: ISubscriptionPlanCreateData,
): Promise<ISubscriptionPlan> {
  try {
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description ?? null,
        stripePriceIdMonthly: data.stripePriceIdMonthly ?? null,
        stripePriceIdYearly: data.stripePriceIdYearly ?? null,
        isActive: data.isActive ?? true,
      },
    });
    return plan;
  } catch (error) {
    console.error("Error creating plan:", error);
    throw new Error("Failed to create plan");
  }
}

/**
 * Update a plan
 */
export async function updatePlan(
  planId: string,
  data: ISubscriptionPlanUpdateData,
): Promise<ISubscriptionPlan> {
  try {
    const plan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        stripePriceIdMonthly: data.stripePriceIdMonthly,
        stripePriceIdYearly: data.stripePriceIdYearly,
        isActive: data.isActive,
      },
    });
    return plan;
  } catch (error) {
    console.error("Error updating plan:", error);
    throw new Error("Failed to update plan");
  }
}

/**
 * Delete a plan
 */
export async function deletePlan(planId: string): Promise<void> {
  try {
    await prisma.subscriptionPlan.delete({
      where: { id: planId },
    });
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw new Error("Failed to delete plan");
  }
}

/**
 * Assign plan to project
 */
export async function assignPlanToProject(
  projectId: string,
  planId: string,
): Promise<void> {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { subscriptionPlanId: planId },
    });
  } catch (error) {
    console.error("Error assigning plan to project:", error);
    throw new Error("Failed to assign plan to project");
  }
}
