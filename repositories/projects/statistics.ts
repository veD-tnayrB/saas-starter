import { sql } from "kysely";

import { db } from "@/lib/db";

/**
 * Statistics about project members by role
 */
export interface IProjectMembersByRole {
  OWNER: number;
  ADMIN: number;
  MEMBER: number;
}

/**
 * Statistics about project invitations
 */
export interface IProjectInvitationStats {
  pending: number;
  expired: number;
  total: number;
}

/**
 * Data point for member growth over time
 */
export interface IMemberGrowthDataPoint {
  date: string;
  count: number;
}

/**
 * Get members count by role for a project
 */
export async function getProjectMembersByRole(
  projectId: string,
): Promise<IProjectMembersByRole> {
  try {
    const result = await sql<{
      roleName: string;
      count: string;
    }>`
      SELECT 
        ar.name AS "roleName",
        COUNT(*)::text AS "count"
      FROM project_members pm
      INNER JOIN app_roles ar ON ar.id = pm.role_id
      WHERE pm.project_id = ${projectId}
      GROUP BY ar.name
    `.execute(db);

    const stats: IProjectMembersByRole = {
      OWNER: 0,
      ADMIN: 0,
      MEMBER: 0,
    };

    result.rows.forEach((row) => {
      const roleName = row.roleName as keyof IProjectMembersByRole;
      if (roleName in stats) {
        stats[roleName] = parseInt(row.count, 10);
      }
    });

    return stats;
  } catch (error) {
    console.error("Error getting project members by role:", error);
    throw new Error("Failed to get project members by role");
  }
}

/**
 * Get invitation statistics for a project
 * @param projectId - The project ID to get statistics for (must be valid UUID)
 */
export async function getProjectInvitationStats(
  projectId: string,
): Promise<IProjectInvitationStats> {
  try {
    // Validate projectId is provided and not empty
    if (
      !projectId ||
      typeof projectId !== "string" ||
      projectId.trim() === ""
    ) {
      console.error(
        "Invalid projectId provided to getProjectInvitationStats:",
        projectId,
      );
      throw new Error("Invalid project ID");
    }

    const now = new Date();

    // Execute queries with explicit project_id filtering
    const [pendingResult, expiredResult, totalResult] = await Promise.all([
      sql<{ count: string }>`
        SELECT COUNT(*)::text as count
        FROM project_invitations
        WHERE project_id = ${projectId}
          AND expires_at > ${now}
      `.execute(db),
      sql<{ count: string }>`
        SELECT COUNT(*)::text as count
        FROM project_invitations
        WHERE project_id = ${projectId}
          AND expires_at <= ${now}
      `.execute(db),
      sql<{ count: string }>`
        SELECT COUNT(*)::text as count
        FROM project_invitations
        WHERE project_id = ${projectId}
      `.execute(db),
    ]);

    const pending = parseInt(pendingResult.rows[0]?.count || "0", 10);
    const expired = parseInt(expiredResult.rows[0]?.count || "0", 10);
    const total = parseInt(totalResult.rows[0]?.count || "0", 10);

    return {
      pending,
      expired,
      total,
    };
  } catch (error) {
    console.error(
      "Error getting project invitation stats for projectId:",
      projectId,
      error,
    );
    throw new Error("Failed to get project invitation stats");
  }
}

/**
 * Get member growth over time (last 30 days)
 */
export async function getProjectMemberGrowth(
  projectId: string,
): Promise<IMemberGrowthDataPoint[]> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const membersResult = await sql<{
      createdAt: Date;
    }>`
      SELECT created_at AS "createdAt"
      FROM project_members
      WHERE project_id = ${projectId}
        AND created_at >= ${thirtyDaysAgo}
      ORDER BY created_at ASC
    `.execute(db);

    // Create a map of dates to member counts
    const dateMap = new Map<string, number>();

    // Initialize all dates in the last 30 days with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateKey = date.toISOString().split("T")[0];
      dateMap.set(dateKey, 0);
    }

    // Count members added each day
    membersResult.rows.forEach((member) => {
      const dateKey = member.createdAt.toISOString().split("T")[0];
      const current = dateMap.get(dateKey) || 0;
      dateMap.set(dateKey, current + 1);
    });

    // Convert to cumulative counts
    const result: IMemberGrowthDataPoint[] = [];
    let cumulativeCount = 0;

    // Get total members before the 30-day window
    const membersBeforeResult = await sql<{ count: string }>`
      SELECT COUNT(*)::text as count
      FROM project_members
      WHERE project_id = ${projectId}
        AND created_at < ${thirtyDaysAgo}
    `.execute(db);

    cumulativeCount = parseInt(membersBeforeResult.rows[0]?.count || "0", 10);

    // Sort dates and create data points
    const sortedDates = Array.from(dateMap.keys()).sort();
    sortedDates.forEach((date) => {
      cumulativeCount += dateMap.get(date) || 0;
      result.push({
        date,
        count: cumulativeCount,
      });
    });

    return result;
  } catch (error) {
    console.error("Error getting project member growth:", error);
    throw new Error("Failed to get project member growth");
  }
}

/**
 * Get total member count for a project
 */
export async function getProjectMemberCount(
  projectId: string,
): Promise<number> {
  try {
    const result = await sql<{ count: string }>`
      SELECT COUNT(*)::text as count
      FROM project_members
      WHERE project_id = ${projectId}
    `.execute(db);

    return parseInt(result.rows[0]?.count || "0", 10);
  } catch (error) {
    console.error("Error getting project member count:", error);
    throw new Error("Failed to get project member count");
  }
}
