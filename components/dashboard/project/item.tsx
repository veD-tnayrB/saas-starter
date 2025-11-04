import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface IProject {
  id: string;
  name: string;
  color: string;
}

interface IProjectItemProps {
  project: IProject;
  isSelected: boolean;
  onSelect: (projectId: string) => void;
}

export function ProjectItem({
  project,
  isSelected,
  onSelect,
}: IProjectItemProps) {
  const textClass = isSelected ? "font-medium text-foreground" : "font-normal";

  return (
    <button
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "relative flex h-9 items-center gap-3 p-3 text-left text-muted-foreground hover:text-foreground",
      )}
      onClick={() => onSelect(project.id)}
    >
      <div className={cn("size-3 shrink-0 rounded-full", project.color)} />
      <span className={cn("flex-1 truncate text-sm", textClass)}>
        {project.name}
      </span>
      {isSelected && (
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground">
          <Check size={18} aria-hidden="true" />
        </span>
      )}
    </button>
  );
}
