import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { findAllUserProjects } from "@/repositories/projects";

import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProjectsEmpty } from "@/components/dashboard/projects-empty";
import { ProjectsList } from "@/components/dashboard/projects-list";

export const metadata = constructMetadata({
  title: "Dashboard – SaaS Starter",
  description: "Manage your projects and collaborate with your team.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await findAllUserProjects(user.id);

  if (projects.length === 1) {
    redirect(`/dashboard/${projects[0].id}`);
  }

  const hasProjects = projects.length > 0;
  const projectCountText = projects.length === 1 ? "project" : "projects";
  const headerText = hasProjects
    ? `You have ${projects.length} ${projectCountText}. Select one to get started.`
    : "You don't have any projects yet.";

  const content = hasProjects ? (
    <ProjectsList projects={projects} />
  ) : (
    <ProjectsEmpty />
  );

  return (
    <>
      <DashboardHeader heading="My Projects" text={headerText} />
      {content}
    </>
  );
}
