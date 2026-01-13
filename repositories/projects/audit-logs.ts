import { randomUUID } from "crypto";
import { sql } from "kysely";

import { db } from "@/lib/db";
import { AuditLog } from "@/lib/db.types";

export interface IAuditLogCreateData {
  project_id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: any;
  ip_address?: string | null;
}

/**
 * Audit Log Repository
 */
export async function createAuditLog(
  data: IAuditLogCreateData,
): Promise<AuditLog> {
  try {
    const id = randomUUID();

    const result = await sql<AuditLog>`
      INSERT INTO audit_logs (
        id, project_id, user_id, action, entity_type, entity_id, metadata, ip_address, created_at
      )
      VALUES (
        ${id}, 
        ${data.project_id}, 
        ${data.user_id ?? null}, 
        ${data.action}, 
        ${data.entity_type}, 
        ${data.entity_id ?? null}, 
        ${JSON.stringify(data.metadata || {})}, 
        ${data.ip_address ?? null}, 
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `.execute(db);

    const log = result.rows[0];
    if (!log) throw new Error("Failed to create audit log");
    return log;
  } catch (error) {
    console.error("Error creating audit log:", error);
    throw new Error("Failed to create audit log");
  }
}

/**
 * Find audit logs for a project
 */
export async function findProjectAuditLogs(
  projectId: string,
  limit = 50,
): Promise<AuditLog[]> {
  try {
    const result = await sql<AuditLog>`
      SELECT * FROM audit_logs
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `.execute(db);

    return result.rows;
  } catch (error) {
    console.error("Error finding project audit logs:", error);
    throw new Error("Failed to find audit logs");
  }
}
