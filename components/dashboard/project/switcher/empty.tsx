"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/dashboard/project/create-dialog";

interface IProjectSwitcherEmptyProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  onCreate: () => void;
  creating: boolean;
}

export function ProjectSwitcherEmpty({
  openDialog,
  setOpenDialog,
  projectName,
  setProjectName,
  onCreate,
  creating,
}: IProjectSwitcherEmptyProps) {
  return (
    <>
      <Button
        variant="ghost"
        className="h-8 px-2"
        onClick={() => setOpenDialog(true)}
      >
        <Plus className="mr-2 size-4" />
        <span className="text-sm">New Project</span>
      </Button>
      <CreateProjectDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onCreate={onCreate}
        creating={creating}
      />
    </>
  );
}
