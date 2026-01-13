import {
  createAuditLog,
  IAuditLogCreateData,
} from "@/repositories/projects/audit-logs";

/**
 * Service for recording project activity
 */
export class AuditLogService {
  /**
   * Record a new project action
   * Runs in the background (no await needed by the caller)
   */
  async logAction(data: IAuditLogCreateData) {
    try {
      // We don't necessarily want to block the user request for logging,
      // but in this server-side context we'll call it.
      await createAuditLog(data);
    } catch (error) {
      // Just log to console, don't crash the main process if logging fails
      console.error("Audit log failed to record:", error);
    }
  }

  // Common action helpers
  async logMemberInvite(
    projectId: string,
    performerId: string,
    invitedEmail: string,
    role: string,
  ) {
    return this.logAction({
      project_id: projectId,
      user_id: performerId,
      action: "member.invite",
      entity_type: "member",
      metadata: { email: invitedEmail, role },
    });
  }

  async logMemberRemove(
    projectId: string,
    performerId: string,
    removedUserId: string,
  ) {
    return this.logAction({
      project_id: projectId,
      user_id: performerId,
      action: "member.remove",
      entity_type: "member",
      entity_id: removedUserId,
    });
  }

  async logRoleUpdate(
    projectId: string,
    performerId: string,
    targetUserId: string,
    roles: string[],
  ) {
    return this.logAction({
      project_id: projectId,
      user_id: performerId,
      action: "member.role_update",
      entity_type: "member",
      entity_id: targetUserId,
      metadata: { roles },
    });
  }

  async logPlanUpdate(
    projectId: string,
    performerId: string,
    newPlanId: string,
  ) {
    return this.logAction({
      project_id: projectId,
      user_id: performerId,
      action: "project.plan_update",
      entity_type: "project",
      entity_id: projectId,
      metadata: { plan_id: newPlanId },
    });
  }
}

export const auditLogService = new AuditLogService();
