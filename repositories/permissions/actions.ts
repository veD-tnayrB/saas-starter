import { randomUUID } from "crypto";
import { sql } from "kysely";

import { db } from "@/lib/db";

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
    const result = await sql<IAction>`
      SELECT 
        id,
        slug,
        name,
        description,
        category,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM actions
      ORDER BY category ASC, name ASC
    `.execute(db);

    return result.rows;
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
    const result = await sql<IAction>`
      SELECT 
        id,
        slug,
        name,
        description,
        category,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM actions
      WHERE id = ${actionId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
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
    const result = await sql<IAction>`
      SELECT 
        id,
        slug,
        name,
        description,
        category,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM actions
      WHERE slug = ${slug}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
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
    const result = await sql<IAction>`
      SELECT 
        id,
        slug,
        name,
        description,
        category,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM actions
      WHERE category = ${category}
      ORDER BY name ASC
    `.execute(db);

    return result.rows;
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
    const id = randomUUID();

    const result = await sql<IAction>`
      INSERT INTO actions (id, slug, name, description, category, created_at, updated_at)
      VALUES (${id}, ${data.slug}, ${data.name}, ${data.description ?? null}, ${data.category}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        slug,
        name,
        description,
        category,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Failed to create action");

    return row;
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
    // Build SET clause parts using sql fragments for proper sanitization
    const setParts = [sql.raw("updated_at = CURRENT_TIMESTAMP")];
    if (data.slug !== undefined) {
      setParts.push(sql`slug = ${data.slug}`);
    }
    if (data.name !== undefined) {
      setParts.push(sql`name = ${data.name}`);
    }
    if (data.description !== undefined) {
      setParts.push(sql`description = ${data.description ?? null}`);
    }
    if (data.category !== undefined) {
      setParts.push(sql`category = ${data.category}`);
    }

    // Combine all SET parts safely
    const setClause = sql.join(setParts, sql`, `);

    const result = await sql<IAction>`
      UPDATE actions
      SET ${setClause}
      WHERE id = ${actionId}
      RETURNING 
        id,
        slug,
        name,
        description,
        category,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Action not found");

    return row;
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
    await sql`
      DELETE FROM actions
      WHERE id = ${actionId}
    `.execute(db);
  } catch (error) {
    console.error("Error deleting action:", error);
    throw new Error("Failed to delete action");
  }
}
