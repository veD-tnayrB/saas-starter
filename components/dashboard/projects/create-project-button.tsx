"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/dashboard/project/create-dialog";
import { useCreateProject } from "@/components/dashboard/project/use-create-project";
import { Icons } from "@/components/shared/icons";

export function CreateProjectButton() {
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

  return (
    <>
      <Button
        type="button"
        onClick={openCreateDialog}
        className="hover-lift shadow-silver"
      >
        <Icons.add className="mr-2 size-4" />
        New project
      </Button>
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
