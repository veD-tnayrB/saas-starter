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
      project_id: string;
      email: string;
      role_id: string;
      invited_by_id: string;
      token: string;
      created_at: Date;
      expires_at: Date;
      role_id_2: string;
      role_name: string;
      role_priority: number;
    }>`
      SELECT 
        pi.id,
        pi.project_id,
        pi.email,
        pi.role_id,
        pi.invited_by_id,
        pi.token,
        pi.created_at,
        pi.expires_at,
        ar.id as role_id_2,
        ar.name as role_name,
        ar.priority as role_priority
      FROM project_invitations pi
      INNER JOIN app_roles ar ON ar.id = pi.role_id
      WHERE pi.token = ${token}
      LIMIT 1
    `.execute(db);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      projectId: row.project_id,
      email: row.email,
      roleId: row.role_id,
      role: {
        id: row.role_id_2,
        name: row.role_name,
        priority: row.role_priority,
      },
      invitedById: row.invited_by_id,
      token: row.token,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
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
      project_id: string;
      email: string;
      role_id: string;
      invited_by_id: string;
      token: string;
      created_at: Date;
      expires_at: Date;
      role_id_2: string;
      role_name: string;
      role_priority: number;
    }>`
      SELECT 
        pi.id,
        pi.project_id,
        pi.email,
        pi.role_id,
        pi.invited_by_id,
        pi.token,
        pi.created_at,
        pi.expires_at,
        ar.id as role_id_2,
        ar.name as role_name,
        ar.priority as role_priority
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
      projectId: row.project_id,
      email: row.email,
      roleId: row.role_id,
      role: {
        id: row.role_id_2,
        name: row.role_name,
        priority: row.role_priority,
      },
      invitedById: row.invited_by_id,
      token: row.token,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
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
      project_id: string;
      email: string;
      role_id: string;
      invited_by_id: string;
      token: string;
      created_at: Date;
      expires_at: Date;
      role_id_2: string;
      role_name: string;
      role_priority: number;
    }>`
      SELECT 
        pi.id,
        pi.project_id,
        pi.email,
        pi.role_id,
        pi.invited_by_id,
        pi.token,
        pi.created_at,
        pi.expires_at,
        ar.id as role_id_2,
        ar.name as role_name,
        ar.priority as role_priority
      FROM project_invitations pi
      INNER JOIN app_roles ar ON ar.id = pi.role_id
      WHERE pi.project_id = ${projectId}
        AND pi.expires_at > ${now}
      ORDER BY pi.created_at DESC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      email: row.email,
      roleId: row.role_id,
      role: {
        id: row.role_id_2,
        name: row.role_name,
        priority: row.role_priority,
      },
      invitedById: row.invited_by_id,
      token: row.token,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
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
      project_id: string;
      email: string;
      role_id: string;
      invited_by_id: string;
      token: string;
      created_at: Date;
      expires_at: Date;
      role_id_2: string;
      role_name: string;
      role_priority: number;
    }>`
      SELECT 
        pi.id,
        pi.project_id,
        pi.email,
        pi.role_id,
        pi.invited_by_id,
        pi.token,
        pi.created_at,
        pi.expires_at,
        ar.id as role_id_2,
        ar.name as role_name,
        ar.priority as role_priority
      FROM project_invitations pi
      INNER JOIN app_roles ar ON ar.id = pi.role_id
      WHERE pi.email = ${email}
        AND pi.expires_at > ${now}
      ORDER BY pi.created_at DESC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      email: row.email,
      roleId: row.role_id,
      role: {
        id: row.role_id_2,
        name: row.role_name,
        priority: row.role_priority,
      },
      invitedById: row.invited_by_id,
      token: row.token,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
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
      project_id: string;
      email: string;
      role_id: string;
      invited_by_id: string;
      token: string;
      created_at: Date;
      expires_at: Date;
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
      RETURNING *
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
      projectId: invitation.project_id,
      email: invitation.email,
      roleId: invitation.role_id,
      role: {
        id: role.id,
        name: role.name,
        priority: role.priority,
      },
      invitedById: invitation.invited_by_id,
      token: invitation.token,
      createdAt: invitation.created_at,
      expiresAt: invitation.expires_at,
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
