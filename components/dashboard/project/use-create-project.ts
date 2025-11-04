"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface IUseCreateProjectReturn {
  projectName: string;
  setProjectName: (name: string) => void;
  creating: boolean;
  handleCreateProject: () => Promise<void>;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

export function useCreateProject(
  onSuccess?: () => void,
): IUseCreateProjectReturn {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  async function handleCreateProject() {
    if (!projectName.trim()) return;

    try {
      setCreating(true);
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create project");
      }

      const data = await response.json();

      setOpenDialog(false);
      setProjectName("");
      router.push(`/dashboard/${data.project.id}`);
      router.refresh();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create project",
      );
    } finally {
      setCreating(false);
    }
  }

  return {
    projectName,
    setProjectName,
    creating,
    handleCreateProject,
    openDialog,
    setOpenDialog,
  };
}
