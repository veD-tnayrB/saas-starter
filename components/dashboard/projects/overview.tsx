"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardHeader } from "@/components/dashboard/header";
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-8"
      >
        <DashboardHeader
          heading="Projects"
          text="Review every project you have access to. Owners can manage them directly from this list."
        >
          <Button
            type="button"
            onClick={openCreateDialog}
            className="hover-lift shadow-silver"
          >
            <Icons.add className="mr-2 size-4" />
            New project
          </Button>
        </DashboardHeader>

        <ProjectsList
          projects={preparedProjects}
          onCreateProject={hasProjects ? undefined : openCreateDialog}
        />
      </motion.div>

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
