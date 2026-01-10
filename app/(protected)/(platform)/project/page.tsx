import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { findAllUserProjects } from "@/repositories/projects";

export default async function DashboardRedirectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await findAllUserProjects(user.id);

  if (projects.length === 0) {
    redirect("/projects");
  }

  // Redirect to first project
  redirect(`/project/${projects[0].id}/dashboard`);
}
