import { randomUUID } from "crypto";
import { sql } from "kysely";

import { db } from "@/lib/db";

/**
 * Project member data transfer object
 */
export interface IProjectMember {
  id: string;
  projectId: string;
  userId: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    priority: number;
  };
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
 * Find project member by project and user ID
 */
export async function findProjectMember(
  projectId: string,
  userId: string,
): Promise<IProjectMember | null> {
  try {
    const result = await sql<{
      id: string;
      projectId: string;
      userId: string;
      roleId: string;
      createdAt: Date;
      updatedAt: Date;
      roleId2: string;
      roleName: string;
      rolePriority: number;
    }>`
      SELECT 
        pm.id,
        pm.project_id AS "projectId",
        pm.user_id AS "userId",
        pm.role_id AS "roleId",
        pm.created_at AS "createdAt",
        pm.updated_at AS "updatedAt",
        ar.id AS "roleId2",
        ar.name AS "roleName",
        ar.priority AS "rolePriority"
      FROM project_members pm
      INNER JOIN app_roles ar ON ar.id = pm.role_id
      WHERE pm.project_id = ${projectId}
        AND pm.user_id = ${userId}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      projectId: row.projectId,
      userId: row.userId,
      roleId: row.roleId,
      role: {
        id: row.roleId2,
        name: row.roleName,
        priority: row.rolePriority,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  } catch (error) {
    console.error("Error finding project member:", error);
    throw new Error("Failed to find project member");
  }
}

/**
 * Find all members of a project with user information
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
    const result = await sql<{
      id: string;
      projectId: string;
      userId: string;
      roleId: string;
      createdAt: Date;
      updatedAt: Date;
      roleId2: string;
      roleName: string;
      rolePriority: number;
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
        ar.id AS "roleId2",
        ar.name AS "roleName",
        ar.priority AS "rolePriority",
        u.id AS "userId2",
        u.name AS "userName",
        u.email AS "userEmail",
        u.image AS "userImage"
      FROM project_members pm
      INNER JOIN app_roles ar ON ar.id = pm.role_id
      INNER JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = ${projectId}
      ORDER BY ar.priority ASC, pm.created_at ASC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      userId: row.userId,
      roleId: row.roleId,
      role: {
        id: row.roleId2,
        name: row.roleName,
        priority: row.rolePriority,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: {
        id: row.userId2,
        name: row.userName,
        email: row.userEmail,
        image: row.userImage,
      },
    }));
  } catch (error) {
    console.error("Error finding project members:", error);
    throw new Error("Failed to find project members");
  }
}

/**
 * Find all projects where user is a member
 */
export async function findUserProjectMemberships(
  userId: string,
): Promise<IProjectMember[]> {
  try {
    const result = await sql<{
      id: string;
      projectId: string;
      userId: string;
      roleId: string;
      createdAt: Date;
      updatedAt: Date;
      roleId2: string;
      roleName: string;
      rolePriority: number;
    }>`
      SELECT 
        pm.id,
        pm.project_id AS "projectId",
        pm.user_id AS "userId",
        pm.role_id AS "roleId",
        pm.created_at AS "createdAt",
        pm.updated_at AS "updatedAt",
        ar.id AS "roleId2",
        ar.name AS "roleName",
        ar.priority AS "rolePriority"
      FROM project_members pm
      INNER JOIN app_roles ar ON ar.id = pm.role_id
      WHERE pm.user_id = ${userId}
      ORDER BY pm.created_at DESC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      userId: row.userId,
      roleId: row.roleId,
      role: {
        id: row.roleId2,
        name: row.roleName,
        priority: row.rolePriority,
      },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  } catch (error) {
    console.error("Error finding user project memberships:", error);
    throw new Error("Failed to find user memberships");
  }
}

/**
 * Get user role name in project
 * Returns the role name (OWNER, ADMIN, MEMBER) or null
 */
export async function getUserProjectRole(
  projectId: string,
  userId: string,
): Promise<string | null> {
  try {
    const member = await findProjectMember(projectId, userId);
    return member?.role.name ?? null;
  } catch (error) {
    console.error("Error getting user project role:", error);
    throw new Error("Failed to get user project role");
  }
}

/**
 * Create project member
 */
export async function createProjectMember(
  data: IProjectMemberCreateData,
): Promise<IProjectMember> {
  try {
    const id = randomUUID();

    const memberResult = await sql<{
      id: string;
      projectId: string;
      userId: string;
      roleId: string;
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

    // Fetch role data
    const roleResult = await sql<{
      id: string;
      name: string;
      priority: number;
    }>`
      SELECT id, name, priority
      FROM app_roles
      WHERE id = ${data.roleId}
      LIMIT 1
    `.execute(db);

    const role = roleResult.rows[0];
    if (!role) throw new Error("Role not found");

    return {
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      roleId: member.roleId,
      role: {
        id: role.id,
        name: role.name,
        priority: role.priority,
      },
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  } catch (error) {
    console.error("Error creating project member:", error);
    throw new Error("Failed to create project member");
  }
}

/**
 * Update project member role
 */
export async function updateProjectMember(
  projectId: string,
  userId: string,
  data: IProjectMemberUpdateData,
): Promise<IProjectMember> {
  try {
    if (!data.roleId) {
      // No update needed, fetch existing
      const existing = await findProjectMember(projectId, userId);
      if (!existing) throw new Error("Project member not found");
      return existing;
    }

    const memberResult = await sql<{
      id: string;
      projectId: string;
      userId: string;
      roleId: string;
      createdAt: Date;
      updatedAt: Date;
    }>`
      UPDATE project_members
      SET 
        role_id = ${data.roleId},
        updated_at = CURRENT_TIMESTAMP
      WHERE project_id = ${projectId}
        AND user_id = ${userId}
      RETURNING 
        id,
        project_id AS "projectId",
        user_id AS "userId",
        role_id AS "roleId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `.execute(db);

    const member = memberResult.rows[0];
    if (!member) throw new Error("Project member not found");

    // Fetch role data
    const roleResult = await sql<{
      id: string;
      name: string;
      priority: number;
    }>`
      SELECT id, name, priority
      FROM app_roles
      WHERE id = ${data.roleId}
      LIMIT 1
    `.execute(db);

    const role = roleResult.rows[0];
    if (!role) throw new Error("Role not found");

    return {
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      roleId: member.roleId,
      role: {
        id: role.id,
        name: role.name,
        priority: role.priority,
      },
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
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
 */
export async function countAdminMemberships(userId: string): Promise<number> {
  try {
    const result = await sql<{ count: string }>`
      SELECT COUNT(*)::text as count
      FROM project_members pm
      INNER JOIN app_roles ar ON ar.id = pm.role_id
      WHERE pm.user_id = ${userId}
        AND ar.priority <= 1
    `.execute(db);

    return parseInt(result.rows[0]?.count || "0", 10);
  } catch (error) {
    console.error("Error counting admin memberships:", error);
    throw new Error("Failed to count admin memberships");
  }
}
