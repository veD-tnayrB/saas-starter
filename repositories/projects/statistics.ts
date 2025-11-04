import { prisma } from "@/clients/db";

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
    const members = await prisma.projectMember.groupBy({
      by: ["role"],
      where: { projectId },
      _count: {
        role: true,
      },
    });

    const stats: IProjectMembersByRole = {
      OWNER: 0,
      ADMIN: 0,
      MEMBER: 0,
    };

    members.forEach((member) => {
      stats[member.role] = member._count.role;
    });

    return stats;
  } catch (error) {
    console.error("Error getting project members by role:", error);
    throw new Error("Failed to get project members by role");
  }
}

/**
 * Get invitation statistics for a project
 */
export async function getProjectInvitationStats(
  projectId: string,
): Promise<IProjectInvitationStats> {
  try {
    const now = new Date();

    const [pending, expired, total] = await Promise.all([
      prisma.projectInvitation.count({
        where: {
          projectId,
          expiresAt: {
            gt: now,
          },
        },
      }),
      prisma.projectInvitation.count({
        where: {
          projectId,
          expiresAt: {
            lte: now,
          },
        },
      }),
      prisma.projectInvitation.count({
        where: { projectId },
      }),
    ]);

    return {
      pending,
      expired,
      total,
    };
  } catch (error) {
    console.error("Error getting project invitation stats:", error);
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

    const members = await prisma.projectMember.findMany({
      where: {
        projectId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

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
    members.forEach((member) => {
      const dateKey = member.createdAt.toISOString().split("T")[0];
      const current = dateMap.get(dateKey) || 0;
      dateMap.set(dateKey, current + 1);
    });

    // Convert to cumulative counts
    const result: IMemberGrowthDataPoint[] = [];
    let cumulativeCount = 0;

    // Get total members before the 30-day window
    const membersBefore = await prisma.projectMember.count({
      where: {
        projectId,
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    cumulativeCount = membersBefore;

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
    return await prisma.projectMember.count({
      where: { projectId },
    });
  } catch (error) {
    console.error("Error getting project member count:", error);
    throw new Error("Failed to get project member count");
  }
}
