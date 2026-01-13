import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { projectService } from "@/services/projects/project-service";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";

interface ProjectSettingsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    redirect("/login");
  }

  const { projectId } = await params;
  const project = await projectService.getProjectById(projectId, user.id);

  if (!project) {
    redirect("/projects");
  }

  return (
    <>
      <DashboardHeader
        heading="Project Settings"
        text="Manage your project settings and configuration."
      />
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Name</CardTitle>
            <CardDescription>
              Changes to the project name will be reflected across your
              dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{project.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              ID: {project.id}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions for this project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="cursor-not-allowed text-sm text-destructive underline">
              Delete Project
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
