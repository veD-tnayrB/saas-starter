import Link from "next/link";

import { Button } from "@/components/ui/button";
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
    <Link href={`/project/${project.id}/dashboard`} prefetch={false}>
      <Card className="transition-silver hover-lift hover:border-primary/50 hover:shadow-silver/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icons.package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
          <CardDescription>Created {formattedDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            Open Project
            <Icons.arrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
