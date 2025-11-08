import { cache } from "react";
import { projectService } from "@/services/projects";

import { ProjectsList } from "@/components/dashboard/projects-list";

interface IProjectsListSectionProps {
  userId: string;
  currentProjectId: string;
}

const getUserProjects = cache(async (userId: string) => {
  return projectService.getUserProjects(userId);
});

export async function ProjectsListSection({
  userId,
  currentProjectId,
}: IProjectsListSectionProps) {
  const projects = await getUserProjects(userId);
  return (
    <ProjectsList projects={projects} currentProjectId={currentProjectId} />
  );
}
