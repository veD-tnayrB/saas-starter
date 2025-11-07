import { redirect } from "next/navigation";
import { getCurrentUser } from "@/repositories/auth/session";
import { findAllUserProjects } from "@/repositories/projects";

export default async function DashboardRedirectPage() {
  const user = await getCurrentUser();
  console.log("user: ", user);
  if (!user) redirect("/login");

  const projects = await findAllUserProjects(user.id);
  console.log("projects", projects);

  if (projects.length === 0) {
    redirect("/dashboard/settings");
  }

  // Redirect to first project
  redirect(`/dashboard/${projects[0].id}`);
}
