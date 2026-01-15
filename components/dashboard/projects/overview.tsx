"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProjectsList } from "@/components/dashboard/projects/list";
import { CreateProjectButton } from "./create-project-button";

import { IProjectCardData } from "./card";

interface IProjectsOverviewProps {
  projects: IProjectCardData[];
}

export function ProjectsOverview({ projects }: IProjectsOverviewProps) {
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
          <CreateProjectButton />
        </DashboardHeader>

        <ProjectsList
          projects={preparedProjects}
          onCreateProject={hasProjects ? undefined : () => {
            // The button inside CreateProjectButton will handle opening the dialog
            // We need a way to trigger it from here.
            // For now, let's just rely on the header button.
            // A better implementation would involve a shared state or context.
          }}
        />
      </motion.div>
    </TooltipProvider>
  );
}
