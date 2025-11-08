import { cache } from "react";
import {
  getProjectInvitationStats,
  getProjectMemberCount,
  getProjectMemberGrowth,
  getProjectMembersByRole,
} from "@/repositories/projects";

import { ProjectStatsCard } from "@/components/dashboard/project-stats-card";

interface IProjectStatsProps {
  projectId: string;
}

const getProjectStats = cache(async (projectId: string) => {
  const [membersByRole, invitationStats, memberGrowth, totalMembers] =
    await Promise.all([
      getProjectMembersByRole(projectId),
      getProjectInvitationStats(projectId),
      getProjectMemberGrowth(projectId),
      getProjectMemberCount(projectId),
    ]);

  const firstCount = memberGrowth[0]?.count ?? 0;
  const lastCount = memberGrowth[memberGrowth.length - 1]?.count ?? 0;
  const growthDiff = lastCount - firstCount;
  const growthPercent =
    firstCount === 0
      ? lastCount > 0
        ? 100
        : 0
      : Math.round((growthDiff / firstCount) * 100);

  return {
    membersByRole,
    invitationStats,
    memberGrowth,
    totalMembers,
    growthPercent,
  };
});

export async function ProjectStatsSection({ projectId }: IProjectStatsProps) {
  const stats = await getProjectStats(projectId);
  const totalLeaders = stats.membersByRole.OWNER + stats.membersByRole.ADMIN;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ProjectStatsCard
        title="Total members"
        value={stats.totalMembers}
        icon="users"
        description={`${stats.membersByRole.OWNER} owners, ${stats.membersByRole.ADMIN} admins, ${stats.membersByRole.MEMBER} members`}
      />
      <ProjectStatsCard
        title="Pending invitations"
        value={stats.invitationStats.pending}
        icon="userPlus"
        description={`${stats.invitationStats.expired} expired invitations`}
      />
      <ProjectStatsCard
        title="Team leaders"
        value={totalLeaders}
        icon="shield"
        description="Owners and administrators"
      />
      <ProjectStatsCard
        title="Growth (30d)"
        value={`${stats.growthPercent}%`}
        icon="trendingUp"
        description="Member increase in the last month."
        trend={{
          value: stats.growthPercent,
          isPositive: stats.growthPercent >= 0,
        }}
      />
    </div>
  );
}
