import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { memberService } from "@/services/projects/member-service";
import { projectService } from "@/services/projects/project-service";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProjectBilling } from "@/components/dashboard/project-billing";
import { DeleteProjectDialog } from "@/components/dashboard/settings/delete-project-dialog";
import { ProjectNameForm } from "@/components/dashboard/settings/project-name-form";

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

  let project;
  try {
    project = await projectService.getProjectById(projectId, user.id);
  } catch (error) {
    redirect("/project");
  }

  if (!project) {
    redirect("/project");
  }

  // Get user's role to determine permissions
  const userRole = await memberService.getUserRole(projectId, user.id);
  const isOwner = userRole === "OWNER";

  return (
    <>
      <DashboardHeader
        heading="Project Settings"
        text="Manage your project settings and configuration."
      />
      <div className="grid gap-8">
        {/* Project Name */}
        <Card>
          <CardHeader>
            <CardTitle>Project Name</CardTitle>
            <CardDescription>
              Update your project name. Changes will be reflected across your
              dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectNameForm projectId={projectId} currentName={project.name} />
            <p className="mt-4 text-sm text-muted-foreground">
              Project ID: {project.id}
            </p>
          </CardContent>
        </Card>

        {/* Subscription Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              Manage your project's subscription plan and billing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectBilling
              projectId={projectId}
              currentPlanId={project.subscriptionPlanId || undefined}
            />
          </CardContent>
        </Card>

        {/* Danger Zone - Only visible to OWNER */}
        {isOwner && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions for this project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Delete this project</h4>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Once you delete a project, there is no going back. Please be
                    certain.
                  </p>
                  <DeleteProjectDialog
                    projectId={projectId}
                    projectName={project.name}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
