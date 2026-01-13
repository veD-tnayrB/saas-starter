import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";

interface IProject {
  id: string;
  name: string;
  createdAt: Date;
}

interface IProjectCardProps {
  project: IProject;
}

export function ProjectCard({ project }: IProjectCardProps) {
  const formattedDate = new Date(project.createdAt).toLocaleDateString();

  return (
    <Link
      href={`/project/${project.id}/dashboard`}
      prefetch={false}
      className="group block"
    >
      <Card className="transition-silver hover-lift h-full border-border/40 hover:border-primary/40 hover:shadow-silver/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icons.package
              className="h-5 w-5 text-primary"
              style={{ stroke: "var(--primary)" }}
            />
            <CardTitle className="text-lg text-foreground">
              {project.name}
            </CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Created {formattedDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center justify-between rounded-md border border-border bg-secondary/80 px-4 py-2 text-sm font-semibold text-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            <span>Open Project</span>
            <Icons.arrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              style={{ stroke: "currentColor" }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
