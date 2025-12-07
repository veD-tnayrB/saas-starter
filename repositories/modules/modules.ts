import { randomUUID } from "crypto";
import { sql } from "kysely";

import { db } from "@/lib/db";

export interface IModule {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IModuleCreateData {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

export interface IModuleUpdateData {
  slug?: string;
  name?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

/**
 * Find all modules
 */
export async function findAllModules(): Promise<IModule[]> {
  try {
    const result = await sql<IModule>`
      SELECT 
        id,
        slug,
        name,
        description,
        icon,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM modules
      ORDER BY name ASC
    `.execute(db);

    return result.rows;
  } catch (error) {
    console.error("Error finding all modules:", error);
    throw new Error("Failed to find modules");
  }
}

/**
 * Find module by ID
 */
export async function findModuleById(moduleId: string): Promise<IModule | null> {
  try {
    const result = await sql<IModule>`
      SELECT 
        id,
        slug,
        name,
        description,
        icon,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM modules
      WHERE id = ${moduleId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
  } catch (error) {
    console.error("Error finding module by ID:", error);
    throw new Error("Failed to find module");
  }
}

/**
 * Find module by slug
 */
export async function findModuleBySlug(slug: string): Promise<IModule | null> {
  try {
    const result = await sql<IModule>`
      SELECT 
        id,
        slug,
        name,
        description,
        icon,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM modules
      WHERE slug = ${slug}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return row;
  } catch (error) {
    console.error("Error finding module by slug:", error);
    throw new Error("Failed to find module");
  }
}

/**
 * Create a new module
 */
export async function createModule(data: IModuleCreateData): Promise<IModule> {
  try {
    const id = randomUUID();

    const result = await sql<IModule>`
      INSERT INTO modules (id, slug, name, description, icon, is_active, created_at, updated_at)
      VALUES (${id}, ${data.slug}, ${data.name}, ${data.description ?? null}, ${data.icon ?? null}, ${data.isActive ?? true}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        slug,
        name,
        description,
        icon,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Failed to create module");

    return row;
  } catch (error) {
    console.error("Error creating module:", error);
    throw new Error("Failed to create module");
  }
}

/**
 * Update a module
 */
export async function updateModule(
  moduleId: string,
  data: IModuleUpdateData,
): Promise<IModule> {
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
    if (data.icon !== undefined) {
      setParts.push(sql`icon = ${data.icon ?? null}`);
    }
    if (data.isActive !== undefined) {
      setParts.push(sql`is_active = ${data.isActive}`);
    }

    // Combine all SET parts safely
    const setClause = sql.join(setParts, sql`, `);

    const result = await sql<IModule>`
      UPDATE modules
      SET ${setClause}
      WHERE id = ${moduleId}
      RETURNING 
        id,
        slug,
        name,
        description,
        icon,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Module not found");

    return row;
  } catch (error) {
    console.error("Error updating module:", error);
    throw new Error("Failed to update module");
  }
}

/**
 * Delete a module
 */
export async function deleteModule(moduleId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM modules
      WHERE id = ${moduleId}
    `.execute(db);
  } catch (error) {
    console.error("Error deleting module:", error);
    throw new Error("Failed to delete module");
  }
}





