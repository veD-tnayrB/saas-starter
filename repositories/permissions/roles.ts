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
    const result = await sql<IAppRole>`
      SELECT 
        id,
        name,
        priority,
        description,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM app_roles
      ORDER BY priority ASC
    `.execute(db);

    return result.rows;
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
    const result = await sql<IAppRole>`
      SELECT 
        id,
        name,
        priority,
        description,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM app_roles
      WHERE id = ${roleId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
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
    const result = await sql<IAppRole>`
      SELECT 
        id,
        name,
        priority,
        description,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM app_roles
      WHERE name = ${name}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
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

    const result = await sql<IAppRole>`
      INSERT INTO app_roles (id, name, priority, description, created_at, updated_at)
      VALUES (${id}, ${data.name}, ${data.priority}, ${data.description ?? null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        name,
        priority,
        description,
        created_at AS createdAt,
        updated_at AS updatedAt
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Failed to create role");

    return row;
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
    // Build SET clause parts using sql fragments for proper sanitization
    const setParts = [sql.raw("updated_at = CURRENT_TIMESTAMP")];
    if (data.name !== undefined) {
      setParts.push(sql`name = ${data.name}`);
    }
    if (data.priority !== undefined) {
      setParts.push(sql`priority = ${data.priority}`);
    }
    if (data.description !== undefined) {
      setParts.push(sql`description = ${data.description ?? null}`);
    }

    // Combine all SET parts safely
    const setClause = sql.join(setParts, sql`, `);

    const result = await sql<IAppRole>`
      UPDATE app_roles
      SET ${setClause}
      WHERE id = ${roleId}
      RETURNING 
        id,
        name,
        priority,
        description,
        created_at AS createdAt,
        updated_at AS updatedAt
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Role not found");

    return row;
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
