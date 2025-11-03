import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { memberService, projectService } from "@/services/projects";

import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProjectMembers } from "@/components/dashboard/project-members";

interface ProjectDashboardPageProps {
  params: Promise<{ projectId: string }>;
}

export const metadata = constructMetadata({
  title: "Project Dashboard – SaaS Starter",
  description: "Manage your project and collaborate with your team.",
});

export default async function ProjectDashboardPage({
  params,
}: ProjectDashboardPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { projectId } = await params;

  // Get project and verify access
  const project = await projectService.getProjectById(projectId);
  if (!project) {
    redirect("/dashboard");
  }

  const userRole = await memberService.getUserRole(projectId, user.id);
  if (!userRole) {
    redirect("/dashboard");
  }

  // Get project members
  const members = await memberService.getProjectMembers(projectId);

  return (
    <>
      <DashboardHeader
        heading={project.name}
        text={`Role: ${userRole} — Manage your project and team members.`}
      />
      <div className="space-y-6">
        <ProjectMembers
          projectId={projectId}
          members={members}
          userRole={userRole}
        />
      </div>
    </>
  );
}
