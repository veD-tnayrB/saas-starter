import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface IProject {
  id: string;
  name: string;
  color: string;
}

interface IProjectSwitcherButtonProps
  extends ComponentPropsWithoutRef<typeof Button> {
  selectedProject: IProject | null;
  openPopover: boolean;
  large: boolean;
}

export const ProjectSwitcherButton = forwardRef<
  HTMLButtonElement,
  IProjectSwitcherButtonProps
>(({ selectedProject, openPopover, large, className, ...props }, ref) => {
  const buttonVariant = openPopover ? "secondary" : "ghost";
  const spanClassName = cn(
    "inline-block truncate text-sm font-medium xl:max-w-[120px]",
    large ? "w-full" : "max-w-[80px]",
  );

  return (
    <Button
      ref={ref}
      className={cn("h-8 px-2", className)}
      variant={buttonVariant}
      type="button"
      aria-expanded={openPopover}
      {...props}
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
              <span className={spanClassName}>{selectedProject.name}</span>
            </div>
          </>
        )}
      </div>
      <ChevronsUpDown
        className="size-4 text-muted-foreground"
        aria-hidden="true"
      />
    </Button>
  );
});

ProjectSwitcherButton.displayName = "ProjectSwitcherButton";
