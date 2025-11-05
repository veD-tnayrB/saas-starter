import { prisma } from "@/clients/db";

export interface IAppRole {
  id: string;
  name: string;
  priority: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppRoleCreateData {
  name: string;
  priority: number;
  description?: string;
}

export interface IAppRoleUpdateData {
  name?: string;
  priority?: number;
  description?: string;
}

/**
 * Find all roles ordered by priority
 */
export async function findAllRoles(): Promise<IAppRole[]> {
  try {
    const roles = await prisma.appRole.findMany({
      orderBy: { priority: "asc" },
    });
    return roles;
  } catch (error) {
    console.error("Error finding all roles:", error);
    throw new Error("Failed to find roles");
  }
}

/**
 * Find role by ID
 */
export async function findRoleById(roleId: string): Promise<IAppRole | null> {
  try {
    const role = await prisma.appRole.findUnique({
      where: { id: roleId },
    });
    return role;
  } catch (error) {
    console.error("Error finding role by ID:", error);
    throw new Error("Failed to find role");
  }
}

/**
 * Find role by name
 */
export async function findRoleByName(name: string): Promise<IAppRole | null> {
  try {
    const role = await prisma.appRole.findUnique({
      where: { name },
    });
    return role;
  } catch (error) {
    console.error("Error finding role by name:", error);
    throw new Error("Failed to find role");
  }
}

/**
 * Create a new role
 */
export async function createRole(data: IAppRoleCreateData): Promise<IAppRole> {
  try {
    const role = await prisma.appRole.create({
      data: {
        name: data.name,
        priority: data.priority,
        description: data.description ?? null,
      },
    });
    return role;
  } catch (error) {
    console.error("Error creating role:", error);
    throw new Error("Failed to create role");
  }
}

/**
 * Update a role
 */
export async function updateRole(
  roleId: string,
  data: IAppRoleUpdateData,
): Promise<IAppRole> {
  try {
    const role = await prisma.appRole.update({
      where: { id: roleId },
      data: {
        name: data.name,
        priority: data.priority,
        description: data.description,
      },
    });
    return role;
  } catch (error) {
    console.error("Error updating role:", error);
    throw new Error("Failed to update role");
  }
}

/**
 * Delete a role
 */
export async function deleteRole(roleId: string): Promise<void> {
  try {
    await prisma.appRole.delete({
      where: { id: roleId },
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    throw new Error("Failed to delete role");
  }
}

