import { randomUUID } from "crypto";
import { sql } from "kysely";

import { db } from "@/lib/db";

/**
 * Project member data transfer object
 * Supports multiple roles per member
 */
export interface IProjectMember {
  id: string;
  projectId: string;
  userId: string;
  roleId?: string; // Deprecated: kept for backward compatibility
  roles: Array<{
    id: string;
    name: string;
    priority: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project member creation data
 */
export interface IProjectMemberCreateData {
  projectId: string;
  userId: string;
  roleId: string;
}

/**
 * Project member update data
 */
export interface IProjectMemberUpdateData {
  roleId?: string;
}

/**
 * Find project member roles by project member ID
 */
export async function findProjectMemberRoles(
  projectMemberId: string,
): Promise<Array<{ id: string; name: string; priority: number }>> {
  try {
    const result = await sql<{
      roleId: string;
      roleName: string;
      rolePriority: number;
    }>`
      SELECT 
        ar.id AS "roleId",
        ar.name AS "roleName",
        ar.priority AS "rolePriority"
      FROM project_member_roles pmr
      INNER JOIN app_roles ar ON ar.id = pmr.role_id
      WHERE pmr.project_member_id = ${projectMemberId}
      ORDER BY ar.priority ASC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.roleId,
      name: row.roleName,
      priority: row.rolePriority,
    }));
  } catch (error) {
    console.error("Error finding project member roles:", error);
    throw new Error("Failed to find project member roles");
  }
}

/**
 * Find project member by project and user ID
 * Returns member with all their roles
 */
export async function findProjectMember(
  projectId: string,
  userId: string,
): Promise<IProjectMember | null> {
  try {
    // First find the project member
    const memberResult = await sql<{
      id: string;
      projectId: string;
      userId: string;
      roleId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>`
      SELECT 
        pm.id,
        pm.project_id AS "projectId",
        pm.user_id AS "userId",
        pm.role_id AS "roleId",
        pm.created_at AS "createdAt",
        pm.updated_at AS "updatedAt"
      FROM project_members pm
      WHERE pm.project_id = ${projectId}
        AND pm.user_id = ${userId}
      LIMIT 1
    `.execute(db);

    const memberRow = memberResult.rows[0];
    if (!memberRow) return null;

    // Get all roles for this member
    const roles = await findProjectMemberRoles(memberRow.id);

    return {
      id: memberRow.id,
      projectId: memberRow.projectId,
      userId: memberRow.userId,
      roleId: memberRow.roleId ?? undefined,
      roles,
      createdAt: memberRow.createdAt,
      updatedAt: memberRow.updatedAt,
    };
  } catch (error) {
    console.error("Error finding project member:", error);
    throw new Error("Failed to find project member");
  }
}

/**
 * Find all members of a project with user information
 * Returns members with all their roles
 */
export async function findProjectMembers(projectId: string): Promise<
  (IProjectMember & {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    } | null;
  })[]
> {
  try {
    // First get all members with user info
    const membersResult = await sql<{
      id: string;
      projectId: string;
      userId: string;
      roleId: string | null;
      createdAt: Date;
      updatedAt: Date;
      userId2: string;
      userName: string | null;
      userEmail: string | null;
      userImage: string | null;
    }>`
      SELECT 
        pm.id,
        pm.project_id AS "projectId",
        pm.user_id AS "userId",
        pm.role_id AS "roleId",
        pm.created_at AS "createdAt",
        pm.updated_at AS "updatedAt",
        u.id AS "userId2",
        u.name AS "userName",
        u.email AS "userEmail",
        u.image AS "userImage"
      FROM project_members pm
      INNER JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = ${projectId}
      ORDER BY pm.created_at ASC
    `.execute(db);

    // For each member, get their roles
    const members = await Promise.all(
      membersResult.rows.map(async (row) => {
        const roles = await findProjectMemberRoles(row.id);
        return {
          id: row.id,
          projectId: row.projectId,
          userId: row.userId,
          roleId: row.roleId ?? undefined,
          roles,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          user: {
            id: row.userId2,
            name: row.userName,
            email: row.userEmail,
            image: row.userImage,
          },
        };
      }),
    );

    return members;
  } catch (error) {
    console.error("Error finding project members:", error);
    throw new Error("Failed to find project members");
  }
}

/**
 * Find all projects where user is a member
 * Returns memberships with all their roles
 */
export async function findUserProjectMemberships(
  userId: string,
): Promise<IProjectMember[]> {
  try {
    const membersResult = await sql<{
      id: string;
      projectId: string;
      userId: string;
      roleId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>`
      SELECT 
        pm.id,
        pm.project_id AS "projectId",
        pm.user_id AS "userId",
        pm.role_id AS "roleId",
        pm.created_at AS "createdAt",
        pm.updated_at AS "updatedAt"
      FROM project_members pm
      WHERE pm.user_id = ${userId}
      ORDER BY pm.created_at DESC
    `.execute(db);

    // For each membership, get their roles
    const memberships = await Promise.all(
      membersResult.rows.map(async (row) => {
        const roles = await findProjectMemberRoles(row.id);
        return {
          id: row.id,
          projectId: row.projectId,
          userId: row.userId,
          roleId: row.roleId ?? undefined,
          roles,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }),
    );

    return memberships;
  } catch (error) {
    console.error("Error finding user project memberships:", error);
    throw new Error("Failed to find user memberships");
  }
}

/**
 * Get user role names in project
 * Returns array of role names (e.g., ["OWNER", "ADMIN"]) or empty array
 */
export async function getUserProjectRoles(
  projectId: string,
  userId: string,
): Promise<string[]> {
  try {
    const member = await findProjectMember(projectId, userId);
    return member?.roles.map((r) => r.name) ?? [];
  } catch (error) {
    console.error("Error getting user project roles:", error);
    throw new Error("Failed to get user project roles");
  }
}

/**
 * Get user role name in project (backward compatibility)
 * Returns the first role name or null
 * @deprecated Use getUserProjectRoles instead
 */
export async function getUserProjectRole(
  projectId: string,
  userId: string,
): Promise<string | null> {
  try {
    const roles = await getUserProjectRoles(projectId, userId);
    return roles[0] ?? null;
  } catch (error) {
    console.error("Error getting user project role:", error);
    throw new Error("Failed to get user project role");
  }
}

/**
 * Create project member
 * Also creates the initial role in project_member_roles
 */
export async function createProjectMember(
  data: IProjectMemberCreateData,
): Promise<IProjectMember> {
  try {
    const id = randomUUID();

    // Create project member (role_id is nullable now, but we keep it for backward compatibility)
    const memberResult = await sql<{
      id: string;
      projectId: string;
      userId: string;
      roleId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>`
      INSERT INTO project_members (id, project_id, user_id, role_id, created_at, updated_at)
      VALUES (${id}, ${data.projectId}, ${data.userId}, ${data.roleId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id,
        project_id AS "projectId",
        user_id AS "userId",
        role_id AS "roleId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `.execute(db);

    const member = memberResult.rows[0];
    if (!member) throw new Error("Failed to create project member");

    // Create the role in project_member_roles
    if (data.roleId) {
      const roleMemberId = randomUUID();
      await sql`
        INSERT INTO project_member_roles (id, project_member_id, role_id, created_at)
        VALUES (${roleMemberId}, ${member.id}, ${data.roleId}, CURRENT_TIMESTAMP)
      `.execute(db);
    }

    // Get all roles for this member
    const roles = await findProjectMemberRoles(member.id);

    return {
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      roleId: member.roleId ?? undefined,
      roles,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  } catch (error) {
    console.error("Error creating project member:", error);
    throw new Error("Failed to create project member");
  }
}

/**
 * Add role to project member
 */
export async function addRoleToMember(
  projectMemberId: string,
  roleId: string,
): Promise<void> {
  try {
    const id = randomUUID();
    await sql`
      INSERT INTO project_member_roles (id, project_member_id, role_id, created_at)
      VALUES (${id}, ${projectMemberId}, ${roleId}, CURRENT_TIMESTAMP)
      ON CONFLICT (project_member_id, role_id) DO NOTHING
    `.execute(db);
  } catch (error) {
    console.error("Error adding role to member:", error);
    throw new Error("Failed to add role to member");
  }
}

/**
 * Remove role from project member
 */
export async function removeRoleFromMember(
  projectMemberId: string,
  roleId: string,
): Promise<void> {
  try {
    await sql`
      DELETE FROM project_member_roles
      WHERE project_member_id = ${projectMemberId}
        AND role_id = ${roleId}
    `.execute(db);
  } catch (error) {
    console.error("Error removing role from member:", error);
    throw new Error("Failed to remove role from member");
  }
}

/**
 * Set all roles for a project member (replaces existing roles)
 */
export async function setMemberRoles(
  projectMemberId: string,
  roleIds: string[],
): Promise<void> {
  try {
    // Delete all existing roles
    await sql`
      DELETE FROM project_member_roles
      WHERE project_member_id = ${projectMemberId}
    `.execute(db);

    // Insert new roles
    if (roleIds.length > 0) {
      for (const roleId of roleIds) {
        const id = randomUUID();
        await sql`
          INSERT INTO project_member_roles (id, project_member_id, role_id, created_at)
          VALUES (${id}, ${projectMemberId}, ${roleId}, CURRENT_TIMESTAMP)
        `.execute(db);
      }
    }
  } catch (error) {
    console.error("Error setting member roles:", error);
    throw new Error("Failed to set member roles");
  }
}

/**
 * Update project member (backward compatibility)
 * @deprecated Use addRoleToMember, removeRoleFromMember, or setMemberRoles instead
 */
export async function updateProjectMember(
  projectId: string,
  userId: string,
  data: IProjectMemberUpdateData,
): Promise<IProjectMember> {
  try {
    const existing = await findProjectMember(projectId, userId);
    if (!existing) throw new Error("Project member not found");

    if (data.roleId) {
      // If roleId is provided, set it as the only role (for backward compatibility)
      await setMemberRoles(existing.id, [data.roleId]);
      
      // Also update the legacy role_id field
      await sql`
        UPDATE project_members
        SET 
          role_id = ${data.roleId},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing.id}
      `.execute(db);
    }

    // Return updated member
    const updated = await findProjectMember(projectId, userId);
    if (!updated) throw new Error("Failed to update project member");
    return updated;
  } catch (error) {
    console.error("Error updating project member:", error);
    throw new Error("Failed to update project member");
  }
}

/**
 * Remove project member
 */
export async function removeProjectMember(
  projectId: string,
  userId: string,
): Promise<void> {
  try {
    await sql`
      DELETE FROM project_members
      WHERE project_id = ${projectId}
        AND user_id = ${userId}
    `.execute(db);
  } catch (error) {
    console.error("Error removing project member:", error);
    throw new Error("Failed to remove project member");
  }
}

/**
 * Count admin memberships for a user (OWNER or ADMIN roles)
 * Checks roles with priority <= 1 (OWNER=0, ADMIN=1)
 * Uses project_member_roles for accurate counting
 */
export async function countAdminMemberships(userId: string): Promise<number> {
  try {
    const result = await sql<{ count: string }>`
      SELECT COUNT(DISTINCT pm.id)::text as count
      FROM project_members pm
      INNER JOIN project_member_roles pmr ON pmr.project_member_id = pm.id
      INNER JOIN app_roles ar ON ar.id = pmr.role_id
      WHERE pm.user_id = ${userId}
        AND ar.priority <= 1
    `.execute(db);

    return parseInt(result.rows[0]?.count || "0", 10);
  } catch (error) {
    console.error("Error counting admin memberships:", error);
    throw new Error("Failed to count admin memberships");
  }
}
