
import { redirect } from "next/navigation";
import Link from "next/link";
import { projectService } from "@/services/projects";
import { getCurrentUser } from "@/repositories/auth/session";

import { PROJECT_ROLES } from "@/lib/project-roles";
import { CreateProjectButton } from "@/components/dashboard/projects/create-project-button";
import { ProjectCard, IProjectCardData } from "@/components/dashboard/projects/card";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardHeader } from "@/components/dashboard/header";
import { TooltipProvider } from "@/components/ui/tooltip"; // Import TooltipProvider

function ProjectSelectionList({ projects }: { projects: IProjectCardData[] }) {
  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Link href={`/project/${project.id}/dashboard`} key={project.id} className="block">
          <ProjectCard {...project} />
        </Link>
      ))}
    </div>
  );
}

export async function ProjectRedirector() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const projects = await projectService.getUserProjects(user.id);

    if (projects.length === 0) {
      // No projects found, show empty state with CTA
      return (
        <EmptyState
          title="No projects found"
          description="You don't have any projects yet. Start by creating a new one."
          actionComponent={<CreateProjectButton />} // Use the new prop
        />
      );
    }

    const transformedProjects: IProjectCardData[] = projects.map((p) => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      planName: p.subscriptionPlan?.displayName || "Free",
      ownerName: p.owner.name || "Unknown",
      isOwner: p.userRole === PROJECT_ROLES.OWNER,
    }));

    return (
      <TooltipProvider delayDuration={200}> {/* Wrap with TooltipProvider */}
        <div className="flex flex-col gap-8">
          <DashboardHeader
            heading="Select a Project"
            text="You have access to multiple projects. Please select one to continue."
          />
          <ProjectSelectionList projects={transformedProjects} />
        </div>
      </TooltipProvider>
    );
  } catch (error) {
    console.error("Failed to fetch user projects:", error);
    return (
      <EmptyState
        title="Error"
        description="We couldn't fetch your projects. Please try again later."
      />
    );
  }
}
