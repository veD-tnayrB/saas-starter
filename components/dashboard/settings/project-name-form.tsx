"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProjectNameAction } from "@/actions/projects/project-settings-actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectNameFormProps {
  projectId: string;
  currentName: string;
}

export function ProjectNameForm({
  projectId,
  currentName,
}: ProjectNameFormProps) {
  const [name, setName] = useState(currentName);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name === currentName) {
      toast.info("No changes to save");
      return;
    }

    startTransition(async () => {
      const result = await updateProjectNameAction(projectId, name);

      if (result.success) {
        toast.success("Project name updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update project name");
        setName(currentName); // Reset on error
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="project-name">Project Name</Label>
        <Input
          id="project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name"
          maxLength={100}
          disabled={isPending}
        />
      </div>
      <Button
        type="submit"
        disabled={isPending || name === currentName || !name.trim()}
      >
        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
