import { randomUUID } from "crypto";
import { sql } from "kysely";

import { db } from "@/lib/db";

/**
 * Project invitation data transfer object
 */
export interface IProjectInvitation {
  id: string;
  projectId: string;
  email: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    priority: number;
  };
  invitedById: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Project invitation creation data
 */
export interface IProjectInvitationCreateData {
  projectId: string;
  email: string;
  roleId: string;
  invitedById: string;
  token: string;
  expiresAt: Date;
}

/**
 * Find invitation by token
 */
export async function findInvitationByToken(
  token: string,
): Promise<IProjectInvitation | null> {
  try {
    const result = await sql<{
      id: string;
      projectId: string;
      email: string;
      roleId: string;
      invitedById: string;
      token: string;
      createdAt: Date;
      expiresAt: Date;
      roleId2: string;
      roleName: string;
      rolePriority: number;
    }>`
      SELECT 
        pi.id,
        pi.project_id AS projectId,
        pi.email,
        pi.role_id AS roleId,
        pi.invited_by_id AS invitedById,
        pi.token,
        pi.created_at AS createdAt,
        pi.expires_at AS expiresAt,
        ar.id AS roleId2,
        ar.name AS roleName,
        ar.priority AS rolePriority
      FROM project_invitations pi
      INNER JOIN app_roles ar ON ar.id = pi.role_id
      WHERE pi.token = ${token}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      projectId: row.projectId,
      email: row.email,
      roleId: row.roleId,
      role: {
        id: row.roleId2,
        name: row.roleName,
        priority: row.rolePriority,
      },
      invitedById: row.invitedById,
      token: row.token,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
    };
  } catch (error) {
    console.error("Error finding invitation by token:", error);
    throw new Error("Failed to find invitation");
  }
}

/**
 * Find invitation by email and project
 */
export async function findInvitationByEmailAndProject(
  email: string,
  projectId: string,
): Promise<IProjectInvitation | null> {
  try {
    const now = new Date();

    const result = await sql<{
      id: string;
      projectId: string;
      email: string;
      roleId: string;
      invitedById: string;
      token: string;
      createdAt: Date;
      expiresAt: Date;
      roleId2: string;
      roleName: string;
      rolePriority: number;
    }>`
      SELECT 
        pi.id,
        pi.project_id AS projectId,
        pi.email,
        pi.role_id AS roleId,
        pi.invited_by_id AS invitedById,
        pi.token,
        pi.created_at AS createdAt,
        pi.expires_at AS expiresAt,
        ar.id AS roleId2,
        ar.name AS roleName,
        ar.priority AS rolePriority
      FROM project_invitations pi
      INNER JOIN app_roles ar ON ar.id = pi.role_id
      WHERE pi.email = ${email}
        AND pi.project_id = ${projectId}
        AND pi.expires_at > ${now}
      ORDER BY pi.created_at DESC
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      projectId: row.projectId,
      email: row.email,
      roleId: row.roleId,
      role: {
        id: row.roleId2,
        name: row.roleName,
        priority: row.rolePriority,
      },
      invitedById: row.invitedById,
      token: row.token,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
    };
  } catch (error) {
    console.error("Error finding invitation by email and project:", error);
    throw new Error("Failed to find invitation");
  }
}

/**
 * Find all invitations for a project
 */
export async function findProjectInvitations(
  projectId: string,
): Promise<IProjectInvitation[]> {
  try {
    const now = new Date();

    const result = await sql<{
      id: string;
      projectId: string;
      email: string;
      roleId: string;
      invitedById: string;
      token: string;
      createdAt: Date;
      expiresAt: Date;
      roleId2: string;
      roleName: string;
      rolePriority: number;
    }>`
      SELECT 
        pi.id,
        pi.project_id AS projectId,
        pi.email,
        pi.role_id AS roleId,
        pi.invited_by_id AS invitedById,
        pi.token,
        pi.created_at AS createdAt,
        pi.expires_at AS expiresAt,
        ar.id AS roleId2,
        ar.name AS roleName,
        ar.priority AS rolePriority
      FROM project_invitations pi
      INNER JOIN app_roles ar ON ar.id = pi.role_id
      WHERE pi.project_id = ${projectId}
        AND pi.expires_at > ${now}
      ORDER BY pi.created_at DESC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      email: row.email,
      roleId: row.roleId,
      role: {
        id: row.roleId2,
        name: row.roleName,
        priority: row.rolePriority,
      },
      invitedById: row.invitedById,
      token: row.token,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
    }));
  } catch (error) {
    console.error("Error finding project invitations:", error);
    throw new Error("Failed to find project invitations");
  }
}

/**
 * Find all pending invitations for a user by email
 */
export async function findPendingInvitationsByEmail(
  email: string,
): Promise<IProjectInvitation[]> {
  try {
    const now = new Date();

    const result = await sql<{
      id: string;
      projectId: string;
      email: string;
      roleId: string;
      invitedById: string;
      token: string;
      createdAt: Date;
      expiresAt: Date;
      roleId2: string;
      roleName: string;
      rolePriority: number;
    }>`
      SELECT 
        pi.id,
        pi.project_id AS projectId,
        pi.email,
        pi.role_id AS roleId,
        pi.invited_by_id AS invitedById,
        pi.token,
        pi.created_at AS createdAt,
        pi.expires_at AS expiresAt,
        ar.id AS roleId2,
        ar.name AS roleName,
        ar.priority AS rolePriority
      FROM project_invitations pi
      INNER JOIN app_roles ar ON ar.id = pi.role_id
      WHERE pi.email = ${email}
        AND pi.expires_at > ${now}
      ORDER BY pi.created_at DESC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      email: row.email,
      roleId: row.roleId,
      role: {
        id: row.roleId2,
        name: row.roleName,
        priority: row.rolePriority,
      },
      invitedById: row.invitedById,
      token: row.token,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
    }));
  } catch (error) {
    console.error("Error finding pending invitations by email:", error);
    throw new Error("Failed to find pending invitations");
  }
}

/**
 * Create project invitation
 */
export async function createProjectInvitation(
  data: IProjectInvitationCreateData,
): Promise<IProjectInvitation> {
  try {
    const id = randomUUID();

    const invitationResult = await sql<{
      id: string;
      projectId: string;
      email: string;
      roleId: string;
      invitedById: string;
      token: string;
      createdAt: Date;
      expiresAt: Date;
    }>`
      INSERT INTO project_invitations (
        id,
        project_id,
        email,
        role_id,
        invited_by_id,
        token,
        created_at,
        expires_at
      )
      VALUES (
        ${id},
        ${data.projectId},
        ${data.email},
        ${data.roleId},
        ${data.invitedById},
        ${data.token},
        CURRENT_TIMESTAMP,
        ${data.expiresAt}
      )
      RETURNING 
        id,
        project_id AS projectId,
        email,
        role_id AS roleId,
        invited_by_id AS invitedById,
        token,
        created_at AS createdAt,
        expires_at AS expiresAt
    `.execute(db);

    const invitation = invitationResult.rows[0];
    if (!invitation) throw new Error("Failed to create project invitation");

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
      id: invitation.id,
      projectId: invitation.projectId,
      email: invitation.email,
      roleId: invitation.roleId,
      role: {
        id: role.id,
        name: role.name,
        priority: role.priority,
      },
      invitedById: invitation.invitedById,
      token: invitation.token,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    };
  } catch (error) {
    console.error("Error creating project invitation:", error);
    throw new Error("Failed to create project invitation");
  }
}

/**
 * Delete invitation
 */
export async function deleteInvitation(id: string): Promise<void> {
  try {
    await sql`
      DELETE FROM project_invitations
      WHERE id = ${id}
    `.execute(db);
  } catch (error) {
    console.error("Error deleting invitation:", error);
    throw new Error("Failed to delete invitation");
  }
}

/**
 * Delete invitation by token
 */
export async function deleteInvitationByToken(token: string): Promise<void> {
  try {
    await sql`
      DELETE FROM project_invitations
      WHERE token = ${token}
    `.execute(db);
  } catch (error) {
    console.error("Error deleting invitation by token:", error);
    throw new Error("Failed to delete invitation");
  }
}

/**
 * Clean up expired invitations
 */
export async function cleanupExpiredInvitations(): Promise<number> {
  try {
    const now = new Date();

    const result = await sql<{ id: string }>`
      DELETE FROM project_invitations
      WHERE expires_at < ${now}
      RETURNING id
    `.execute(db);

    return result.rows.length;
  } catch (error) {
    console.error("Error cleaning up expired invitations:", error);
    throw new Error("Failed to cleanup expired invitations");
  }
}
