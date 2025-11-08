import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";

import { IProjectCardData, ProjectCard } from "./card";

interface IProjectsListProps {
  projects: IProjectCardData[];
  onCreateProject?: () => void;
}

export function ProjectsList({
  projects,
  onCreateProject,
}: IProjectsListProps) {
  if (projects.length === 0) {
    return (
      <Card className="border-border bg-card/60 backdrop-blur">
        <CardHeader>
          <h3 className="text-base font-semibold text-foreground">
            No projects yet
          </h3>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          You are not a member of any projects. Create a new project or accept
          an invitation to get started.
        </CardContent>
        {onCreateProject && (
          <div className="border-t border-border px-4 py-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onCreateProject}
            >
              <Icons.add className="mr-2 size-4" />
              Create your first project
            </Button>
          </div>
        )}
      </Card>
    );
  }

  const sortedProjects = [...projects].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const projectCards = sortedProjects.map(function mapProject(project) {
    return <ProjectCard key={project.id} {...project} />;
  });

  return <div className="space-y-3">{projectCards}</div>;
}
