import {
  countAdminMemberships,
  countProjectsByOwner,
} from "@/repositories/projects";
import { sql } from "kysely";

import { db } from "@/lib/db";

/**
 * Check if user has platform admin privileges
 * A user is a platform admin if they are OWNER or ADMIN in any project
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  try {
    // Check if user is OWNER of any project
    const ownedProjects = await countProjectsByOwner(userId);

    if (ownedProjects > 0) {
      return true;
    }

    // Check if user has ADMIN role in any project
    const adminMemberships = await countAdminMemberships(userId);

    return adminMemberships > 0;
  } catch (error) {
    console.error("Error checking platform admin status:", error);
    return false;
  }
}

/**
 * Check if user is OWNER of any project
 * A user is a platform owner if they are OWNER (not just ADMIN) of any project
 */
export async function isPlatformOwner(userId: string): Promise<boolean> {
  try {
    const ownedProjects = await countProjectsByOwner(userId);
    return ownedProjects > 0;
  } catch (error) {
    console.error("Error checking platform owner status:", error);
    return false;
  }
}

/**
 * Check if user is a System Administrator
 * Defined as being a member of any project marked as 'is_core'
 */
export async function isSystemAdmin(userId: string): Promise<boolean> {
  try {
    const result = await sql<{ id: string }>`
      SELECT p.id
      FROM projects p
      INNER JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ${userId}
        AND p.is_core = true
      LIMIT 1
    `.execute(db);

    return !!result.rows[0];
  } catch (error) {
    console.error("Error checking system admin status:", error);
    return false;
  }
}
