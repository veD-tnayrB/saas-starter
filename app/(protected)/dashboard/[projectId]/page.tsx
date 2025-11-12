import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { findAllUserProjects } from "@/repositories/projects";
import { memberService, projectService } from "@/services/projects";

import { canManageProject } from "@/lib/project-roles";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { InvitationAcceptedToast } from "@/components/dashboard/invitation-accepted-toast";
import { ProjectNotFound } from "@/components/dashboard/project-not-found";
import { InvitationsChartSection } from "@/components/dashboard/sections/invitations-chart-section";
import { MemberGrowthSection } from "@/components/dashboard/sections/member-growth-section";
import { MembersByRoleSection } from "@/components/dashboard/sections/members-by-role-section";
import { ProjectMembersSection } from "@/components/dashboard/sections/project-members-section";
import { ProjectStatsSection } from "@/components/dashboard/sections/project-stats";
import { ChartSkeleton } from "@/components/dashboard/skeletons/chart-skeleton";
import { ListSkeleton } from "@/components/dashboard/skeletons/list-skeleton";
import { ProjectStatsSkeleton } from "@/components/dashboard/skeletons/project-stats-skeleton";

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

  // Get project and verify access (service enforces authorization)
  let project;
  try {
    project = await projectService.getProjectById(projectId, user.id);
  } catch (error) {
    // User is not authorized - redirect to their first project
    const userProjects = await findAllUserProjects(user.id);
    const firstProjectId = userProjects[0]?.id ?? null;
    return <ProjectNotFound firstProjectId={firstProjectId} />;
  }

  if (!project) {
    // Get user's projects to redirect to first one
    const userProjects = await findAllUserProjects(user.id);
    const firstProjectId = userProjects[0]?.id ?? null;
    return <ProjectNotFound firstProjectId={firstProjectId} />;
  }

  // Get user role for UI display
  const userRole = await memberService.getUserRole(projectId, user.id);

  // Since user passed authorization check, they must have a role
  if (!userRole) {
    const userProjects = await findAllUserProjects(user.id);
    const firstProjectId = userProjects[0]?.id ?? null;
    return <ProjectNotFound firstProjectId={firstProjectId} />;
  }

  // Determine what statistics to show based on role
  const canManageMembers = canManageProject(userRole);

  // Calculate total members by role
  return (
    <>
      <InvitationAcceptedToast />
      <DashboardHeader
        heading={project.name}
        text={`Welcome back, ${user.name}!`}
      />
      <div className="flex flex-col gap-5">
        <Suspense fallback={<ProjectStatsSkeleton />}>
          <ProjectStatsSection projectId={projectId} />
        </Suspense>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<ChartSkeleton title="Members by role" />}>
            <MembersByRoleSection projectId={projectId} />
          </Suspense>
          <Suspense fallback={<ChartSkeleton title="Member growth" />}>
            <MemberGrowthSection projectId={projectId} />
          </Suspense>
          <Suspense fallback={<ChartSkeleton title="Invitations" />}>
            <InvitationsChartSection projectId={projectId} />
          </Suspense>
        </div>

        <Suspense fallback={<ListSkeleton title="Project members" />}>
          <ProjectMembersSection
            projectId={projectId}
            canManageMembers={canManageMembers}
            userRole={userRole}
          />
        </Suspense>
      </div>
    </>
  );
}
