"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { useProjects } from "@/hooks/use-projects";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CreateProjectDialog } from "@/components/dashboard/project/create-dialog";
import { ProjectList } from "@/components/dashboard/project/list";
import { useCreateProject } from "@/components/dashboard/project/use-create-project";

import { ProjectSwitcherButton } from "./button";
import { ProjectSwitcherEmpty } from "./empty";
import { ProjectSwitcherPlaceholder } from "./placeholder";

interface IProject {
  id: string;
  name: string;
  color: string;
}

export function ProjectSwitcher({ large = false }: { large?: boolean }) {
  const { status } = useSession();
  const pathname = usePathname();
  const [openPopover, setOpenPopover] = useState(false);
  const { projects, loading, refreshProjects } = useProjects();
  const {
    projectName,
    setProjectName,
    creating,
    handleCreateProject,
    openDialog,
    setOpenDialog,
  } = useCreateProject(refreshProjects);

  const currentProjectId = pathname?.match(/\/dashboard\/([^/]+)/)?.[1] || null;

  let currentProject: IProject | null = null;
  if (currentProjectId) {
    const found = projects.find((p) => p.id === currentProjectId);
    if (found) {
      currentProject = found;
    }
  }

  const selectedProject = currentProject || projects[0];

  if (status === "loading" || loading) {
    return <ProjectSwitcherPlaceholder />;
  }

  if (projects.length === 0) {
    return (
      <ProjectSwitcherEmpty
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        projectName={projectName}
        setProjectName={setProjectName}
        onCreate={handleCreateProject}
        creating={creating}
      />
    );
  }

  return (
    <>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <ProjectSwitcherButton
            selectedProject={selectedProject}
            openPopover={openPopover}
            large={large}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="max-w-60 p-2">
          <ProjectList
            projects={projects}
            selectedProjectId={currentProjectId}
            setOpenPopover={setOpenPopover}
            onNewProject={() => {
              setOpenPopover(false);
              setOpenDialog(true);
            }}
          />
        </PopoverContent>
      </Popover>
      <CreateProjectDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onCreate={handleCreateProject}
        creating={creating}
      />
    </>
  );
}
