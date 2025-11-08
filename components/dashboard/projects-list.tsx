import { ProjectCard } from "./project-card";

interface IProject {
  id: string;
  name: string;
  createdAt: Date;
}

interface IProjectsListProps {
  projects: IProject[];
  currentProjectId?: string;
}

export function ProjectsList({ projects }: IProjectsListProps) {
  const projectCards = projects.map((project) => (
    <ProjectCard key={project.id} project={project} />
  ));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projectCards}
    </div>
  );
}
