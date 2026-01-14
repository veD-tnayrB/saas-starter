import { cache } from "react";
import { memberService } from "@/services/projects";
import { Activity, UserPlus, Users } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";

interface IProjectStatsSectionProps {
  projectId: string;
}

const getProjectStats = cache(async (projectId: string) => {
  const members = await memberService.getProjectMembers(projectId);

  // Calculate stats
  const totalMembers = members.length;
  const recentMembers = members.filter((m) => {
    const joinedDate = new Date(m.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return joinedDate > thirtyDaysAgo;
  }).length;

  return {
    totalMembers,
    recentMembers,
    activeMembers: totalMembers, // Could be enhanced with actual activity tracking
  };
});

export async function ProjectStatsSection({
  projectId,
}: IProjectStatsSectionProps) {
  const stats = await getProjectStats(projectId);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Total Members"
        value={stats.totalMembers}
        description="Active team members"
        icon={Users}
      />
      <StatCard
        title="New This Month"
        value={stats.recentMembers}
        description="Joined in last 30 days"
        icon={UserPlus}
        trend={
          stats.recentMembers > 0
            ? {
                value: Math.round(
                  (stats.recentMembers / Math.max(stats.totalMembers, 1)) * 100,
                ),
                label: "of total members",
              }
            : undefined
        }
      />
      <StatCard
        title="Active Members"
        value={stats.activeMembers}
        description="Currently active"
        icon={Activity}
      />
    </div>
  );
}
