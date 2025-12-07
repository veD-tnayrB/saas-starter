import { randomUUID } from "crypto";
import { sql } from "kysely";

import { db } from "@/lib/db";

/**
 * Project invitation data transfer object
 * Supports multiple roles per invitation
 */
export interface IProjectInvitation {
  id: string;
  projectId: string;
  email: string;
  roleId?: string; // Deprecated: kept for backward compatibility
  roles: Array<{
    id: string;
    name: string;
    priority: number;
  }>;
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
  roleIds: string[]; // Array of role IDs
  invitedById: string;
  token: string;
  expiresAt: Date;
}

/**
 * Find invitation roles by invitation ID
 */
export async function findInvitationRoles(
  invitationId: string,
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
      FROM project_invitation_roles pir
      INNER JOIN app_roles ar ON ar.id = pir.role_id
      WHERE pir.project_invitation_id = ${invitationId}
      ORDER BY ar.priority ASC
    `.execute(db);

    return result.rows.map((row) => ({
      id: row.roleId,
      name: row.roleName,
      priority: row.rolePriority,
    }));
  } catch (error) {
    console.error("Error finding invitation roles:", error);
    throw new Error("Failed to find invitation roles");
  }
}

/**
 * Find invitation by token
 * Returns invitation with all its roles
 */
export async function findInvitationByToken(
  token: string,
): Promise<IProjectInvitation | null> {
  try {
    const invitationResult = await sql<{
      id: string;
      projectId: string;
      email: string;
      roleId: string | null;
      invitedById: string;
      token: string;
      createdAt: Date;
      expiresAt: Date;
    }>`
      SELECT 
        pi.id,
        pi.project_id AS "projectId",
        pi.email,
        pi.role_id AS "roleId",
        pi.invited_by_id AS "invitedById",
        pi.token,
        pi.created_at AS "createdAt",
        pi.expires_at AS "expiresAt"
      FROM project_invitations pi
      WHERE pi.token = ${token}
      LIMIT 1
    `.execute(db);

    const invitationRow = invitationResult.rows[0];
    if (!invitationRow) return null;

    // Get all roles for this invitation
    const roles = await findInvitationRoles(invitationRow.id);

    return {
      id: invitationRow.id,
      projectId: invitationRow.projectId,
      email: invitationRow.email,
      roleId: invitationRow.roleId ?? undefined,
      roles,
      invitedById: invitationRow.invitedById,
      token: invitationRow.token,
      createdAt: invitationRow.createdAt,
      expiresAt: invitationRow.expiresAt,
    };
  } catch (error) {
    console.error("Error finding invitation by token:", error);
    throw new Error("Failed to find invitation");
  }
}

/**
 * Find invitation by email and project
 * Returns invitation with all its roles
 */
export async function findInvitationByEmailAndProject(
  email: string,
  projectId: string,
): Promise<IProjectInvitation | null> {
  try {
    const now = new Date();

    const invitationResult = await sql<{
      id: string;
      projectId: string;
      email: string;
      roleId: string | null;
      invitedById: string;
      token: string;
      createdAt: Date;
      expiresAt: Date;
    }>`
      SELECT 
        pi.id,
        pi.project_id AS "projectId",
        pi.email,
        pi.role_id AS "roleId",
        pi.invited_by_id AS "invitedById",
        pi.token,
        pi.created_at AS "createdAt",
        pi.expires_at AS "expiresAt"
      FROM project_invitations pi
      WHERE pi.email = ${email}
        AND pi.project_id = ${projectId}
        AND pi.expires_at > ${now}
      ORDER BY pi.created_at DESC
      LIMIT 1
    `.execute(db);

    const invitationRow = invitationResult.rows[0];
    if (!invitationRow) return null;

    // Get all roles for this invitation
    const roles = await findInvitationRoles(invitationRow.id);

    return {
      id: invitationRow.id,
      projectId: invitationRow.projectId,
      email: invitationRow.email,
      roleId: invitationRow.roleId ?? undefined,
      roles,
      invitedById: invitationRow.invitedById,
      token: invitationRow.token,
      createdAt: invitationRow.createdAt,
      expiresAt: invitationRow.expiresAt,
    };
  } catch (error) {
    console.error("Error finding invitation by email and project:", error);
    throw new Error("Failed to find invitation");
  }
}

/**
 * Find all invitations for a project
 * Returns invitations with all their roles
 */
export async function findProjectInvitations(
  projectId: string,
): Promise<IProjectInvitation[]> {
  try {
    const now = new Date();

    const invitationsResult = await sql<{
      id: string;
      projectId: string;
      email: string;
      roleId: string | null;
      invitedById: string;
      token: string;
      createdAt: Date;
      expiresAt: Date;
    }>`
      SELECT 
        pi.id,
        pi.project_id AS "projectId",
        pi.email,
        pi.role_id AS "roleId",
        pi.invited_by_id AS "invitedById",
        pi.token,
        pi.created_at AS "createdAt",
        pi.expires_at AS "expiresAt"
      FROM project_invitations pi
      WHERE pi.project_id = ${projectId}
        AND pi.expires_at > ${now}
      ORDER BY pi.created_at DESC
    `.execute(db);

    // For each invitation, get their roles
    const invitations = await Promise.all(
      invitationsResult.rows.map(async (row) => {
        const roles = await findInvitationRoles(row.id);
        return {
          id: row.id,
          projectId: row.projectId,
          email: row.email,
          roleId: row.roleId ?? undefined,
          roles,
          invitedById: row.invitedById,
          token: row.token,
          createdAt: row.createdAt,
          expiresAt: row.expiresAt,
        };
      }),
    );

    return invitations;
  } catch (error) {
    console.error("Error finding project invitations:", error);
    throw new Error("Failed to find project invitations");
  }
}

/**
 * Find all pending invitations for a user by email
 * Returns invitations with all their roles
 */
export async function findPendingInvitationsByEmail(
  email: string,
): Promise<IProjectInvitation[]> {
  try {
    const now = new Date();

    const invitationsResult = await sql<{
      id: string;
      projectId: string;
      email: string;
      roleId: string | null;
      invitedById: string;
      token: string;
      createdAt: Date;
      expiresAt: Date;
    }>`
      SELECT 
        pi.id,
        pi.project_id AS "projectId",
        pi.email,
        pi.role_id AS "roleId",
        pi.invited_by_id AS "invitedById",
        pi.token,
        pi.created_at AS "createdAt",
        pi.expires_at AS "expiresAt"
      FROM project_invitations pi
      WHERE pi.email = ${email}
        AND pi.expires_at > ${now}
      ORDER BY pi.created_at DESC
    `.execute(db);

    // For each invitation, get their roles
    const invitations = await Promise.all(
      invitationsResult.rows.map(async (row) => {
        const roles = await findInvitationRoles(row.id);
        return {
          id: row.id,
          projectId: row.projectId,
          email: row.email,
          roleId: row.roleId ?? undefined,
          roles,
          invitedById: row.invitedById,
          token: row.token,
          createdAt: row.createdAt,
          expiresAt: row.expiresAt,
        };
      }),
    );

    return invitations;
  } catch (error) {
    console.error("Error finding pending invitations by email:", error);
    throw new Error("Failed to find pending invitations");
  }
}

/**
 * Create project invitation
 * Creates invitation with multiple roles
 */
export async function createProjectInvitation(
  data: IProjectInvitationCreateData,
): Promise<IProjectInvitation> {
  try {
    if (data.roleIds.length === 0) {
      throw new Error("At least one role is required");
    }

    const id = randomUUID();
    const firstRoleId = data.roleIds[0]; // Keep first role for backward compatibility

    // Create invitation (role_id is nullable now, but we keep it for backward compatibility)
    const invitationResult = await sql<{
      id: string;
      projectId: string;
      email: string;
      roleId: string | null;
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
        ${firstRoleId},
        ${data.invitedById},
        ${data.token},
        CURRENT_TIMESTAMP,
        ${data.expiresAt}
      )
      RETURNING 
        id,
        project_id AS "projectId",
        email,
        role_id AS "roleId",
        invited_by_id AS "invitedById",
        token,
        created_at AS "createdAt",
        expires_at AS "expiresAt"
    `.execute(db);

    const invitation = invitationResult.rows[0];
    if (!invitation) throw new Error("Failed to create project invitation");

    // Create invitation roles
    for (const roleId of data.roleIds) {
      const roleMemberId = randomUUID();
      await sql`
        INSERT INTO project_invitation_roles (id, project_invitation_id, role_id, created_at)
        VALUES (${roleMemberId}, ${invitation.id}, ${roleId}, CURRENT_TIMESTAMP)
      `.execute(db);
    }

    // Get all roles for this invitation
    const roles = await findInvitationRoles(invitation.id);

    return {
      id: invitation.id,
      projectId: invitation.projectId,
      email: invitation.email,
      roleId: invitation.roleId ?? undefined,
      roles,
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
