import { prisma } from "@/clients/db";

export interface IAction {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActionCreateData {
  slug: string;
  name: string;
  description?: string;
  category: string;
}

export interface IActionUpdateData {
  slug?: string;
  name?: string;
  description?: string;
  category?: string;
}

/**
 * Find all actions
 */
export async function findAllActions(): Promise<IAction[]> {
  try {
    const actions = await prisma.action.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return actions;
  } catch (error) {
    console.error("Error finding all actions:", error);
    throw new Error("Failed to find actions");
  }
}

/**
 * Find action by ID
 */
export async function findActionById(
  actionId: string,
): Promise<IAction | null> {
  try {
    const action = await prisma.action.findUnique({
      where: { id: actionId },
    });
    return action;
  } catch (error) {
    console.error("Error finding action by ID:", error);
    throw new Error("Failed to find action");
  }
}

/**
 * Find action by slug
 */
export async function findActionBySlug(slug: string): Promise<IAction | null> {
  try {
    const action = await prisma.action.findUnique({
      where: { slug },
    });
    return action;
  } catch (error) {
    console.error("Error finding action by slug:", error);
    throw new Error("Failed to find action");
  }
}

/**
 * Find actions by category
 */
export async function findActionsByCategory(
  category: string,
): Promise<IAction[]> {
  try {
    const actions = await prisma.action.findMany({
      where: { category },
      orderBy: { name: "asc" },
    });
    return actions;
  } catch (error) {
    console.error("Error finding actions by category:", error);
    throw new Error("Failed to find actions");
  }
}

/**
 * Create a new action
 */
export async function createAction(data: IActionCreateData): Promise<IAction> {
  try {
    const action = await prisma.action.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description ?? null,
        category: data.category,
      },
    });
    return action;
  } catch (error) {
    console.error("Error creating action:", error);
    throw new Error("Failed to create action");
  }
}

/**
 * Update an action
 */
export async function updateAction(
  actionId: string,
  data: IActionUpdateData,
): Promise<IAction> {
  try {
    const action = await prisma.action.update({
      where: { id: actionId },
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        category: data.category,
      },
    });
    return action;
  } catch (error) {
    console.error("Error updating action:", error);
    throw new Error("Failed to update action");
  }
}

/**
 * Delete an action
 */
export async function deleteAction(actionId: string): Promise<void> {
  try {
    await prisma.action.delete({
      where: { id: actionId },
    });
  } catch (error) {
    console.error("Error deleting action:", error);
    throw new Error("Failed to delete action");
  }
}

