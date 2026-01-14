import { redirect } from "next/navigation";
import { getActivePlansAction } from "@/actions/projects/get-active-plans";
import { getCurrentUser } from "@/repositories/auth/session";
import { isUserProjectOwner } from "@/services/projects/is-user-project-owner";
import { projectService } from "@/services/projects/project-service";
import { getProjectSubscriptionPlan } from "@/services/subscriptions";
import { transformRepositoryPlanToPublicPlan } from "@/config/plans"; // Import the transformation function

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

  // Authorize access: only project owners can access this page
  const isOwner = await isUserProjectOwner(user.id, projectId);
  if (!isOwner) {
    redirect(`/project/${projectId}/dashboard`);
  }

  // Get project data (safe to fetch, user is authorized)
  const project = await projectService.getProjectById(projectId, user.id);
  if (!project) {
    redirect("/project");
  }

  const [allPlansResponse, userSubscriptionPlan] = await Promise.all([
    getActivePlansAction(),
    getProjectSubscriptionPlan(projectId, user.id),
  ]);

  const transformedPlans = allPlansResponse.plans.map(transformRepositoryPlanToPublicPlan);

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
              plans={transformedPlans} // Pass the transformed plans
              userSubscriptionPlan={userSubscriptionPlan}
            />
          </CardContent>
        </Card>

        {/* Danger Zone - Only visible to OWNER */}
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
      </div>
    </>
  );
}
