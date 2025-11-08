import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { projectService } from "@/services/projects";

import { ProjectsOverview } from "@/components/dashboard/projects/overview";

interface IProjectsPageProps {
  params: Promise<{ projectId: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProjectsPage({ params }: IProjectsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { projectId } = await params;
  const projects = await projectService.getUserProjects(user.id);

  if (projects.length === 0) {
    redirect("/dashboard/settings");
  }

  const currentProject = projects.find((project) => project.id === projectId);
  const fallbackProject = projects[0];

  if (!currentProject && fallbackProject) {
    redirect(`/dashboard/${fallbackProject.id}/projects`);
  }

  const preparedProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    planName:
      project.subscriptionPlan?.displayName ??
      project.subscriptionPlan?.name ??
      "Starter",
    ownerName:
      project.owner.name ??
      project.owner.email ??
      project.owner.id ??
      "Unknown owner",
    isOwner: project.owner.id === user.id,
  }));

  return <ProjectsOverview projects={preparedProjects} />;
}
