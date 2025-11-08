"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CreateProjectDialog } from "@/components/dashboard/project/create-dialog";
import { useCreateProject } from "@/components/dashboard/project/use-create-project";
import { ProjectsList } from "@/components/dashboard/projects/list";
import { Icons } from "@/components/shared/icons";

import { IProjectCardData } from "./card";

interface IProjectsOverviewProps {
  projects: IProjectCardData[];
}

export function ProjectsOverview({ projects }: IProjectsOverviewProps) {
  const router = useRouter();
  const {
    projectName,
    setProjectName,
    creating,
    handleCreateProject,
    openDialog,
    setOpenDialog,
    openCreateDialog,
  } = useCreateProject(() => router.refresh());

  const hasProjects = projects.length > 0;

  const preparedProjects = useMemo(
    () =>
      projects.map(function formatProject(project) {
        return {
          ...project,
          createdAt: new Date(project.createdAt),
        };
      }),
    [projects],
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Review every project you have access to. Owners can manage them
            directly from this list.
          </p>
        </div>
        <Button type="button" onClick={openCreateDialog}>
          <Icons.add className="mr-2 size-4" />
          New project
        </Button>
      </div>

      <ProjectsList
        projects={preparedProjects}
        onCreateProject={hasProjects ? undefined : openCreateDialog}
      />

      <CreateProjectDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onCreate={handleCreateProject}
        creating={creating}
      />
    </TooltipProvider>
  );
}
