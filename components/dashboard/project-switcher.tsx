"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useSession } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IProject {
  id: string;
  name: string;
  color: string;
}

// Color palette for project indicators
const projectColors = [
  "bg-primary",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-cyan-500",
];

// Generate a consistent color for a project based on its ID
function getProjectColor(projectId: string, index: number): string {
  // Simple hash function to get consistent color
  const hash = projectId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return projectColors[Math.abs(hash) % projectColors.length];
}

export function ProjectSwitcher({ large = false }: { large?: boolean }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [openPopover, setOpenPopover] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [projectName, setProjectName] = useState("");

  // Extract current project ID from pathname
  const currentProjectId = pathname?.match(/\/dashboard\/([^/]+)/)?.[1] || null;

  // Fetch projects
  useEffect(() => {
    if (status === "loading") return;

    async function fetchProjects() {
      try {
        setLoading(true);
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        const formattedProjects: IProject[] = data.projects.map(
          (project: any, index: number) => ({
            id: project.id,
            name: project.name,
            color: getProjectColor(project.id, index),
          }),
        );
        setProjects(formattedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [status]);

  // Find current project
  const currentProject = currentProjectId
    ? projects.find((p) => p.id === currentProjectId)
    : null;

  // Default to first project if no current project selected
  const selectedProject = currentProject || projects[0];

  const handleCreateProject = async () => {
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

      // Refresh projects list
      const projectsResponse = await fetch("/api/projects");
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        const formattedProjects: IProject[] = projectsData.projects.map(
          (project: any, index: number) => ({
            id: project.id,
            name: project.name,
            color: getProjectColor(project.id, index),
          }),
        );
        setProjects(formattedProjects);
      }

      // Close dialog and navigate to new project
      setOpenDialog(false);
      setProjectName("");
      router.push(`/dashboard/${data.project.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating project:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create project",
      );
    } finally {
      setCreating(false);
    }
  };

  if (status === "loading" || loading) {
    return <ProjectSwitcherPlaceholder />;
  }

  if (projects.length === 0) {
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
          onCreate={handleCreateProject}
          creating={creating}
        />
      </>
    );
  }

  return (
    <>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button
            className="h-8 px-2"
            variant={openPopover ? "secondary" : "ghost"}
          >
            <div className="flex items-center space-x-3 pr-2">
              {selectedProject && (
                <>
                  <div
                    className={cn(
                      "size-3 shrink-0 rounded-full",
                      selectedProject.color,
                    )}
                  />
                  <div className="flex items-center space-x-3">
                    <span
                      className={cn(
                        "inline-block truncate text-sm font-medium xl:max-w-[120px]",
                        large ? "w-full" : "max-w-[80px]",
                      )}
                    >
                      {selectedProject.name}
                    </span>
                  </div>
                </>
              )}
            </div>
            <ChevronsUpDown
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          </Button>
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

function ProjectList({
  projects,
  selectedProjectId,
  setOpenPopover,
  onNewProject,
}: {
  projects: IProject[];
  selectedProjectId: string | null;
  setOpenPopover: (open: boolean) => void;
  onNewProject: () => void;
}) {
  const router = useRouter();

  const handleProjectSelect = (projectId: string) => {
    setOpenPopover(false);
    router.push(`/dashboard/${projectId}`);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-1">
      {projects.map((project) => {
        const isSelected = project.id === selectedProjectId;
        return (
          <button
            key={project.id}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "relative flex h-9 items-center gap-3 p-3 text-left text-muted-foreground hover:text-foreground",
            )}
            onClick={() => handleProjectSelect(project.id)}
          >
            <div
              className={cn("size-3 shrink-0 rounded-full", project.color)}
            />
            <span
              className={cn(
                "flex-1 truncate text-sm",
                isSelected ? "font-medium text-foreground" : "font-normal",
              )}
            >
              {project.name}
            </span>
            {isSelected && (
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground">
                <Check size={18} aria-hidden="true" />
              </span>
            )}
          </button>
        );
      })}
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

function CreateProjectDialog({
  open,
  onOpenChange,
  projectName,
  onProjectNameChange,
  onCreate,
  creating,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onCreate: () => void;
  creating: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project to organize your work and collaborate with your
            team.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="My Awesome Project"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && projectName.trim() && !creating) {
                  onCreate();
                }
              }}
              disabled={creating}
              maxLength={100}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={!projectName.trim() || creating}>
            {creating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProjectSwitcherPlaceholder() {
  return (
    <div className="flex animate-pulse items-center space-x-1.5 rounded-lg px-1.5 py-2 sm:w-60">
      <div className="h-8 w-36 animate-pulse rounded-md bg-muted xl:w-[180px]" />
    </div>
  );
}
