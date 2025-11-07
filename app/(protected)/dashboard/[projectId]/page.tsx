import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import {
  findAllUserProjects,
  getProjectInvitationStats,
  getProjectMemberCount,
  getProjectMemberGrowth,
  getProjectMembersByRole,
} from "@/repositories/projects";
import { memberService, projectService } from "@/services/projects";

import { canManageProject, hasPermissionLevel } from "@/lib/project-roles";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { InvitationAcceptedToast } from "@/components/dashboard/invitation-accepted-toast";
import { InvitationsChart } from "@/components/dashboard/invitations-chart";
import { MemberGrowthChart } from "@/components/dashboard/member-growth-chart";
import { ProjectMembers } from "@/components/dashboard/members";
import { MembersByRoleChart } from "@/components/dashboard/members-by-role-chart";
import { ProjectNotFound } from "@/components/dashboard/project-not-found";
import { ProjectStatsCard } from "@/components/dashboard/project-stats-card";

interface IDashboardPageProps {
  params: Promise<{ projectId: string }>;
}

export const metadata = constructMetadata({
  title: "Dashboard – SaaS Starter",
  description: "View project statistics and manage your team.",
});

// Force dynamic rendering to prevent caching issues between different users/projects
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage({ params }: IDashboardPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { projectId } = await params;

  // Validate projectId is provided
  if (!projectId || typeof projectId !== "string" || projectId.trim() === "") {
    const userProjects = await findAllUserProjects(user.id);
    const firstProjectId = userProjects[0]?.id ?? null;
    return <ProjectNotFound firstProjectId={firstProjectId} />;
  }

  // Get project and verify access
  const project = await projectService.getProjectById(projectId);
  if (!project) {
    // Get user's projects to redirect to first one
    const userProjects = await findAllUserProjects(user.id);
    const firstProjectId = userProjects[0]?.id ?? null;
    return <ProjectNotFound firstProjectId={firstProjectId} />;
  }

  // Verify user has access by checking their role directly
  // This is more reliable than checking findAllUserProjects, especially
  // after accepting an invitation where the membership was just created
  const userRole = await memberService.getUserRole(projectId, user.id);
  if (!userRole) {
    // User is not a member of this project - redirect to their first project
    const userProjects = await findAllUserProjects(user.id);
    const firstProjectId = userProjects[0]?.id ?? null;
    return <ProjectNotFound firstProjectId={firstProjectId} />;
  }

  // Get project members
  const members = await memberService.getProjectMembers(projectId);

  // Get project statistics - all queries use the validated projectId
  const [membersByRole, invitationStats, memberGrowth, totalMembers] =
    await Promise.all([
      getProjectMembersByRole(projectId),
      getProjectInvitationStats(projectId),
      getProjectMemberGrowth(projectId),
      getProjectMemberCount(projectId),
    ]);

  // Determine what statistics to show based on role
  const canViewAdvancedStats = hasPermissionLevel(userRole, "ADMIN");
  const canViewMembers = true; // All members can view members
  const canManageMembers = canManageProject(userRole);

  // Calculate total members by role
  const totalMembersByRole =
    membersByRole.OWNER + membersByRole.ADMIN + membersByRole.MEMBER;

  return (
    <>
      <InvitationAcceptedToast />
      <DashboardHeader
        heading={project.name}
        text={`Role: ${userRole} — View project statistics and manage your team.`}
      />
      <div className="flex flex-col gap-5">
        {/* Statistics Cards - Visible to all, but with different data based on role */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ProjectStatsCard
            title="Total Members"
            value={totalMembers}
            description={`${membersByRole.OWNER} owners, ${membersByRole.ADMIN} admins, ${membersByRole.MEMBER} members`}
            icon="users"
          />
          <ProjectStatsCard
            title="Pending Invitations"
            value={invitationStats.pending}
            description={`${invitationStats.expired} expired invitations`}
            icon="userPlus"
          />
          {canViewAdvancedStats && (
            <>
              <ProjectStatsCard
                title="Team Leaders"
                value={membersByRole.OWNER + membersByRole.ADMIN}
                description="Owners and administrators"
                icon="shield"
              />
              <ProjectStatsCard
                title="Active Members"
                value={membersByRole.MEMBER}
                description="Regular team members"
                icon="trendingUp"
              />
            </>
          )}
        </div>

        {/* Charts - Visible to all, but with different charts based on role */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MembersByRoleChart data={membersByRole} />
          <MemberGrowthChart data={memberGrowth} />
          <InvitationsChart data={invitationStats} />
        </div>

        {/* Project Members - Visible to all, but management depends on role */}
        <div className="space-y-6">
          <ProjectMembers
            projectId={projectId}
            members={members}
            userRole={userRole}
          />
        </div>
      </div>
    </>
  );
}
