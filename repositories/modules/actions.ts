import { randomUUID } from "crypto";
import { sql } from "kysely";

import { db } from "@/lib/db";
import type { IAction } from "@/repositories/permissions/actions";

export interface IModuleAction {
  id: string;
  moduleId: string;
  actionId: string;
  action: IAction;
  createdAt: Date;
}

/**
 * Find all actions for a module
 */
export async function findActionsByModuleId(
  moduleId: string,
): Promise<IModuleAction[]> {
  try {
    const result = await sql<{
      id: string;
      moduleId: string;
      actionId: string;
      createdAt: Date;
      actionId2: string;
      actionSlug: string;
      actionName: string;
      actionDescription: string | null;
      actionCategory: string;
      actionCreatedAt: Date;
      actionUpdatedAt: Date;
    }>`
      SELECT 
        ma.id,
        ma.module_id AS "moduleId",
        ma.action_id AS "actionId",
        ma.created_at AS "createdAt",
        a.id AS "actionId2",
        a.slug AS "actionSlug",
        a.name AS "actionName",
        a.description AS "actionDescription",
        a.category AS "actionCategory",
        a.created_at AS "actionCreatedAt",
        a.updated_at AS "actionUpdatedAt"
      FROM module_actions ma
      INNER JOIN actions a ON a.id = ma.action_id
      WHERE ma.module_id = ${moduleId}
      ORDER BY a.category ASC, a.name ASC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      moduleId: row.moduleId,
      actionId: row.actionId,
      createdAt: row.createdAt,
      action: {
        id: row.actionId2,
        slug: row.actionSlug,
        name: row.actionName,
        description: row.actionDescription,
        category: row.actionCategory,
        createdAt: row.actionCreatedAt,
        updatedAt: row.actionUpdatedAt,
      },
    }));
  } catch (error) {
    console.error("Error finding actions by module ID:", error);
    throw new Error("Failed to find module actions");
  }
}

/**
 * Add an action to a module
 */
export async function addActionToModule(
  moduleId: string,
  actionId: string,
): Promise<IModuleAction> {
  try {
    const id = randomUUID();

    const result = await sql<{
      id: string;
      moduleId: string;
      actionId: string;
      createdAt: Date;
      actionId2: string;
      actionSlug: string;
      actionName: string;
      actionDescription: string | null;
      actionCategory: string;
      actionCreatedAt: Date;
      actionUpdatedAt: Date;
    }>`
      INSERT INTO module_actions (id, module_id, action_id, created_at)
      VALUES (${id}, ${moduleId}, ${actionId}, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        module_id AS "moduleId",
        action_id AS "actionId",
        created_at AS "createdAt"
    `.execute(db);

    const row = result.rows[0];
    if (!row) throw new Error("Failed to add action to module");

    // Fetch the action details
    const actionResult = await sql<IAction>`
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

    const action = actionResult.rows[0];
    if (!action) throw new Error("Action not found");

    return {
      id: row.id,
      moduleId: row.moduleId,
      actionId: row.actionId,
      createdAt: row.createdAt,
      action,
    };
  } catch (error) {
    console.error("Error adding action to module:", error);
    throw new Error("Failed to add action to module");
  }
}

/**
 * Remove an action from a module
 */
export async function removeActionFromModule(
  moduleId: string,
  actionId: string,
): Promise<void> {
  try {
    await sql`
      DELETE FROM module_actions
      WHERE module_id = ${moduleId} AND action_id = ${actionId}
    `.execute(db);
  } catch (error) {
    console.error("Error removing action from module:", error);
    throw new Error("Failed to remove action from module");
  }
}

/**
 * Set all actions for a module (replaces existing actions)
 */
export async function setModuleActions(
  moduleId: string,
  actionIds: string[],
): Promise<IModuleAction[]> {
  try {
    const result = await db.transaction().execute(async (trx) => {
      // Delete all existing actions for this module
      await sql`
        DELETE FROM module_actions
        WHERE module_id = ${moduleId}
      `.execute(trx);

      // Insert new actions
      if (actionIds.length === 0) {
        return [];
      }

      const moduleActions: IModuleAction[] = [];

      for (const actionId of actionIds) {
        const id = randomUUID();

        const insertResult = await sql<{
          id: string;
          moduleId: string;
          actionId: string;
          createdAt: Date;
        }>`
          INSERT INTO module_actions (id, module_id, action_id, created_at)
          VALUES (${id}, ${moduleId}, ${actionId}, CURRENT_TIMESTAMP)
          RETURNING 
            id,
            module_id AS "moduleId",
            action_id AS "actionId",
            created_at AS "createdAt"
        `.execute(trx);

        const row = insertResult.rows[0];
        if (!row) continue;

        // Fetch the action details
        const actionResult = await sql<IAction>`
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
        `.execute(trx);

        const action = actionResult.rows[0];
        if (!action) continue;

        moduleActions.push({
          id: row.id,
          moduleId: row.moduleId,
          actionId: row.actionId,
          createdAt: row.createdAt,
          action,
        });
      }

      return moduleActions;
    });

    return result;
  } catch (error) {
    console.error("Error setting module actions:", error);
    throw new Error("Failed to set module actions");
  }
}





