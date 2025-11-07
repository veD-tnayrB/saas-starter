import { randomUUID } from "crypto";
import { sql } from "kysely";

import { db } from "@/lib/db";

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
    const result = await sql<{
      id: string;
      name: string;
      priority: number;
      description: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT *
      FROM app_roles
      ORDER BY priority ASC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      priority: row.priority,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
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
    const result = await sql<{
      id: string;
      name: string;
      priority: number;
      description: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT *
      FROM app_roles
      WHERE id = ${roleId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      priority: row.priority,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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
    const result = await sql<{
      id: string;
      name: string;
      priority: number;
      description: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT *
      FROM app_roles
      WHERE name = ${name}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      priority: row.priority,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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
    const id = randomUUID();

    const result = await sql<{
      id: string;
      name: string;
      priority: number;
      description: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO app_roles (id, name, priority, description, created_at, updated_at)
      VALUES (${id}, ${data.name}, ${data.priority}, ${data.description ?? null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Failed to create role");

    return {
      id: row.id,
      name: row.name,
      priority: row.priority,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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
    const setParts: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    if (data.name !== undefined) {
      setParts.push(`name = ${sql.lit(data.name)}`);
    }
    if (data.priority !== undefined) {
      setParts.push(`priority = ${sql.lit(data.priority)}`);
    }
    if (data.description !== undefined) {
      setParts.push(`description = ${sql.lit(data.description ?? null)}`);
    }

    const result = await sql<{
      id: string;
      name: string;
      priority: number;
      description: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      UPDATE app_roles
      SET ${sql.raw(setParts.join(", "))}
      WHERE id = ${roleId}
      RETURNING *
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Role not found");

    return {
      id: row.id,
      name: row.name,
      priority: row.priority,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
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
    await sql`
      DELETE FROM app_roles
      WHERE id = ${roleId}
    `.execute(db);
  } catch (error) {
    console.error("Error deleting role:", error);
    throw new Error("Failed to delete role");
  }
}
