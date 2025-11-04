"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProjectItem } from "./item";

interface IProject {
  id: string;
  name: string;
  color: string;
}

interface IProjectListProps {
  projects: IProject[];
  selectedProjectId: string | null;
  setOpenPopover: (open: boolean) => void;
  onNewProject: () => void;
}

export function ProjectList({
  projects,
  selectedProjectId,
  setOpenPopover,
  onNewProject,
}: IProjectListProps) {
  const router = useRouter();

  function handleProjectSelect(projectId: string) {
    setOpenPopover(false);
    router.push(`/dashboard/${projectId}`);
    router.refresh();
  }

  const projectItems = projects.map((project) => (
    <ProjectItem
      key={project.id}
      project={project}
      isSelected={project.id === selectedProjectId}
      onSelect={handleProjectSelect}
    />
  ));

  return (
    <div className="flex flex-col gap-1">
      {projectItems}
      <Button
        variant="outline"
        className="relative flex h-9 items-center justify-center gap-2 p-2"
        onClick={onNewProject}
      >
        <Plus size={18} className="absolute left-2.5 top-2" />
        <span className="flex-1 truncate text-center">New Project</span>
      </Button>
    </div>
  );
}
